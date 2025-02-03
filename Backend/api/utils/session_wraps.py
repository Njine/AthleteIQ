from functools import wraps
from flask import session, jsonify


def session_required(f):
    """
    Decorator to ensure the user is logged in with an active session.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("Session debug:", session)
        if not session.get('logged_in'):
            return jsonify({
                "message": "Session is missing or invalid!",
                "notification": "Please log in to access this resource."
            }), 403
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """
    Decorator to ensure the user has admin privileges.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if the user is logged in by verifying session data
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                "message": "Unauthorized access!",
                "notification": "You must be logged in to perform this action."
            }), 403

        # Fetch the user from the database
        from models.db import User  # Ensure you import your database schema
        user = User.query.filter_by(id=user_id).first()

        # Check if the user exists and has admin privileges
        if not user or not getattr(user, 'is_admin', False):
            return jsonify({
                "message": "Access denied!",
                "notification": "You do not have sufficient privileges."
            }), 403

        # Allow access to the route
        return f(*args, **kwargs)
    return decorated_function
