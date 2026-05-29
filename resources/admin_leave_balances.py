from flask import request, jsonify

from db import db
from models.user import UserModel
from models.leave_type import LeaveTypeModel
from models.leave_balance import LeaveBalanceModel
from utils.auth import roles_required


def register_admin_leave_balance_routes(app):
    """
    Register admin leave balance management routes.
    """

    @app.route("/admin/leave-balances", methods=["GET"])
    @roles_required("admin")
    def get_all_leave_balances():
        """
        Admin-only route to view all leave balances.
        """
        leave_balances = LeaveBalanceModel.query.order_by(
            LeaveBalanceModel.year.desc(),
            LeaveBalanceModel.id.asc()
        ).all()

        results = []

        for balance in leave_balances:
            results.append({
                "id": balance.id,
                "user_id": balance.user_id,
                "user_name": balance.user.full_name if balance.user else None,
                "leave_type_id": balance.leave_type_id,
                "leave_type_name": balance.leave_type.name if balance.leave_type else None,
                "year": balance.year,
                "allocated_days": balance.allocated_days,
                "used_days": balance.used_days,
                "remaining_days": balance.remaining_days,
                "created_at": balance.created_at.isoformat() if balance.created_at else None,
                "updated_at": balance.updated_at.isoformat() if balance.updated_at else None,
            })

        return jsonify({
            "count": len(results),
            "leave_balances": results
        }), 200

    #get a single leave balance
    @app.route("/admin/leave-balances/<int:balance_id>", methods=["GET"])
    @roles_required("admin")
    def get_leave_balance_detail(balance_id):
        """
        Admin-only route to view one leave balance in detail.
        """
        balance = LeaveBalanceModel.query.get(balance_id)

        if not balance:
            return jsonify({"message": "Leave balance not found"}), 404

        return jsonify({
            "leave_balance": {
                "id": balance.id,
                "user_id": balance.user_id,
                "user_name": balance.user.full_name if balance.user else None,
                "leave_type_id": balance.leave_type_id,
                "leave_type_name": balance.leave_type.name if balance.leave_type else None,
                "year": balance.year,
                "allocated_days": balance.allocated_days,
                "used_days": balance.used_days,
                "remaining_days": balance.remaining_days,
                "created_at": balance.created_at.isoformat() if balance.created_at else None,
                "updated_at": balance.updated_at.isoformat() if balance.updated_at else None,
            }
        }), 200

    #create a leave balance

    @app.route("/admin/leave-balances", methods=["POST"])
    @roles_required("admin")
    def create_leave_balance():
        """
        Admin-only route to create / allocate a leave balance.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        user_id = data.get("user_id")
        leave_type_id = data.get("leave_type_id")
        year = data.get("year")
        allocated_days = data.get("allocated_days")
        used_days = data.get("used_days", 0)

        # Validate required fields
        if user_id is None:
            return jsonify({"message": "user_id is required"}), 400

        if leave_type_id is None:
            return jsonify({"message": "leave_type_id is required"}), 400

        if year is None:
            return jsonify({"message": "year is required"}), 400

        if allocated_days is None:
            return jsonify({"message": "allocated_days is required"}), 400

        # Validate numeric fields
        try:
            user_id = int(user_id)
            leave_type_id = int(leave_type_id)
            year = int(year)
            allocated_days = int(allocated_days)
            used_days = int(used_days)
        except (ValueError, TypeError):
            return jsonify({
                "message": "user_id, leave_type_id, year, allocated_days, and used_days must be integers"
            }), 400

        if allocated_days < 0:
            return jsonify({"message": "allocated_days cannot be negative"}), 400

        if used_days < 0:
            return jsonify({"message": "used_days cannot be negative"}), 400

        if used_days > allocated_days:
            return jsonify({"message": "used_days cannot be greater than allocated_days"}), 400

        # Validate user exists
        user = UserModel.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Validate leave type exists
        leave_type = LeaveTypeModel.query.get(leave_type_id)
        if not leave_type:
            return jsonify({"message": "Leave type not found"}), 404

        # Prevent duplicate balance for same user + leave type + year
        existing_balance = LeaveBalanceModel.query.filter_by(
            user_id=user_id,
            leave_type_id=leave_type_id,
            year=year
        ).first()

        if existing_balance:
            return jsonify({
                "message": "Leave balance already exists for this user, leave type, and year"
            }), 400

        remaining_days = allocated_days - used_days

        balance = LeaveBalanceModel(
            user_id=user_id,
            leave_type_id=leave_type_id,
            year=year,
            allocated_days=allocated_days,
            used_days=used_days,
            remaining_days=remaining_days,
        )

        db.session.add(balance)
        db.session.commit()

        return jsonify({
            "message": "Leave balance created successfully",
            "leave_balance": {
                "id": balance.id,
                "user_id": balance.user_id,
                "user_name": balance.user.full_name if balance.user else None,
                "leave_type_id": balance.leave_type_id,
                "leave_type_name": balance.leave_type.name if balance.leave_type else None,
                "year": balance.year,
                "allocated_days": balance.allocated_days,
                "used_days": balance.used_days,
                "remaining_days": balance.remaining_days,
                "created_at": balance.created_at.isoformat() if balance.created_at else None,
                "updated_at": balance.updated_at.isoformat() if balance.updated_at else None,
            }
        }), 201
    
    #Edit Leave Balance
    @app.route("/admin/leave-balances/<int:balance_id>", methods=["PATCH"])
    @roles_required("admin")
    def update_leave_balance(balance_id):
        """
        Admin-only route to update / adjust an existing leave balance.
        Supports partial updates.
        """
        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        balance = LeaveBalanceModel.query.get(balance_id)

        if not balance:
            return jsonify({"message": "Leave balance not found"}), 404

        user_id = data.get("user_id")
        leave_type_id = data.get("leave_type_id")
        year = data.get("year")
        allocated_days = data.get("allocated_days")
        used_days = data.get("used_days")

        # Validate and update user_id if provided
        if user_id is not None:
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                return jsonify({"message": "user_id must be an integer"}), 400

            user = UserModel.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            balance.user_id = user_id

        # Validate and update leave_type_id if provided
        if leave_type_id is not None:
            try:
                leave_type_id = int(leave_type_id)
            except (ValueError, TypeError):
                return jsonify({"message": "leave_type_id must be an integer"}), 400

            leave_type = LeaveTypeModel.query.get(leave_type_id)
            if not leave_type:
                return jsonify({"message": "Leave type not found"}), 404

            balance.leave_type_id = leave_type_id

        # Validate and update year if provided
        if year is not None:
            try:
                year = int(year)
            except (ValueError, TypeError):
                return jsonify({"message": "year must be an integer"}), 400

            balance.year = year

        # Validate and update allocated_days if provided
        if allocated_days is not None:
            try:
                allocated_days = int(allocated_days)
            except (ValueError, TypeError):
                return jsonify({"message": "allocated_days must be an integer"}), 400

            if allocated_days < 0:
                return jsonify({"message": "allocated_days cannot be negative"}), 400

            balance.allocated_days = allocated_days

        # Validate and update used_days if provided
        if used_days is not None:
            try:
                used_days = int(used_days)
            except (ValueError, TypeError):
                return jsonify({"message": "used_days must be an integer"}), 400

            if used_days < 0:
                return jsonify({"message": "used_days cannot be negative"}), 400

            balance.used_days = used_days

        # Validate combination after updates
        if balance.used_days > balance.allocated_days:
            return jsonify({
                "message": "used_days cannot be greater than allocated_days"
            }), 400

        # Prevent duplicate balance for same user + leave type + year
        existing_balance = LeaveBalanceModel.query.filter_by(
            user_id=balance.user_id,
            leave_type_id=balance.leave_type_id,
            year=balance.year
        ).first()

        if existing_balance and existing_balance.id != balance.id:
            return jsonify({
                "message": "Leave balance already exists for this user, leave type, and year"
            }), 400

        # Recalculate remaining_days
        balance.remaining_days = balance.allocated_days - balance.used_days

        db.session.commit()

        return jsonify({
            "message": "Leave balance updated successfully",
            "leave_balance": {
                "id": balance.id,
                "user_id": balance.user_id,
                "user_name": balance.user.full_name if balance.user else None,
                "leave_type_id": balance.leave_type_id,
                "leave_type_name": balance.leave_type.name if balance.leave_type else None,
                "year": balance.year,
                "allocated_days": balance.allocated_days,
                "used_days": balance.used_days,
                "remaining_days": balance.remaining_days,
                "created_at": balance.created_at.isoformat() if balance.created_at else None,
                "updated_at": balance.updated_at.isoformat() if balance.updated_at else None,
            }
        }), 200

