
import os
import pyodbc
from flask import Flask, request, jsonify
from flask_cors import CORS
from passlib.hash import pbkdf2_sha256 as sha256
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load configuration from environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
DATABASE_URI = os.getenv('DATABASE_URI')

def get_db_connection():
    """Establishes a connection to the MSSQL database."""
    try:
        conn = pyodbc.connect(DATABASE_URI)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.route('/')
def index():
    return "Backend server is running."

# == User Authentication Endpoints ==
@app.route('/login', methods=['POST'])
def login():
    """Handles user login."""
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
        cursor.execute("SELECT password_hash FROM Users WHERE username = ?", (username,))
        user = cursor.fetchone()

        if user and sha256.verify(password, user.password_hash):
            # In a real app, you'd create a session token (JWT) here
            cursor.execute("UPDATE Users SET last_login = GETDATE() WHERE username = ?", (username,))
            conn.commit()
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# == Inspections Endpoints ==
@app.route('/inspections', methods=['GET'])
def get_inspections():
    """Retrieves and returns all inspection records with joined data."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        # 새로운 컬럼들을 SELECT 목록에 추가합니다.
        query = """
            SELECT
                i.id,
                u.username,
                c.company_name,
                p.product_name,
                p.product_code,
                i.inspected_quantity,
                i.defective_quantity,
                i.actioned_quantity,
                i.defect_reason,
                i.solution,
                i.received_date,
                i.target_date,
                i.progress_percentage
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

        return jsonify(inspections), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# 기존 add_inspection 함수를 삭제하고 아래 최종 코드로 교체하세요.
@app.route('/inspections', methods=['POST'])
def add_inspection():
    """Generates an SQL query string instead of executing it."""
    data = request.get_json()

    required_fields = ['company_name', 'product_name', 'product_code', 'inspected_quantity', 'defective_quantity']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "필수 항목이 누락되었습니다."}), 400

    try:
        # == 데이터 타입 명시적 변환 및 SQL용 '' 처리 ==
        company_name = str(data.get('company_name', '')).replace("'", "''")
        product_name = str(data.get('product_name', '')).replace("'", "''")
        product_code = str(data.get('product_code', '')).replace("'", "''")
        user_id = int(data.get('user_id', 1))
        inspected = int(data.get('inspected_quantity') or 0)
        defective = int(data.get('defective_quantity') or 0)
        actioned = int(data.get('actioned_quantity') or 0)
        defect_reason = str(data.get('defect_reason', '')).replace("'", "''")
        solution = str(data.get('solution', '')).replace("'", "''")
        target_date = data.get('target_date')
        if not target_date: target_date = 'NULL'
        else: target_date = f"'{target_date}'"
        progress = int(data.get('progress_percentage', 0))

        # == 실행할 SQL 구문 생성 ==
        # 1. 업체 확인 및 추가
        # 2. 제품 확인 및 추가
        # 3. 불량 내역 추가
        sql_query_to_run = f"""
-- 1. 업체 확인 및 추가
IF NOT EXISTS (SELECT 1 FROM Companies WHERE company_name = '{company_name}')
BEGIN
    INSERT INTO Companies (company_name) VALUES ('{company_name}');
END

-- 2. 제품 확인 및 추가
IF NOT EXISTS (SELECT 1 FROM Products WHERE product_code = '{product_code}')
BEGIN
    INSERT INTO Products (product_name, product_code) VALUES ('{product_name}', '{product_code}');
END

-- 3. 최종 불량 내역 추가
INSERT INTO Inspections
(company_id, product_id, user_id, inspected_quantity, defective_quantity, actioned_quantity,
defect_reason, solution, target_date, progress_percentage)
VALUES
((SELECT id FROM Companies WHERE company_name = '{company_name}'),
 (SELECT id FROM Products WHERE product_code = '{product_code}'),
 {user_id}, {inspected}, {defective}, {actioned},
 '{defect_reason}', '{solution}', {target_date}, {progress});
"""
        # 생성된 SQL 쿼리를 프론트엔드로 보냄
        return jsonify({"sql_query": sql_query_to_run}), 200

    except Exception as e:
        print(f"An error occurred during SQL generation: {e}")
        return jsonify({"message": f"An error occurred during SQL generation: {e}"}), 500

@app.route('/inspections/<int:id>', methods=['PUT'])
def update_inspection(id):
    """Updates an existing inspection record."""
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
        return jsonify({"message": "Inspection updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/inspections/<int:id>', methods=['DELETE'])
def delete_inspection(id):
    """Deletes an inspection record."""
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Inspections WHERE id = ?", (id,))
        conn.commit()
        return jsonify({"message": "Inspection deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# == File Upload Endpoints ==
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/inspections/<int:id>/upload', methods=['POST'])
def upload_file(id):
    if 'file' not in request.files: return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '': return jsonify({"message": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{id}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        ext = filename.rsplit('.', 1)[1].lower()
        column_to_update = 'image_path' if ext in {'png', 'jpg', 'jpeg', 'gif'} else 'excel_path'
        conn = get_db_connection()
        if not conn: return jsonify({"message": "Database connection failed"}), 500
        cursor = conn.cursor()
        try:
            query = f"UPDATE Inspections SET {column_to_update} = ? WHERE id = ?"
            cursor.execute(query, (filename, id))
            conn.commit()
            return jsonify({"message": "File uploaded successfully", "filePath": filename}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({"message": f"DB update failed: {e}"}), 500
        finally:
            cursor.close()
            conn.close()
    return jsonify({"message": "File type not allowed"}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# == Filter Data Endpoints ==
@app.route('/companies', methods=['GET'])
def get_companies():
    """Retrieves all unique company names."""
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, company_name FROM Companies ORDER BY company_name")
        companies = [{"id": row.id, "company_name": row.company_name} for row in cursor.fetchall()]
        return jsonify(companies), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/users', methods=['GET'])
def get_users():
    """Retrieves all unique user names."""
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username FROM Users ORDER BY username")
        users = [{"id": row.id, "username": row.username} for row in cursor.fetchall()]
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

# 이 블록은 항상 파일의 맨 마지막에 위치해야 합니다.
if __name__ == '__main__':
    # Note: Use a proper WSGI server like Gunicorn or Waitress in production
    app.run(debug=True, port=5000)