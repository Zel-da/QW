from app import create_app

app = create_app()

if __name__ == '__main__':
    # Use waitress or gunicorn for production
    # For development:
    app.run(debug=True, port=5000)
