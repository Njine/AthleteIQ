from flask import Blueprint, jsonify, request, session
# from models.db import AUTH
from api.utils.session_wraps import session_required

# Define the Blueprint for authentication-related routes
auth_bp = Blueprint('auth', __name__)


@auth_bp.route("/logout", methods=["DELETE"])
@session_required
def logout():
    """
    Logout route.

    This route logs out the current user by removing their email from the session.

    Returns:
        Response: JSON response indicating the result of the logout operation.
    """
    if 'email' not in session:
        return jsonify({"message": "Not logged in"}), 400

    email = session.pop('email', None)
    response = jsonify({"email": email, "message": "logged out"})
    return response

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login route.

    This route logs in a user by validating their credentials and adding their email to the session.

    Returns:
        Response: JSON response indicating the result of the login operation.
    """
    if 'email' in session:
        return jsonify({"message": "Already logged in"}), 200

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "missing parameters"}), 400

    email = data.get("email")
    password = data.get("password")
    state, code = AUTH.valid_login(email, password)

    if not state:
        return jsonify({"message": "Not registered" if not code else "Incorrect password"}), 400

    session['email'] = email
    response = jsonify({"email": email, "message": "logged in"})
    return response


@auth_bp.route("/deregister", methods=["POST"])
@session_required
def deluser():
    """
    Deregister user route.

    This route deregisters the current user by removing their account from the database and their email from the session.

    Returns:
        Response: JSON response indicating the result of the deregistration operation.
    """
    user = session.get('email', None)
    try:
        msg = AUTH.deregister_user(user)
        session.pop('email', None)
        return jsonify({"email": user, "message": msg})
    except ValueError as e:
        return jsonify({"message": str(e)}), 400


@auth_bp.route("/register", methods=["POST"])
def new_usr():
    """
    Register user route.

    This route registers a new user by adding their information to the database.

    Returns:
        Response: JSON response indicating the result of the registration operation.
    """
    if 'email' in session:
        return jsonify({"message": "Already logged in"}), 200

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "missing parameters"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    if not name or not email or not password:
        return jsonify({"message": "missing parameters"}), 400

    try:
        AUTH.register_user(email, name, password)
        return jsonify({"email": email, "message": "user created"})
    except ValueError as err:
        return jsonify({"message": str(err)}), 400

@auth_bp.route("/check-session", methods=["GET"])
@session_required
def check_session():
    """
    Check session status route.

    This route checks if the current user is logged in by verifying their email in the session.

    Returns:
        Response: JSON response indicating the session status.
    """
    if 'email' in session:
        return jsonify({"code": 1}), 200
    else:
        return jsonify({"code": 0}), 400
