from flask_cors import CORS
# from authlib.integrations.flask_client import OAuth
from config import Config
from flask import Flask, jsonify, render_template
from werkzeug.exceptions import NotFound
from flask_bcrypt import Bcrypt

from api.routes.auth import auth_bp


bcrypt = Bcrypt()  # Initialize Bcrypt


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)
    # Load configuration
    app.config.from_object(Config)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    # Initialize extensions
    # db.init_app(app)
    # oauth = OAuth(app)

    # blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return jsonify({"live": "Hello World"}), 200
    

    # Error handler for invalid routes
    @app.errorhandler(NotFound)
    def handle_not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404



    return app


app = create_app()

# Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.APP_PORT, debug=Config.DEBUG)
    CORS(app, supports_credentials=True)
