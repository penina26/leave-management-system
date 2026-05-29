from flask import jsonify, request
from db import db

from models.leave_type import LeaveTypeModel
from utils.auth import roles_required



def register_admin_leave_type_routes(app):
    """
    Register admin leave type management routes.
    """
    #Fetch all leave types
    @app.route("/admin/leave-types", methods=["GET"])
    @roles_required("admin")
    def get_all_leave_types():
        """
        Admin-only route to view all leave types.
        """
        leave_types = LeaveTypeModel.query.order_by(LeaveTypeModel.id.asc()).all()

        results = []

        for leave_type in leave_types:
            results.append({
                "id": leave_type.id,
                "name": leave_type.name,
                "description": leave_type.description,
                "default_days": leave_type.default_days,
                "requires_balance": leave_type.requires_balance,
                "is_active": leave_type.is_active,
                "created_at": leave_type.created_at.isoformat() if leave_type.created_at else None,
            })

        return jsonify({
            "count": len(results),
            "leave_types": results
        }), 200
    

    # fetch single leave type

    @app.route("/admin/leave-types/<int:leave_type_id>", methods=["GET"])
    @roles_required("admin")
    def get_leave_type_detail(leave_type_id):
        """
        Admin-only route to view one leave type in detail.
        """
        leave_type = LeaveTypeModel.query.get(leave_type_id)

        if not leave_type:
            return jsonify({"message": "Leave type not found"}), 404

        return jsonify({
            "leave_type": {
                "id": leave_type.id,
                "name": leave_type.name,
                "description": leave_type.description,
                "default_days": leave_type.default_days,
                "requires_balance": leave_type.requires_balance,
                "is_active": leave_type.is_active,
                "created_at": leave_type.created_at.isoformat() if leave_type.created_at else None,
            }
        }), 200
    
    # create leave type

    @app.route("/admin/leave-types", methods=["POST"])
    @roles_required("admin")
    def create_leave_type():
        """
        Admin-only route to create a new leave type.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        name = data.get("name")
        description = data.get("description")
        default_days = data.get("default_days")
        requires_balance = data.get("requires_balance")
        is_active = data.get("is_active", True)

        # Validate required fields
        if not name:
            return jsonify({"message": "name is required"}), 400

        if default_days is None:
            return jsonify({"message": "default_days is required"}), 400

        if requires_balance is None:
            return jsonify({"message": "requires_balance is required"}), 400

        # Prevent duplicate leave type names
        existing_leave_type = LeaveTypeModel.query.filter_by(name=name).first()
        if existing_leave_type:
            return jsonify({"message": "Leave type name already exists"}), 400

        # Validate default_days
        try:
            default_days = int(default_days)
        except (ValueError, TypeError):
            return jsonify({"message": "default_days must be an integer"}), 400

        if default_days < 0:
            return jsonify({"message": "default_days cannot be negative"}), 400

        leave_type = LeaveTypeModel(
            name=name,
            description=description,
            default_days=default_days,
            requires_balance=bool(requires_balance),
            is_active=bool(is_active),
        )

        db.session.add(leave_type)
        db.session.commit()

        return jsonify({
            "message": "Leave type created successfully",
            "leave_type": {
                "id": leave_type.id,
                "name": leave_type.name,
                "description": leave_type.description,
                "default_days": leave_type.default_days,
                "requires_balance": leave_type.requires_balance,
                "is_active": leave_type.is_active,
                "created_at": leave_type.created_at.isoformat() if leave_type.created_at else None,
            }
        }), 201

    #update Leave type
    @app.route("/admin/leave-types/<int:leave_type_id>", methods=["PATCH"])
    @roles_required("admin")
    def update_leave_type(leave_type_id):
        """
        Admin-only route to update an existing leave type.
        Supports partial updates.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        leave_type = LeaveTypeModel.query.get(leave_type_id)

        if not leave_type:
            return jsonify({"message": "Leave type not found"}), 404

        name = data.get("name")
        description = data.get("description")
        default_days = data.get("default_days")
        requires_balance = data.get("requires_balance")
        is_active = data.get("is_active")

        # Validate name if provided
        if name is not None:
            existing_leave_type = LeaveTypeModel.query.filter_by(name=name).first()

            if existing_leave_type and existing_leave_type.id != leave_type.id:
                return jsonify({"message": "Leave type name already exists"}), 400

            leave_type.name = name

        # Validate description if provided
        if description is not None:
            leave_type.description = description

        # Validate default_days if provided
        if default_days is not None:
            try:
                default_days = int(default_days)
            except (ValueError, TypeError):
                return jsonify({"message": "default_days must be an integer"}), 400

            if default_days < 0:
                return jsonify({"message": "default_days cannot be negative"}), 400

            leave_type.default_days = default_days

        # Update requires_balance if provided
        if requires_balance is not None:
            leave_type.requires_balance = bool(requires_balance)

        # Update is_active if provided
        if is_active is not None:
            leave_type.is_active = bool(is_active)

        db.session.commit()

        return jsonify({
            "message": "Leave type updated successfully",
            "leave_type": {
                "id": leave_type.id,
                "name": leave_type.name,
                "description": leave_type.description,
                "default_days": leave_type.default_days,
                "requires_balance": leave_type.requires_balance,
                "is_active": leave_type.is_active,
                "created_at": leave_type.created_at.isoformat() if leave_type.created_at else None,
            }
        }), 200

    # Delete a leave type

    @app.route("/admin/leave-types/<int:leave_type_id>", methods=["DELETE"])
    @roles_required("admin")
    def delete_leave_type(leave_type_id):
        """
        Admin-only route to delete a leave type.
        Deletion is blocked if the leave type is already referenced.
        """
        leave_type = LeaveTypeModel.query.get(leave_type_id)

        if not leave_type:
            return jsonify({"message": "Leave type not found"}), 404

        # Prevent deletion if the leave type is already used in leave requests
        if leave_type.leave_requests:
            return jsonify({
                "message": "Cannot delete leave type because it is already used in leave requests"
            }), 400

        # Prevent deletion if the leave type is already used in leave balances
        if leave_type.leave_balances:
            return jsonify({
                "message": "Cannot delete leave type because it is already used in leave balances"
            }), 400

        db.session.delete(leave_type)
        db.session.commit()

        return jsonify({
            "message": "Leave type deleted successfully"
        }), 200

