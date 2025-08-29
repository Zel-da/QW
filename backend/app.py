
import os
import pyodbc
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from passlib.hash import pbkdf2_sha256 as sha256
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'dist'))
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

@app.route('/inspections', methods=['POST'])
def add_inspection():
    """Adds a new inspection record to the database securely."""
    data = request.get_json()

    # 1. 데이터 유효성 검사
    required_fields = ['company_name', 'product_name', 'product_code', 'inspected_quantity', 'defective_quantity']
    if not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({"message": "필수 항목이 누락되었습니다."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500
    
    cursor = conn.cursor()

    try:
        # 2. 트랜잭션 시작
        conn.autocommit = False

        # 3. 업체(Company) ID 확인 또는 생성
        company_name = data['company_name']
        cursor.execute("SELECT id FROM Companies WHERE company_name = ?", (company_name,))
        company = cursor.fetchone()
        if company:
            company_id = company.id
        else:
            # OUTPUT INSERTED.id를 사용하여 더 안정적으로 새 ID를 가져옵니다.
            sql_insert_company = "INSERT INTO Companies (company_name) OUTPUT INSERTED.id VALUES (?)"
            cursor.execute(sql_insert_company, (company_name,))
            company_id = cursor.fetchone()[0]

        # 4. 제품(Product) ID 확인 또는 생성
        product_name = data['product_name']
        product_code = data['product_code']
        cursor.execute("SELECT id FROM Products WHERE product_code = ?", (product_code,))
        product = cursor.fetchone()
        if product:
            product_id = product.id
        else:
            # OUTPUT INSERTED.id를 사용하여 더 안정적으로 새 ID를 가져옵니다.
            sql_insert_product = "INSERT INTO Products (product_name, product_code) OUTPUT INSERTED.id VALUES (?, ?)"
            cursor.execute(sql_insert_product, (product_name, product_code))
            product_id = cursor.fetchone()[0]
        
        # 5. 검수(Inspection) 데이터 추가
        params = (
            company_id,
            product_id,
            data.get('user_id', 1), # TODO: 실제 인증된 사용자 ID로 교체 필요
            data.get('inspected_quantity'),
            data.get('defective_quantity'),
            data.get('actioned_quantity'),
            data.get('defect_reason'),
            data.get('solution'),
            data.get('target_date'),
            data.get('progress_percentage', 0)
        )
        
        insert_query = """
            INSERT INTO Inspections 
            (company_id, product_id, user_id, inspected_quantity, defective_quantity, actioned_quantity, 
             defect_reason, solution, target_date, progress_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(insert_query, params)
        
        # 6. 트랜잭션 커밋
        conn.commit()
        
        return jsonify({"message": "검수 데이터가 성공적으로 추가되었습니다."}), 201

    except pyodbc.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return jsonify({"message": f"데이터베이스 오류가 발생했습니다: {e}"}), 500
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
        return jsonify({"message": f"서버 오류가 발생했습니다: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

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