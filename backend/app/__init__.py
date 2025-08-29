import os
import pyodbc
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path='../.env') # Look for .env in the parent directory

DATABASE_URI = os.getenv('DATABASE_URI')

def get_db_connection():
    """Establishes a connection to the MSSQL database."""
    try:
        conn = pyodbc.connect(DATABASE_URI)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    CORS(app)

    app.config.from_mapping(
        SECRET_KEY=os.getenv('SECRET_KEY', 'dev'),
    )

    # Register blueprints
    from .api.auth import auth_bp
    from .api.inspections import inspections_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(inspections_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return "Backend server is running with Blueprint structure."

    return app
