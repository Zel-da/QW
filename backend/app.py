import os
import pyodbc
import jwt
import re
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from passlib.hash import pbkdf2_sha256 as sha256
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'inspection_front', 'dist'))

# --- CORS 설정 ---
vercel_origin_pattern = re.compile(r"https://.*\.vercel\.app")
CORS(
    app,
    origins=vercel_origin_pattern,
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"]
)
# --- CORS 설정 끝 ---

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or 'a-very-secret-key'
DATABASE_URI = os.getenv('DATABASE_URI')

def get_db_connection():
    try:
        conn = pyodbc.connect(DATABASE_URI)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}", flush=True)
        return None

# == JWT Token Decorator (Definition moved up) ==
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'authorization' in request.headers:
            auth_header = request.headers['authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            secret = app.config['SECRET_KEY']
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = {'id': data['user_id'], 'username': data['username']}
        except Exception as e:
            return jsonify({'message': f'Token is invalid! Error: {e}'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# == 디버깅용 엔드포인트 ==
@app.route('/debug-headers')
@token_required
def debug_headers(current_user):
    return jsonify({
        "message": "Debug successful",
        "received_headers": dict(request.headers),
        "decoded_user": current_user
    })

# == User Authentication Endpoints ==
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, password_hash FROM Users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if user and sha256.verify(password, user.password_hash):
            token = jwt.encode({
                'user_id': user.id,
                'username': username,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            cursor.execute("UPDATE Users SET last_login = NOW() WHERE username = ?", (username,))
            conn.commit()
            return jsonify({'message': 'Login successful', 'token': token})
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# == Other Endpoints (Protected) ==
@app.route('/inspections', methods=['GET'])
@token_required
def get_inspections(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        query = """
            SELECT i.id, u.username, c.company_name, p.product_name, p.product_code,
                   i.inspected_quantity, i.defective_quantity, i.actioned_quantity,
                   i.defect_reason, i.solution, i.received_date, i.target_date, i.progress_percentage
            FROM Inspections i
            JOIN Users u ON i.user_id = u.id
            JOIN Companies c ON i.company_id = c.id
            JOIN Products p ON i.product_id = p.id
            ORDER BY i.received_date DESC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        inspections = [dict(zip(columns, row)) for row in rows]
        return jsonify(inspections)
    finally:
        cursor.close()
        conn.close()

# ... (The rest of the API endpoints remain the same)

# == Serve React App ==
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)