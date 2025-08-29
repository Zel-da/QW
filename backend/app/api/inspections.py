from flask import Blueprint, request, jsonify, g
from .auth import token_required
from .. import get_db_connection

inspections_bp = Blueprint('inspections', __name__)

@inspections_bp.route('/inspections', methods=['GET'])
@token_required
def get_inspections():
    """Retrieves and returns all inspection records with joined data."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = conn.cursor()
    try:
        query = """
            SELECT i.id, u.username, c.company_name, p.product_name, p.product_code, 
                   i.inspected_quantity, i.defective_quantity, i.actioned_quantity, i.defect_reason, 
                   i.solution, i.received_date, i.target_date, i.progress_percentage
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

@inspections_bp.route('/inspections', methods=['POST'])
@token_required
def add_inspection():
    """Adds a new inspection record to the database safely."""
    data = request.get_json()
    data['user_id'] = g.current_user['user_id'] # Use user_id from token

    required_fields = ['company_name', 'product_name', 'product_code', 'inspected_quantity', 'defective_quantity']
    if not all(field in data and data[field] is not None for field in required_fields):
        return jsonify({"message": "필수 항목이 누락되었습니다."}), 400

    conn = get_db_connection()
    if not conn: return jsonify({"message": "Database connection failed"}), 500
    
    cursor = conn.cursor()
    try:
        # 1. Get/Create Company ID
        company_name = data['company_name']
        cursor.execute("SELECT id FROM Companies WHERE company_name = ?", (company_name,))
        company = cursor.fetchone()
        if company:
            company_id = company.id
        else:
            cursor.execute("INSERT INTO Companies (company_name) VALUES (?)", (company_name,))
            cursor.execute("SELECT SCOPE_IDENTITY()")
            company_id = cursor.fetchone()[0]

        # 2. Get/Create Product ID
        product_code = data['product_code']
        cursor.execute("SELECT id FROM Products WHERE product_code = ?", (product_code,))
        product = cursor.fetchone()
        if product:
            product_id = product.id
        else:
            cursor.execute("INSERT INTO Products (product_name, product_code) VALUES (?, ?)", (data['product_name'], product_code))
            cursor.execute("SELECT SCOPE_IDENTITY()")
            product_id = cursor.fetchone()[0]

        # 3. Insert Inspection Record
        insert_query = """
            INSERT INTO Inspections
            (company_id, product_id, user_id, inspected_quantity, defective_quantity, actioned_quantity,
            defect_reason, solution, target_date, progress_percentage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """
        params = (
            company_id, product_id, data['user_id'], data['inspected_quantity'], data['defective_quantity'],
            data.get('actioned_quantity'), data.get('defect_reason'), data.get('solution'),
            data.get('target_date'), data.get('progress_percentage', 0)
        )
        cursor.execute(insert_query, params)
        
        conn.commit()
        return jsonify({"message": "Inspection added successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@inspections_bp.route('/inspections/<int:id>', methods=['PUT'])
@token_required
def update_inspection(id):
    """Updates an existing inspection record."""
    data = request.get_json()
    update_fields = ['inspected_quantity', 'defective_quantity', 'actioned_quantity', 'defect_reason', 'solution', 'target_date', 'progress_percentage']
    set_clause = ", ".join([f"{field} = ?" for field in data if field in update_fields])
    if not set_clause: return jsonify({"message": "No valid fields to update"}), 400
    
    params = [data[field] for field in data if field in update_fields]
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

@inspections_bp.route('/inspections/<int:id>', methods=['DELETE'])
@token_required
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

@inspections_bp.route('/companies', methods=['GET'])
@token_required
def get_companies():
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

@inspections_bp.route('/users', methods=['GET'])
@token_required
def get_users():
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
