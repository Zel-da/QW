import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, g, current_app
from passlib.hash import pbkdf2_sha256 as sha256
from .. import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Handles user login and issues a JWT."""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500
    
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, password_hash FROM Users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if user and sha256.verify(password, user.password_hash):
            cursor.execute("UPDATE Users SET last_login = GETDATE() WHERE username = ?", (username,))
            conn.commit()
            
            token = jwt.encode({
                'user_id': user.id,
                'username': username,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, current_app.config['SECRET_KEY'], algorithm="HS256")

            return jsonify({"message": "Login successful", "token": token, "user": {'user_id': user.id, 'username': username}}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({"message": "Token is missing or malformed!"}), 401

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            g.current_user = {'user_id': data['user_id'], 'username': data['username']}
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid!"}), 401
        
        return f(*args, **kwargs)
    return decorated
