from flask import jsonify, request

from models.role import RoleModel
from utils.auth import roles_required
from db import db


def register_admin_role_routes(app):
    """
    Register admin role management routes.
    """

    @app.route("/admin/roles", methods=["GET"])
    @roles_required("admin")
    def get_all_roles():
        """
        Admin-only route to view all roles.
        """
        roles = RoleModel.query.order_by(RoleModel.id.asc()).all()

        results = []

        for role in roles:
            results.append({
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "user_count": len(role.users)
            })

        return jsonify({
            "count": len(results),
            "roles": results
        }), 200
    
    #get single role details
    @app.route("/admin/roles/<int:role_id>", methods=["GET"])
    @roles_required("admin")
    def get_role_detail(role_id):
        """
        Admin-only route to view one role in detail.
        """
        role = RoleModel.query.get(role_id)

        if not role:
            return jsonify({"message": "Role not found"}), 404

        users = []

        for user in role.users:
            users.append({
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "unit_id": user.unit_id,
                "unit_name": user.unit.name if user.unit else None,
                "supervisor_id": user.supervisor_id,
                "supervisor_name": user.supervisor.full_name if user.supervisor else None
            })

        return jsonify({
            "role": {
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "user_count": len(role.users)
            },
            "users": users
        }), 200
    
    #create role
    @app.route("/admin/roles", methods=["POST"])
    @roles_required("admin")
    def create_role():
        """
        Admin-only route to create a new role.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        name = data.get("name")
        description = data.get("description")

        # name is required
        if not name:
            return jsonify({"message": "name is required"}), 400

        # prevent duplicate role names
        existing_role = RoleModel.query.filter_by(name=name).first()
        if existing_role:
            return jsonify({"message": "Role name already exists"}), 400

        role = RoleModel(
            name=name,
            description=description
        )

        db.session.add(role)
        db.session.commit()

        return jsonify({
            "message": "Role created successfully",
            "role": {
                "id": role.id,
                "name": role.name,
                "description": role.description
            }
        }), 201
    
    #update role

    @app.route("/admin/roles/<int:role_id>", methods=["PATCH"])
    @roles_required("admin")
    def update_role(role_id):
        """
        Admin-only route to update an existing role.
        Supports partial updates.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        role = RoleModel.query.get(role_id)

        if not role:
            return jsonify({"message": "Role not found"}), 404

        name = data.get("name")
        description = data.get("description")

        # Validate name if provided
        if name is not None:
            existing_role = RoleModel.query.filter_by(name=name).first()

            if existing_role and existing_role.id != role.id:
                return jsonify({"message": "Role name already exists"}), 400

            role.name = name

        # Update description if provided
        if description is not None:
            role.description = description

        db.session.commit()

        return jsonify({
            "message": "Role updated successfully",
            "role": {
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "user_count": len(role.users)
            }
        }), 200
    
    # delete role

    @app.route("/admin/roles/<int:role_id>", methods=["DELETE"])
    @roles_required("admin")
    def delete_role(role_id):
        """
        Admin-only route to delete a role.
        Deletion is blocked if the role is still assigned to users.
        """
        role = RoleModel.query.get(role_id)

        if not role:
            return jsonify({"message": "Role not found"}), 404

        # Prevent deletion if the role is still assigned to users
        if role.users:
            return jsonify({
                "message": "Cannot delete role because it is still assigned to one or more users"
            }), 400

        db.session.delete(role)
        db.session.commit()

        return jsonify({
            "message": "Role deleted successfully"
        }), 200

