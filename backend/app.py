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

# --- CORS 설정 (디버깅용) ---
# 특정 Vercel 주소 하나만 명시적으로 허용
CORS(
    app, 
    origins=["https://qw-jm1f8ijam-ahnyejuns-projects.vercel.app"], 
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
        print(f"Database connection error: {e}")
        return None

# == JWT Token Decorator ==
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
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

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

@app.route('/inspections', methods=['POST'])
@token_required
def add_inspection(current_user):
    data = request.get_json()
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        conn.autocommit = False
        company_name = data['company_name']
        cursor.execute("SELECT id FROM Companies WHERE company_name = ?", (company_name,))
        company = cursor.fetchone()
        if company:
            company_id = company.id
        else:
            sql_insert_company = "INSERT INTO Companies (company_name) OUTPUT INSERTED.id VALUES (?)"
            cursor.execute(sql_insert_company, (company_name,))
            company_id = cursor.fetchone()[0]

        product_name = data['product_name']
        product_code = data['product_code']
        cursor.execute("SELECT id FROM Products WHERE product_code = ?", (product_code,))
        product = cursor.fetchone()
        if product:
            product_id = product.id
        else:
            sql_insert_product = "INSERT INTO Products (product_name, product_code) OUTPUT INSERTED.id VALUES (?, ?)"
            cursor.execute(sql_insert_product, (product_name, product_code))
            product_id = cursor.fetchone()[0]

        params = (
            company_id, product_id, current_user['id'],
            data.get('inspected_quantity'), data.get('defective_quantity'),
            data.get('actioned_quantity'), data.get('defect_reason'),
            data.get('solution'), data.get('target_date'),
            data.get('progress_percentage', 0)
        )
        insert_query = """
            INSERT INTO Inspections (company_id, product_id, user_id, inspected_quantity, defective_quantity, actioned_quantity, defect_reason, solution, target_date, progress_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(insert_query, params)
        conn.commit()
        return jsonify({"message": "검수 데이터가 성공적으로 추가되었습니다."}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/inspections/<int:id>', methods=['PUT'])
@token_required
def update_inspection(current_user, id):
    data = request.get_json()
    update_fields = ['inspected_quantity', 'defective_quantity', 'actioned_quantity', 'defect_reason', 'solution', 'target_date', 'progress_percentage']
    set_clause = ", ".join([f"{field} = ?" for field in update_fields])
    params = [data.get(field) for field in update_fields]
    params.append(id)
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        query = f"UPDATE Inspections SET {set_clause} WHERE id = ?"
        cursor.execute(query, tuple(params))
        conn.commit()
        return jsonify({"message": "Inspection updated successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/inspections/<int:id>', methods=['DELETE'])
@token_required
def delete_inspection(current_user, id):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Inspections WHERE id = ?", (id,))
        conn.commit()
        return jsonify({"message": "Inspection deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/companies', methods=['GET'])
@token_required
def get_companies(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, company_name FROM Companies ORDER BY company_name")
        companies = [{"id": row.id, "company_name": row.company_name} for row in cursor.fetchall()]
        return jsonify(companies)
    finally:
        cursor.close()
        conn.close()

@app.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username FROM Users ORDER BY username")
        users = [{"id": row.id, "username": row.username} for row in cursor.fetchall()]
        return jsonify(users)
    finally:
        cursor.close()
        conn.close()

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
