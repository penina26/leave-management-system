# utils/auth.py

from functools import wraps

from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from models.user import UserModel


def roles_required(*allowed_roles):
    """
    Decorator to restrict access to users who have at least
    one of the allowed roles.

    Example:
        @roles_required("admin")
        @roles_required("supervisor", "head_of_unit")
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Make sure a valid JWT token is present
            verify_jwt_in_request()

            # Get the current user ID from the token
            current_user_id = get_jwt_identity()

            # Find the user in the database
            user = UserModel.query.get(current_user_id)

            if not user:
                return jsonify({"message": "User not found"}), 404

            # Collect the user's role names
            user_roles = [role.name for role in user.roles]

            # Check whether the user has at least one allowed role
            if not any(role in user_roles for role in allowed_roles):
                return jsonify({"message": "Access denied"}), 403

            # If allowed, continue to the route
            return fn(*args, **kwargs)

        return wrapper

    return decorator
