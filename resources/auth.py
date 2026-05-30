from flask import request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from utils.auth import roles_required


from models.user import UserModel


def register_auth_routes(app):
    """
    Register authentication routes on the Flask app.
    """

    @app.route("/login", methods=["POST"])
    def login():
        """
        Log in a user with username and password.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        user = UserModel.query.filter_by(username=username).first()

        if not user or not user.check_password(password):
            return jsonify({"message": "Invalid username or password"}), 401

        if not user.is_active:
            return jsonify({"message": "User account is inactive"}), 403

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return jsonify({
            "access_token": access_token,
            "refresh_token":refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "roles": [role.name for role in user.roles]
            }
        }), 200
    
    @app.route("/refresh", methods=["POST"])
    @jwt_required(refresh=True)
    def refresh():
        """
        Exchange a valid refresh token for a new access token.
        """
        current_user_id = get_jwt_identity()

        user = UserModel.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        if not user.is_active:
            return jsonify({"message": "User account is inactive"}), 403

        new_access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "access_token": new_access_token
        }), 200

    @app.route("/me", methods=["GET"])
    @jwt_required()
    def get_current_user():
        """
        Return the currently logged-in user's details.
        """
        current_user_id = get_jwt_identity()

        user = UserModel.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify({
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "is_active": user.is_active,
            "roles": [role.name for role in user.roles]
        }), 200
    
   
    