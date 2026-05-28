
from flask import jsonify,request

from db import db

from models.user import UserModel
from models.unit import UnitModel
from models.role import RoleModel
from models.user_role import UserRoleModel

from utils.auth import roles_required


def register_admin_user_routes(app):
    """
    Register admin user management routes.
    """

    #get users
    @app.route("/admin/users", methods=["GET"])
    @roles_required("admin")
    def get_all_users():
        """
        Admin-only route to view all users.
        """
        users = UserModel.query.order_by(UserModel.id.asc()).all()

        results = []

        for user in users:
            results.append({
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "unit_id": user.unit_id,
                "unit_name": user.unit.name if user.unit else None,
                "supervisor_id": user.supervisor_id,
                "supervisor_name": user.supervisor.full_name if user.supervisor else None,
                "roles": [role.name for role in user.roles],
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            })

        return jsonify({
            "count": len(results),
            "users": results
        }), 200
    
    #create users    
    @app.route("/admin/users", methods=["POST"])
    @roles_required("admin")
    def create_user():
        """
        Admin-only route to create a new user.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        employee_number = data.get("employee_number")
        full_name = data.get("full_name")
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        unit_id = data.get("unit_id")
        supervisor_id = data.get("supervisor_id")
        role_ids = data.get("role_ids", [])

        # Required fields
        if not employee_number or not full_name or not username or not email or not password:
            return jsonify({
                "message": "employee_number, full_name, username, email, and password are required"
            }), 400

        # role_ids must be provided and must be a list
        if not isinstance(role_ids, list) or len(role_ids) == 0:
            return jsonify({"message": "role_ids must be a non-empty list"}), 400

        # Uniqueness checks
        if UserModel.query.filter_by(employee_number=employee_number).first():
            return jsonify({"message": "Employee number already exists"}), 400

        if UserModel.query.filter_by(username=username).first():
            return jsonify({"message": "Username already exists"}), 400

        if UserModel.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists"}), 400

        # Validate unit if provided
        unit = None
        if unit_id is not None:
            unit = UnitModel.query.get(unit_id)
            if not unit:
                return jsonify({"message": "Unit not found"}), 404

        # Validate supervisor if provided
        supervisor = None
        if supervisor_id is not None:
            supervisor = UserModel.query.get(supervisor_id)
            if not supervisor:
                return jsonify({"message": "Supervisor not found"}), 404

        # Validate roles
        roles = []
        for role_id in role_ids:
            role = RoleModel.query.get(role_id)
            if not role:
                return jsonify({"message": f"Role with id {role_id} not found"}), 404
            roles.append(role)

        # Create user
        user = UserModel(
            employee_number=employee_number,
            full_name=full_name,
            username=username,
            email=email,
            unit_id=unit.id if unit else None,
            supervisor_id=supervisor.id if supervisor else None,
            is_active=True
        )

        user.set_password(password)

        db.session.add(user)
        db.session.flush()  # get user.id before creating user_roles rows

        # Assign roles using user_roles table
        for role in roles:
            db.session.add(
                UserRoleModel(
                    user_id=user.id,
                    role_id=role.id
                )
            )

        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user": {
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "unit_id": user.unit_id,
                "supervisor_id": user.supervisor_id,
                "roles": [role.name for role in roles]
            }
        }), 201
    
    #edit user details
    @app.route("/admin/users/<int:user_id>", methods=["PATCH"])
    @roles_required("admin")
    def update_user(user_id):
        """
        Admin-only route to update an existing user.
        Supports partial updates.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        user = UserModel.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Read optional fields from request body
        employee_number = data.get("employee_number")
        full_name = data.get("full_name")
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        unit_id = data.get("unit_id")
        supervisor_id = data.get("supervisor_id")
        is_active = data.get("is_active")
        role_ids = data.get("role_ids")

     
        # Uniqueness checks
     

        if employee_number and employee_number != user.employee_number:
            existing = UserModel.query.filter_by(employee_number=employee_number).first()
            if existing:
                return jsonify({"message": "Employee number already exists"}), 400

        if username and username != user.username:
            existing = UserModel.query.filter_by(username=username).first()
            if existing:
                return jsonify({"message": "Username already exists"}), 400

        if email and email != user.email:
            existing = UserModel.query.filter_by(email=email).first()
            if existing:
                return jsonify({"message": "Email already exists"}), 400

     
        # Validate unit if provided
     

        if unit_id is not None:
            if unit_id == "":
                user.unit_id = None
            else:
                unit = UnitModel.query.get(unit_id)
                if not unit:
                    return jsonify({"message": "Unit not found"}), 404
                user.unit_id = unit.id

     
        # Validate supervisor if provided
     

        if supervisor_id is not None:
            if supervisor_id == "":
                user.supervisor_id = None
            else:
                supervisor = UserModel.query.get(supervisor_id)
                if not supervisor:
                    return jsonify({"message": "Supervisor not found"}), 404

                if supervisor.id == user.id:
                    return jsonify({"message": "A user cannot be their own supervisor"}), 400

                user.supervisor_id = supervisor.id

     
        # Update simple fields if provided
     

        if employee_number is not None:
            user.employee_number = employee_number

        if full_name is not None:
            user.full_name = full_name

        if username is not None:
            user.username = username

        if email is not None:
            user.email = email

        if password is not None and password.strip() != "":
            user.set_password(password)

        if is_active is not None:
            user.is_active = bool(is_active)

     
        # Update roles if provided
     

        if role_ids is not None:
            if not isinstance(role_ids, list) or len(role_ids) == 0:
                return jsonify({"message": "role_ids must be a non-empty list"}), 400

            roles = []
            for role_id in role_ids:
                role = RoleModel.query.get(role_id)
                if not role:
                    return jsonify({"message": f"Role with id {role_id} not found"}), 404
                roles.append(role)

            # Remove existing user_roles
            UserRoleModel.query.filter_by(user_id=user.id).delete()

            # Add new user_roles
            for role in roles:
                db.session.add(
                    UserRoleModel(
                        user_id=user.id,
                        role_id=role.id
                    )
                )

        db.session.commit()

        return jsonify({
            "message": "User updated successfully",
            "user": {
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "unit_id": user.unit_id,
                "supervisor_id": user.supervisor_id,
                "roles": [role.name for role in user.roles]
            }
        }), 200
    # deactivate user
    @app.route("/admin/users/<int:user_id>/deactivate", methods=["PATCH"])
    @roles_required("admin")
    def deactivate_user(user_id):
        """
        Admin-only route to deactivate a user.
        """
        user = UserModel.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        # prevent deactivating an already inactive user
        if not user.is_active:
            return jsonify({"message": "User is already inactive"}), 400

        user.is_active = False
        db.session.commit()

        return jsonify({
            "message": "User deactivated successfully",
            "user": {
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "unit_id": user.unit_id,
                "supervisor_id": user.supervisor_id,
                "roles": [role.name for role in user.roles]
            }
        }), 200
    
    # reactivate user

    @app.route("/admin/users/<int:user_id>/reactivate", methods=["PATCH"])
    @roles_required("admin")
    def reactivate_user(user_id):
        """
        Admin-only route to reactivate a user.
        """
        user = UserModel.query.get(user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        if user.is_active:
            return jsonify({"message": "User is already active"}), 400

        user.is_active = True
        db.session.commit()

        return jsonify({
            "message": "User reactivated successfully",
            "user": {
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "unit_id": user.unit_id,
                "supervisor_id": user.supervisor_id,
                "roles": [role.name for role in user.roles]
            }
        }), 200


    # Admin view all units 
    @app.route("/admin/units", methods=["GET"])
    @roles_required("admin")
    def get_all_units():
        """
        Admin-only route to view all units.
        """
        units = UnitModel.query.order_by(UnitModel.id.asc()).all()

        results = []

        for unit in units:
            results.append({
                "id": unit.id,
                "name": unit.name,
                "description": unit.description,
                "head_user_id": unit.head_user_id,
                "head_user_name": unit.head.full_name if unit.head else None,
                "member_count": len(unit.members),
                "created_at": unit.created_at.isoformat() if unit.created_at else None,
                "updated_at": unit.updated_at.isoformat() if unit.updated_at else None
            })

        return jsonify({
            "count": len(results),
            "units": results
        }), 200

    # admin create unit
    @app.route("/admin/units", methods=["POST"])
    @roles_required("admin")
    def create_unit():
        """
        Admin-only route to create a new unit.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        name = data.get("name")
        description = data.get("description")
        head_user_id = data.get("head_user_id")

        # Required field
        if not name:
            return jsonify({"message": "name is required"}), 400

        # Prevent duplicate unit names
        existing_unit = UnitModel.query.filter_by(name=name).first()
        if existing_unit:
            return jsonify({"message": "Unit name already exists"}), 400

        head_user = None

        # Validate head user if provided
        if head_user_id is not None:
            head_user = UserModel.query.get(head_user_id)

            if not head_user:
                return jsonify({"message": "Head user not found"}), 404

        # Create unit
        unit = UnitModel(
            name=name,
            description=description,
            head_user_id=head_user.id if head_user else None
        )

        db.session.add(unit)
        db.session.commit()

        return jsonify({
            "message": "Unit created successfully",
            "unit": {
                "id": unit.id,
                "name": unit.name,
                "description": unit.description,
                "head_user_id": unit.head_user_id,
                "head_user_name": unit.head.full_name if unit.head else None,
                "created_at": unit.created_at.isoformat() if unit.created_at else None,
                "updated_at": unit.updated_at.isoformat() if unit.updated_at else None
            }
        }), 201


    #update unit
    @app.route("/admin/units/<int:unit_id>", methods=["PATCH"])
    @roles_required("admin")
    def update_unit(unit_id):
        """
        Admin-only route to update an existing unit.
        Supports partial updates.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        unit = UnitModel.query.get(unit_id)

        if not unit:
            return jsonify({"message": "Unit not found"}), 404

        name = data.get("name")
        description = data.get("description")
        head_user_id = data.get("head_user_id")

     
        # Validate name if provided
     
        if name is not None:
            existing_unit = UnitModel.query.filter_by(name=name).first()

            if existing_unit and existing_unit.id != unit.id:
                return jsonify({"message": "Unit name already exists"}), 400

            unit.name = name

     
        # Update description if provided
     
        if description is not None:
            unit.description = description

     
        # Validate / update head user if provided
     
        if head_user_id is not None:
            if head_user_id == "":
                unit.head_user_id = None
            else:
                head_user = UserModel.query.get(head_user_id)

                if not head_user:
                    return jsonify({"message": "Head user not found"}), 404

                unit.head_user_id = head_user.id

        db.session.commit()

        return jsonify({
            "message": "Unit updated successfully",
            "unit": {
                "id": unit.id,
                "name": unit.name,
                "description": unit.description,
                "head_user_id": unit.head_user_id,
                "head_user_name": unit.head.full_name if unit.head else None,
                "created_at": unit.created_at.isoformat() if unit.created_at else None,
                "updated_at": unit.updated_at.isoformat() if unit.updated_at else None
            }
        }), 200
    
    # Admin view one unit 
    @app.route("/admin/units/<int:unit_id>", methods=["GET"])
    @roles_required("admin")
    def get_unit_detail(unit_id):
        """
        Admin-only route to view one unit in detail.
        """
        unit = UnitModel.query.get(unit_id)

        if not unit:
            return jsonify({"message": "Unit not found"}), 404

        members = []

        for user in unit.members:
            members.append({
                "id": user.id,
                "employee_number": user.employee_number,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "supervisor_id": user.supervisor_id,
                "supervisor_name": user.supervisor.full_name if user.supervisor else None,
                "roles": [role.name for role in user.roles]
            })

        return jsonify({
            "unit": {
                "id": unit.id,
                "name": unit.name,
                "description": unit.description,
                "head_user_id": unit.head_user_id,
                "head_user_name": unit.head.full_name if unit.head else None,
                "created_at": unit.created_at.isoformat() if unit.created_at else None,
                "updated_at": unit.updated_at.isoformat() if unit.updated_at else None
            },
            "members": members
        }), 200
    
    # safely delet a unit
    @app.route("/admin/units/<int:unit_id>", methods=["DELETE"])
    @roles_required("admin")
    def delete_unit(unit_id):
        """
        Admin-only route to permanently delete a unit.
        Deletion is blocked if the unit still has members or leave requests.
        """
        unit = UnitModel.query.get(unit_id)

        if not unit:
            return jsonify({"message": "Unit not found"}), 404

        # Prevent delete if the unit still has users assigned to it
        if unit.members:
            return jsonify({
                "message": "Cannot delete unit with assigned members. Reassign or remove users first."
            }), 400

        # Prevent delete if the unit is still referenced by leave requests
        if unit.leave_requests:
            return jsonify({
                "message": "Cannot delete unit with related leave requests."
            }), 400

        db.session.delete(unit)
        db.session.commit()

        return jsonify({
            "message": "Unit deleted successfully"
        }), 200

