import os
import psycopg2
import psycopg2.extras
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
CORS(
    app,
    origins=["https://qw-tau.vercel.app", "http://localhost:5173"], # Vercel 배포 주소와 로컬 개발 주소 명시
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"]
)
# --- CORS 설정 끝 ---

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or 'a-very-secret-key'
DATABASE_URI = os.getenv('DATABASE_URI')

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URI)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}", flush=True)
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
        except Exception as e:
            return jsonify({'message': f'Token is invalid! Error: {e}'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# == User Authentication Endpoints ==
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT id, password_hash FROM Users WHERE username = %s", (username,))
            user = cursor.fetchone()

            if user and sha256.verify(password, user['password_hash']):
                token = jwt.encode({
                    'user_id': user['id'],
                    'username': username,
                    'exp': datetime.utcnow() + timedelta(hours=24)
                }, app.config['SECRET_KEY'], algorithm="HS256")
                
                cursor.execute("UPDATE Users SET last_login = NOW() WHERE username = %s", (username,))
                conn.commit()
                return jsonify({'message': 'Login successful', 'token': token})
            else:
                return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

# == Inspections Endpoints ==
@app.route('/api/inspections', methods=['GET'])
@token_required
def get_inspections(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT i.id, u.username, c.company_name, p.product_name, p.product_code,
                       i.inspected_quantity, i.defective_quantity, i.status,
                       i.defect_reason, i.solution, i.target_date, i.progress_percentage, i.created_at
                FROM Inspections i
                JOIN Users u ON i.user_id = u.id
                JOIN Companies c ON i.company_id = c.id
                JOIN Products p ON i.product_id = p.id
                ORDER BY i.created_at DESC;
            """
            cursor.execute(query)
            inspections = cursor.fetchall()
            return jsonify(inspections)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/my-inspections', methods=['GET'])
@token_required
def get_my_inspections(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT i.id, u.username, c.company_name, p.product_name, p.product_code,
                       i.inspected_quantity, i.defective_quantity, i.status,
                       i.defect_reason, i.solution, i.target_date, i.progress_percentage, i.created_at
                FROM Inspections i
                JOIN Users u ON i.user_id = u.id
                JOIN Companies c ON i.company_id = c.id
                JOIN Products p ON i.product_id = p.id
                WHERE i.user_id = %s
                ORDER BY i.created_at DESC;
            """
            cursor.execute(query, (current_user['id'],))
            inspections = cursor.fetchall()
            return jsonify(inspections)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/inspections', methods=['POST'])
@token_required
def add_inspection(current_user):
    data = request.get_json()
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            # Company ID
            company_name = data['company_name']
            cursor.execute("SELECT id FROM Companies WHERE company_name = %s", (company_name,))
            company = cursor.fetchone()
            if company:
                company_id = company['id']
            else:
                cursor.execute("INSERT INTO Companies (company_name) VALUES (%s) RETURNING id", (company_name,))
                company_id = cursor.fetchone()['id']

            # Product ID
            product_name = data['product_name']
            product_code = data['product_code']
            cursor.execute("SELECT id FROM Products WHERE product_code = %s", (product_code,))
            product = cursor.fetchone()
            if product:
                product_id = product['id']
            else:
                cursor.execute("INSERT INTO Products (product_name, product_code) VALUES (%s, %s) RETURNING id", (product_name, product_code))
                product_id = cursor.fetchone()['id']

            # Insert Inspection
            params = (
                company_id, product_id, current_user['id'],
                data.get('inspected_quantity'), data.get('defective_quantity'),
                data.get('defect_reason'), data.get('solution'), 
                data.get('target_date'), data.get('progress_percentage', 0),
                data.get('status', 'inProgress')
            )
            insert_query = """
                INSERT INTO Inspections (company_id, product_id, user_id, inspected_quantity, defective_quantity, defect_reason, solution, target_date, progress_percentage, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, params)
            conn.commit()
            return jsonify({"message": "검수 데이터가 성공적으로 추가되었습니다."}), 201
    except Exception as e:
        conn.rollback()
        print(f"Error in add_inspection: {e}", flush=True) # Detailed error logging
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/inspections/<int:id>', methods=['GET'])
@token_required
def get_inspection_detail(current_user, id):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT i.*, u.username, c.company_name, p.product_name, p.product_code
                FROM Inspections i
                JOIN Users u ON i.user_id = u.id
                JOIN Companies c ON i.company_id = c.id
                JOIN Products p ON i.product_id = p.id
                WHERE i.id = %s;
            """
            cursor.execute(query, (id,))
            inspection = cursor.fetchone()
            if not inspection:
                return jsonify({"message": "Inspection not found"}), 404
            return jsonify(inspection)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/inspections/<int:id>', methods=['PUT'])
@token_required
def update_inspection(current_user, id):
    data = request.get_json()
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    
    # A dictionary to map field names to human-readable names
    field_names = {
        'inspected_quantity': '검사수량',
        'defective_quantity': '불량수량',
        'defect_reason': '불량 원인',
        'solution': '해결 방안',
        'target_date': '조치 목표일',
        'progress_percentage': '진행률',
        'status': '상태'
    }
    
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            # Step 1: Get current state of the item
            cursor.execute("SELECT * FROM Inspections WHERE id = %s", (id,))
            old_item = cursor.fetchone()

            if not old_item:
                return jsonify({"message": "Inspection not found"}), 404
            # Author verification
            if old_item['user_id'] != current_user['id']:
                return jsonify({"message": "Permission denied"}), 403

            # Step 2: Update the item
            update_fields = [f for f in field_names.keys() if f in data]
            if not update_fields:
                return jsonify({"message": "No update fields provided"}), 400

            set_clause = ", ".join([f"{field} = %s" for field in update_fields])
            set_clause += ", updated_at = NOW()"
            params = [data.get(field) for field in update_fields]
            params.append(id)
            
            query = f"UPDATE Inspections SET {set_clause} WHERE id = %s"
            cursor.execute(query, tuple(params))

            # Step 3: Log changes to Histories table
            for field in update_fields:
                old_value = old_item.get(field)
                new_value = data.get(field)
                
                # To prevent logging for non-changes (e.g. None vs '')
                old_value_str = str(old_value) if old_value is not None else ""
                new_value_str = str(new_value) if new_value is not None else ""

                if old_value_str != new_value_str:
                    field_name_kor = field_names.get(field, field)
                    action_log = f"'{field_name_kor}' 변경 ({old_value_str} -> {new_value_str})"
                    cursor.execute(
                        "INSERT INTO Histories (user_id, parent_id, parent_type, action) VALUES (%s, %s, %s, %s)",
                        (current_user['id'], id, 'inspection', action_log)
                    )

            conn.commit()
            return jsonify({"message": "Inspection updated successfully"})
    except Exception as e:
        conn.rollback()
        # Provide more detailed error in log
        print(f"Error in update_inspection: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/inspections/<int:id>', methods=['DELETE'])
@token_required
def delete_inspection(current_user, id):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            # Author verification
            cursor.execute("SELECT user_id FROM Inspections WHERE id = %s", (id,))
            inspection = cursor.fetchone()
            if not inspection:
                return jsonify({"message": "Inspection not found"}), 404
            if inspection['user_id'] != current_user['id']:
                return jsonify({"message": "Permission denied"}), 403

            cursor.execute("DELETE FROM Inspections WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"message": "Inspection deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/companies', methods=['GET'])
@token_required
def get_companies(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT id, company_name FROM Companies ORDER BY company_name")
            companies = cursor.fetchall()
            return jsonify(companies)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT id, username FROM Users ORDER BY username")
            users = cursor.fetchall()
            return jsonify(users)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

# == Quality Improvement Endpoints ==

@app.route('/api/quality-improvements', methods=['GET'])
@token_required
def get_quality_improvements(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT q.id, u.username, c.company_name, q.item_description, q.status, q.start_date, q.end_date, q.progress
                FROM QualityImprovements q
                JOIN Users u ON q.user_id = u.id
                JOIN Companies c ON q.company_id = c.id
                ORDER BY q.created_at DESC;
            """
            cursor.execute(query)
            items = cursor.fetchall()
            return jsonify(items)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/quality-improvements', methods=['POST'])
@token_required
def add_quality_improvement(current_user):
    data = request.get_json()
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor() as cursor:
            # Get company_id
            company_name = data['company_name']
            cursor.execute("SELECT id FROM Companies WHERE company_name = %s", (company_name,))
            company = cursor.fetchone()
            if company:
                company_id = company[0]
            else:
                cursor.execute("INSERT INTO Companies (company_name) VALUES (%s) RETURNING id", (company_name,))
                company_id = cursor.fetchone()[0]

            query = """
                INSERT INTO QualityImprovements (user_id, company_id, item_description, start_date, end_date, progress, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            params = (
                current_user['id'],
                company_id,
                data.get('item_description'),
                data.get('start_date'),
                data.get('end_date'),
                data.get('progress', 0),
                data.get('status', 'inProgress')
            )
            cursor.execute(query, params)
            conn.commit()
            return jsonify({"message": "Quality improvement item added successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/quality-improvements/<int:id>', methods=['GET'])
@token_required
def get_quality_improvement_detail(current_user, id):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT q.*, u.username, c.company_name
                FROM QualityImprovements q
                JOIN Users u ON q.user_id = u.id
                JOIN Companies c ON q.company_id = c.id
                WHERE q.id = %s;
            """
            cursor.execute(query, (id,))
            item = cursor.fetchone()
            if not item:
                return jsonify({"message": "Item not found"}), 404
            return jsonify(item)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/quality-improvements/<int:id>', methods=['PUT'])
@token_required
def update_quality_improvement(current_user, id):
    data = request.get_json()
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500

    field_names = {
        'item_description': '개선항목',
        'start_date': '시작일',
        'end_date': '마감일',
        'progress': '진행률',
        'status': '상태'
    }

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            # Step 1: Get current state
            cursor.execute("SELECT * FROM QualityImprovements WHERE id = %s", (id,))
            old_item = cursor.fetchone()

            if not old_item:
                return jsonify({"message": "Item not found"}), 404
            if old_item['user_id'] != current_user['id']:
                return jsonify({"message": "Permission denied"}), 403

            # Step 2: Update the item
            update_fields = [f for f in field_names.keys() if f in data]
            if not update_fields:
                return jsonify({"message": "No update fields provided"}), 400
            
            set_clause = ", ".join([f"{field} = %s" for field in update_fields])
            set_clause += ", updated_at = NOW()"
            params = [data.get(field) for field in update_fields]
            params.append(id)

            query = f"UPDATE QualityImprovements SET {set_clause} WHERE id = %s"
            cursor.execute(query, tuple(params))

            # Step 3: Log changes
            for field in update_fields:
                old_value = old_item.get(field)
                new_value = data.get(field)

                old_value_str = str(old_value) if old_value is not None else ""
                new_value_str = str(new_value) if new_value is not None else ""

                if old_value_str != new_value_str:
                    field_name_kor = field_names.get(field, field)
                    action_log = f"'{field_name_kor}' 변경 ({old_value_str} -> {new_value_str})"
                    cursor.execute(
                        "INSERT INTO Histories (user_id, parent_id, parent_type, action) VALUES (%s, %s, %s, %s)",
                        (current_user['id'], id, 'quality', action_log)
                    )

            conn.commit()
            return jsonify({"message": "Quality improvement item updated successfully"})
    except Exception as e:
        conn.rollback()
        print(f"Error in update_quality_improvement: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/quality-improvements/<int:id>', methods=['DELETE'])
@token_required
def delete_quality_improvement(current_user, id):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT user_id FROM QualityImprovements WHERE id = %s", (id,))
            item = cursor.fetchone()
            if not item:
                return jsonify({"message": "Item not found"}), 404
            if item['user_id'] != current_user['id']:
                return jsonify({"message": "Permission denied"}), 403
            
            cursor.execute("DELETE FROM Comments WHERE parent_id = %s AND parent_type = 'quality'", (id,))
            cursor.execute("DELETE FROM Histories WHERE parent_id = %s AND parent_type = 'quality'", (id,))
            cursor.execute("DELETE FROM QualityImprovements WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"message": "Quality improvement item deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/my-quality-improvements', methods=['GET'])
@token_required
def get_my_quality_improvements(current_user):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT q.id, u.username, c.company_name, q.item_description, q.status, q.start_date, q.end_date, q.progress
                FROM QualityImprovements q
                JOIN Users u ON q.user_id = u.id
                JOIN Companies c ON q.company_id = c.id
                WHERE q.user_id = %s
                ORDER BY q.created_at DESC;
            """
            cursor.execute(query, (current_user['id'],))
            items = cursor.fetchall()
            return jsonify(items)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

# == Comments Endpoints ==
@app.route('/api/comments/<parent_type>/<int:parent_id>', methods=['GET'])
@token_required
def get_comments(current_user, parent_type, parent_id):
    if parent_type not in ['inspection', 'quality']:
        return jsonify({"message": "Invalid parent type"}), 400
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT c.id, c.content, c.created_at, c.updated_at, u.username, c.user_id
                FROM Comments c
                JOIN Users u ON c.user_id = u.id
                WHERE c.parent_type = %s AND c.parent_id = %s
                ORDER BY c.created_at ASC;
            """
            cursor.execute(query, (parent_type, parent_id))
            comments = cursor.fetchall()
            return jsonify(comments)
    except Exception as e:
        print(f"Error in get_comments: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/comments', methods=['POST'])
@token_required
def add_comment(current_user):
    data = request.get_json()
    content = data.get('content')
    parent_id = data.get('parent_id')
    parent_type = data.get('parent_type')

    if not all([content, parent_id, parent_type]):
        return jsonify({"message": "Missing required fields"}), 400
    if parent_type not in ['inspection', 'quality']:
        return jsonify({"message": "Invalid parent type"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                INSERT INTO Comments (user_id, parent_id, parent_type, content)
                VALUES (%s, %s, %s, %s) RETURNING id, created_at, updated_at;
            """
            cursor.execute(query, (current_user['id'], parent_id, parent_type, content))
            new_comment = cursor.fetchone()
            conn.commit()
            return jsonify({
                "message": "Comment added successfully",
                "comment": {
                    **new_comment,
                    'username': current_user['username'],
                    'user_id': current_user['id'],
                    'content': content
                }
            }), 201
    except Exception as e:
        conn.rollback()
        print(f"Error in add_comment: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
@token_required
def update_comment(current_user, comment_id):
    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({"message": "Content is required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT user_id FROM Comments WHERE id = %s", (comment_id,))
            comment = cursor.fetchone()
            if not comment:
                return jsonify({"message": "Comment not found"}), 404
            if comment['user_id'] != current_user['id']:
                return jsonify({"message": "Permission denied"}), 403

            cursor.execute(
                "UPDATE Comments SET content = %s, updated_at = NOW() WHERE id = %s RETURNING updated_at",
                (content, comment_id)
            )
            updated_at = cursor.fetchone()['updated_at']
            conn.commit()
            return jsonify({"message": "Comment updated successfully", "updated_at": updated_at})
    except Exception as e:
        conn.rollback()
        print(f"Error in update_comment: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT user_id FROM Comments WHERE id = %s", (comment_id,))
            comment = cursor.fetchone()
            if not comment:
                return jsonify({"message": "Comment not found"}), 404
            if comment['user_id'] != current_user['id']:
                return jsonify({"message": "Permission denied"}), 403

            cursor.execute("DELETE FROM Comments WHERE id = %s", (comment_id,))
            conn.commit()
            return jsonify({"message": "Comment deleted successfully"})
    except Exception as e:
        conn.rollback()
        print(f"Error in delete_comment: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

# == Histories Endpoint ==
@app.route('/api/histories/<parent_type>/<int:parent_id>', methods=['GET'])
@token_required
def get_histories(current_user, parent_type, parent_id):
    if parent_type not in ['inspection', 'quality']:
        return jsonify({"message": "Invalid parent type"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            query = """
                SELECT h.action, h.created_at, u.username
                FROM Histories h
                JOIN Users u ON h.user_id = u.id
                WHERE h.parent_type = %s AND h.parent_id = %s
                ORDER BY h.created_at DESC;
            """
            cursor.execute(query, (parent_type, parent_id))
            histories = cursor.fetchall()
            return jsonify(histories)
    except Exception as e:
        print(f"Error in get_histories: {e}", flush=True)
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

# == User Management Endpoints (Admin Only) ==

def is_admin(current_user):
    return current_user['username'] == 'test'

@app.route('/api/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if not is_admin(current_user):
        return jsonify({"message": "Permission denied"}), 403
    
    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT id, username, last_login FROM Users ORDER BY id")
            users = cursor.fetchall()
            return jsonify(users)
    except Exception as e:
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/users', methods=['POST'])
@token_required
def create_user(current_user):
    if not is_admin(current_user):
        return jsonify({"message": "Permission denied"}), 403
        
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("SELECT id FROM Users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"message": "Username already exists"}), 409 # 409 Conflict

            password_hash = sha256.hash(password)
            cursor.execute("INSERT INTO Users (username, password_hash) VALUES (%s, %s)", (username, password_hash))
            conn.commit()
            return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

@app.route('/api/users/<int:id>', methods=['DELETE'])
@token_required
def delete_user(current_user, id):
    if not is_admin(current_user):
        return jsonify({"message": "Permission denied"}), 403

    # Prevent admin from deleting themselves
    if current_user['id'] == id:
        return jsonify({"message": "Cannot delete your own account"}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    try:
        with conn.cursor() as cursor:
            # Check if user exists before deleting
            cursor.execute("SELECT id FROM Users WHERE id = %s", (id,))
            if not cursor.fetchone():
                return jsonify({"message": "User not found"}), 404

            # Prevent deleting users with existing posts
            cursor.execute("SELECT id FROM Inspections WHERE user_id = %s LIMIT 1", (id,))
            if cursor.fetchone():
                return jsonify({"message": "Cannot delete user with existing inspection posts."}), 409
            
            cursor.execute("SELECT id FROM QualityImprovements WHERE user_id = %s LIMIT 1", (id,))
            if cursor.fetchone():
                return jsonify({"message": "Cannot delete user with existing quality improvement posts."}), 409

            cursor.execute("DELETE FROM Users WHERE id = %s", (id,))
            conn.commit()
            return jsonify({"message": "User deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        if conn: conn.close()

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