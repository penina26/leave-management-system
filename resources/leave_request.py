from datetime import datetime

from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from db import db
from models.user import UserModel
from models.leave_type import LeaveTypeModel
from models.leave_request import LeaveRequestModel, LeaveRequestStatus
from models.approval_action import ApprovalActionModel, ApprovalActionType
from models.leave_balance import LeaveBalanceModel
from utils.auth import roles_required


def register_leave_request_routes(app):
    """
    Register leave request routes on the Flask app.
    """


    #===================FETCH LEAVE TYPES===================

    @app.route("/leave-types", methods=["GET"])
    @roles_required("staff", "supervisor", "head_of_unit", "admin")
    def get_leave_types():
        """
        Return all active leave types.
        """
        leave_types = LeaveTypeModel.query.filter_by(is_active=True).order_by(
            LeaveTypeModel.id.asc()
        ).all()

        results = []

        for leave_type in leave_types:
            results.append({
                "id": leave_type.id,
                "name": leave_type.name,
                "description": leave_type.description,
                "default_days": leave_type.default_days,
                "requires_balance": leave_type.requires_balance,
                "is_active": leave_type.is_active
            })

        return jsonify({
            "count": len(results),
            "leave_types": results
        }), 200

    #=========================APPLY FOR LEAVE==============================
    @app.route("/leave-requests", methods=["POST"])
    @roles_required("staff")
    def apply_leave():
        """
        Staff-only route to apply for leave.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        user = UserModel.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.get_json()

        if not data:
            return jsonify({"message": "Request body is required"}), 400

        leave_type_id = data.get("leave_type_id")
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        days_requested = data.get("days_requested")
        reason = data.get("reason")

        # Basic validation
        if not leave_type_id or not start_date or not end_date or not days_requested or not reason:
            return jsonify({
                "message": "leave_type_id, start_date, end_date, days_requested, and reason are required"
            }), 400

        # Make sure leave type exists
        leave_type = LeaveTypeModel.query.get(leave_type_id)
        if not leave_type:
            return jsonify({"message": "Leave type not found"}), 404

        # Make sure the user has a supervisor
        if not user.supervisor_id:
            return jsonify({"message": "User does not have a supervisor assigned"}), 400

        # Make sure the user belongs to a unit
        if not user.unit_id:
            return jsonify({"message": "User does not belong to a unit"}), 400

        # Make sure the user's unit has a head assigned
        if not user.unit or not user.unit.head_user_id:
            return jsonify({"message": "User's unit does not have a head assigned"}), 400

        # Convert dates safely
        try:
            parsed_start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            parsed_end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Dates must be in YYYY-MM-DD format"}), 400

        today = datetime.today().date()

        if parsed_start_date < today:
            return jsonify({"message": "start_date cannot be earlier than today"}), 400

        if parsed_end_date < today:
            return jsonify({"message": "end_date cannot be earlier than today"}), 400

        if parsed_end_date < parsed_start_date:
            return jsonify({"message": "end_date cannot be earlier than start_date"}), 400

        # Validate days_requested
        try:
            days_requested = int(days_requested)
        except (ValueError, TypeError):
            return jsonify({"message": "days_requested must be an integer"}), 400

        if days_requested <= 0:
            return jsonify({"message": "days_requested must be greater than 0"}), 400

        # Check Leave balance early       
        if leave_type.requires_balance:
            leave_year = parsed_start_date.year

            leave_balance = LeaveBalanceModel.query.filter_by(
                user_id=user.id,
                leave_type_id=leave_type.id,
                year=leave_year
            ).first()

            if not leave_balance:
                return jsonify({
                    "message": f"No leave balance record found for {leave_type.name} in {leave_year}"
                }), 400

            if leave_balance.remaining_days <= 0:
                return jsonify({
                    "message": f"You have exhausted your {leave_type.name} balance for {leave_year}. Remaining days: 0"
                }), 400

            if days_requested > leave_balance.remaining_days:
                return jsonify({
                    "message": (
                        f"Insufficient leave balance. You requested {days_requested} day(s), "
                        f"but only {leave_balance.remaining_days} day(s) remain for {leave_type.name} in {leave_year}."
                    ),
                    "remaining_days": leave_balance.remaining_days,
                    "requested_days": days_requested,
                    "leave_type": leave_type.name,
                    "year": leave_year
                }), 400

        # Create the leave request
        leave_request = LeaveRequestModel(
            user_id=user.id,
            leave_type_id=leave_type.id,
            unit_id=user.unit_id,
            supervisor_id=user.supervisor_id,
            head_user_id=user.unit.head_user_id,
            start_date=parsed_start_date,
            end_date=parsed_end_date,
            days_requested=days_requested,
            reason=reason,
            status=LeaveRequestStatus.PENDING_SUPERVISOR
        )

        db.session.add(leave_request)
        db.session.flush()

        # Create initial approval action: submitted
        approval_action = ApprovalActionModel(
            leave_request_id=leave_request.id,
            action_by_user_id=user.id,
            action_role="staff",
            action_type=ApprovalActionType.SUBMITTED,
            comment="Leave application submitted"
        )

        db.session.add(approval_action)
        db.session.commit()

        return jsonify({
            "message": "Leave request submitted successfully",
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "leave_type_id": leave_request.leave_type_id,
                "unit_id": leave_request.unit_id,
                "supervisor_id": leave_request.supervisor_id,
                "head_user_id": leave_request.head_user_id,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status
            }
        }), 201

    
    #====================SUPERVISOR ENDORSE LEAVE==============================
    @app.route("/leave-requests/<int:request_id>/endorse", methods=["PATCH"])
    @roles_required("supervisor")
    def endorse_leave_request(request_id):
        """
        Supervisor-only route to endorse a leave request.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        supervisor_user = UserModel.query.get(current_user_id)

        if not supervisor_user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure this supervisor is the one assigned to the request
        if leave_request.supervisor_id != supervisor_user.id:
            return jsonify({"message": "You are not assigned to this leave request"}), 403

        # Only pending supervisor requests can be endorsed
        if leave_request.status != LeaveRequestStatus.PENDING_SUPERVISOR:
            return jsonify({
                "message": "Only leave requests pending supervisor action can be endorsed"
            }), 400

        data = request.get_json(silent=True) or {}
        comment = data.get("comment", "Recommended for approval")

        # Update leave request
        leave_request.status = LeaveRequestStatus.PENDING_HEAD
        leave_request.supervisor_action_at = datetime.utcnow()

        # Add approval action record
        approval_action = ApprovalActionModel(
            leave_request_id=leave_request.id,
            action_by_user_id=supervisor_user.id,
            action_role="supervisor",
            action_type=ApprovalActionType.ENDORSED,
            comment=comment
        )

        db.session.add(approval_action)
        db.session.commit()

        return jsonify({
            "message": "Leave request endorsed successfully",
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "leave_type_id": leave_request.leave_type_id,
                "unit_id": leave_request.unit_id,
                "supervisor_id": leave_request.supervisor_id,
                "head_user_id": leave_request.head_user_id,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat()
            }
        }), 200
    

    #============================SUPERVISOR REJECT LEAVE APPLICATION=========================
    @app.route("/leave-requests/<int:request_id>/reject", methods=["PATCH"])
    @roles_required("supervisor")
    def reject_leave_request(request_id):
        """
        Supervisor-only route to reject a leave request.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        supervisor_user = UserModel.query.get(current_user_id)

        if not supervisor_user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure this supervisor is the one assigned to the request
        if leave_request.supervisor_id != supervisor_user.id:
            return jsonify({"message": "You are not assigned to this leave request"}), 403

        # Only pending supervisor requests can be rejected here
        if leave_request.status != LeaveRequestStatus.PENDING_SUPERVISOR:
            return jsonify({
                "message": "Only leave requests pending supervisor action can be rejected"
            }), 400

        data = request.get_json(silent=True) or {}
        comment = data.get("comment", "Rejected by supervisor")

        # Update leave request
        leave_request.status = LeaveRequestStatus.REJECTED_BY_SUPERVISOR
        leave_request.supervisor_action_at = datetime.utcnow()

        # Add approval action record
        approval_action = ApprovalActionModel(
            leave_request_id=leave_request.id,
            action_by_user_id=supervisor_user.id,
            action_role="supervisor",
            action_type=ApprovalActionType.REJECTED,
            comment=comment
        )

        db.session.add(approval_action)
        db.session.commit()

        return jsonify({
            "message": "Leave request rejected successfully",
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "leave_type_id": leave_request.leave_type_id,
                "unit_id": leave_request.unit_id,
                "supervisor_id": leave_request.supervisor_id,
                "head_user_id": leave_request.head_user_id,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat()
            }
        }), 200
    
    #======================HOU Approval===========================
    @app.route("/leave-requests/<int:request_id>/approve", methods=["PATCH"])
    @roles_required("head_of_unit")
    def approve_leave_request(request_id):
        """
        Head-of-unit-only route to approve a leave request.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        head_user = UserModel.query.get(current_user_id)

        if not head_user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure this head user is the one assigned to the request
        if leave_request.head_user_id != head_user.id:
            return jsonify({"message": "You are not assigned to this leave request"}), 403

        # Only requests pending head approval can be approved here
        if leave_request.status != LeaveRequestStatus.PENDING_HEAD:
            return jsonify({
                "message": "Only leave requests pending head approval can be approved"
            }), 400

        data = request.get_json(silent=True) or {}
        comment = data.get("comment", "Approved by head of unit")

        # Find leave type
        leave_type = LeaveTypeModel.query.get(leave_request.leave_type_id)
        if not leave_type:
            return jsonify({"message": "Leave type not found"}), 404

        # If this leave type uses balance, check and deduct it
        if leave_type.requires_balance:
            leave_year = leave_request.start_date.year

            leave_balance = LeaveBalanceModel.query.filter_by(
                user_id=leave_request.user_id,
                leave_type_id=leave_request.leave_type_id,
                year=leave_year
            ).first()

            if not leave_balance:
                return jsonify({
                    "message": "Leave balance record not found for this user and leave type"
                }), 404

            if leave_balance.remaining_days < leave_request.days_requested:
                return jsonify({
                    "message": "Insufficient leave balance to approve this request"
                }), 400

            leave_balance.used_days += leave_request.days_requested
            leave_balance.remaining_days -= leave_request.days_requested

        # Update leave request
        leave_request.status = LeaveRequestStatus.APPROVED
        leave_request.head_action_at = datetime.utcnow()

        # Add approval action record
        approval_action = ApprovalActionModel(
            leave_request_id=leave_request.id,
            action_by_user_id=head_user.id,
            action_role="head_of_unit",
            action_type=ApprovalActionType.APPROVED,
            comment=comment
        )

        db.session.add(approval_action)
        db.session.commit()

        return jsonify({
            "message": "Leave request approved successfully",
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "leave_type_id": leave_request.leave_type_id,
                "unit_id": leave_request.unit_id,
                "supervisor_id": leave_request.supervisor_id,
                "head_user_id": leave_request.head_user_id,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "head_action_at": leave_request.head_action_at.isoformat()
            }
        }), 200
    
    #============================HOU REJECT LEAVE=======================
    @app.route("/leave-requests/<int:request_id>/reject-by-head", methods=["PATCH"])
    @roles_required("head_of_unit")
    def reject_leave_request_by_head(request_id):
        """
        Head-of-unit-only route to reject a leave request.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        head_user = UserModel.query.get(current_user_id)

        if not head_user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure this head user is the one assigned to the request
        if leave_request.head_user_id != head_user.id:
            return jsonify({"message": "You are not assigned to this leave request"}), 403

        # Only requests pending head approval can be rejected here
        if leave_request.status != LeaveRequestStatus.PENDING_HEAD:
            return jsonify({
                "message": "Only leave requests pending head approval can be rejected"
            }), 400

        data = request.get_json(silent=True) or {}
        comment = data.get("comment", "Rejected by head of unit")

        # Update leave request
        leave_request.status = LeaveRequestStatus.REJECTED_BY_HEAD
        leave_request.head_action_at = datetime.utcnow()

        # Add approval action record
        approval_action = ApprovalActionModel(
            leave_request_id=leave_request.id,
            action_by_user_id=head_user.id,
            action_role="head_of_unit",
            action_type=ApprovalActionType.REJECTED,
            comment=comment
        )

        db.session.add(approval_action)
        db.session.commit()

        return jsonify({
            "message": "Leave request rejected successfully",
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "leave_type_id": leave_request.leave_type_id,
                "unit_id": leave_request.unit_id,
                "supervisor_id": leave_request.supervisor_id,
                "head_user_id": leave_request.head_user_id,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "head_action_at": leave_request.head_action_at.isoformat()
            }
        }), 200
    

    #==============STAFF VIEW OWN REQUEST===================
    @app.route("/my-leave-requests", methods=["GET"])
    @roles_required("staff")
    def get_my_leave_requests():
        """
        Staff-only route to view the logged-in user's own leave requests.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        user = UserModel.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        leave_requests = LeaveRequestModel.query.filter_by(user_id=user.id).order_by(
            LeaveRequestModel.id.desc()
        ).all()

        results = []

        for leave_request in leave_requests:
            results.append({
                "id": leave_request.id,
                "leave_type_id": leave_request.leave_type_id,
                "leave_type_name": leave_request.leave_type.name if leave_request.leave_type else None,
                "unit_id": leave_request.unit_id,
                "supervisor_id": leave_request.supervisor_id,
                "head_user_id": leave_request.head_user_id,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "submitted_at": leave_request.submitted_at.isoformat() if leave_request.submitted_at else None,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat() if leave_request.supervisor_action_at else None,
                "head_action_at": leave_request.head_action_at.isoformat() if leave_request.head_action_at else None
            })

        return jsonify({
            "user_id": user.id,
            "username": user.username,
            "leave_requests": results
        }), 200

    #======================SUPERVISOR VIEW ASSIGNED LEAVE=======================

    @app.route("/supervisor/leave-requests/pending", methods=["GET"])
    @roles_required("supervisor")
    def get_supervisor_pending_leave_requests():
        """
        Supervisor-only route to view pending leave requests
        assigned to the logged-in supervisor.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        supervisor_user = UserModel.query.get(current_user_id)

        if not supervisor_user:
            return jsonify({"message": "User not found"}), 404

        leave_requests = LeaveRequestModel.query.filter_by(
            supervisor_id=supervisor_user.id,
            status=LeaveRequestStatus.PENDING_SUPERVISOR
        ).order_by(LeaveRequestModel.id.desc()).all()

        results = []

        for leave_request in leave_requests:
            results.append({
                "id": leave_request.id,
                "applicant_id": leave_request.user_id,
                "applicant_name": leave_request.applicant.full_name if leave_request.applicant else None,
                "leave_type_id": leave_request.leave_type_id,
                "leave_type_name": leave_request.leave_type.name if leave_request.leave_type else None,
                "unit_id": leave_request.unit_id,
                "unit_name": leave_request.unit.name if leave_request.unit else None,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "submitted_at": leave_request.submitted_at.isoformat() if leave_request.submitted_at else None
            })

        return jsonify({
            "supervisor_id": supervisor_user.id,
            "supervisor_username": supervisor_user.username,
            "pending_leave_requests": results
        }), 200
    
    #=========================HOU LIST OF APPROVAL REQUESTS===========================

    @app.route("/head/leave-requests/pending", methods=["GET"])
    @roles_required("head_of_unit")
    def get_head_pending_leave_requests():
        """
        Head-of-unit-only route to view leave requests
        pending final approval for the logged-in head user.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        head_user = UserModel.query.get(current_user_id)

        if not head_user:
            return jsonify({"message": "User not found"}), 404

        leave_requests = LeaveRequestModel.query.filter_by(
            head_user_id=head_user.id,
            status=LeaveRequestStatus.PENDING_HEAD
        ).order_by(LeaveRequestModel.id.desc()).all()

        results = []

        for leave_request in leave_requests:
            results.append({
                "id": leave_request.id,
                "applicant_id": leave_request.user_id,
                "applicant_name": leave_request.applicant.full_name if leave_request.applicant else None,
                "leave_type_id": leave_request.leave_type_id,
                "leave_type_name": leave_request.leave_type.name if leave_request.leave_type else None,
                "unit_id": leave_request.unit_id,
                "unit_name": leave_request.unit.name if leave_request.unit else None,
                "supervisor_id": leave_request.supervisor_id,
                "supervisor_name": leave_request.supervisor.full_name if leave_request.supervisor else None,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "submitted_at": leave_request.submitted_at.isoformat() if leave_request.submitted_at else None,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat() if leave_request.supervisor_action_at else None
            })

        return jsonify({
            "head_user_id": head_user.id,
            "head_username": head_user.username,
            "pending_leave_requests": results
        }), 200
    
    #=======================STAFF LEAVE BALANCE================
    @app.route("/my-leave-balances", methods=["GET"])
    @roles_required("staff")
    def get_my_leave_balances():
        """
        Staff-only route to view the logged-in user's own leave balances.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        user = UserModel.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        leave_balances = LeaveBalanceModel.query.filter_by(user_id=user.id).order_by(
            LeaveBalanceModel.year.desc(),
            LeaveBalanceModel.id.desc()
        ).all()

        results = []

        for balance in leave_balances:
            results.append({
                "id": balance.id,
                "leave_type_id": balance.leave_type_id,
                "leave_type_name": balance.leave_type.name if balance.leave_type else None,
                "year": balance.year,
                "allocated_days": balance.allocated_days,
                "used_days": balance.used_days,
                "remaining_days": balance.remaining_days,
                "created_at": balance.created_at.isoformat() if balance.created_at else None,
                "updated_at": balance.updated_at.isoformat() if balance.updated_at else None
            })

        return jsonify({
            "user_id": user.id,
            "username": user.username,
            "leave_balances": results
        }), 200


    #======================STAFF LEAVE APPLICATION HISTORY====================

    @app.route("/my-leave-requests/<int:request_id>", methods=["GET"])
    @roles_required("staff")
    def get_my_leave_request_detail(request_id):
        """
        Staff-only route to view one of the logged-in user's leave requests
        together with its approval history.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        user = UserModel.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure the logged-in user owns this leave request
        if leave_request.user_id != user.id:
            return jsonify({"message": "You are not allowed to view this leave request"}), 403

        # Sort approval history by action_date (oldest first)
        sorted_actions = sorted(
            leave_request.approval_actions,
            key=lambda action: action.action_date or datetime.min
        )

        approval_history = []

        for action in sorted_actions:
            approval_history.append({
                "id": action.id,
                "action_by_user_id": action.action_by_user_id,
                "action_by_username": action.action_by_user.username if action.action_by_user else None,
                "action_by_full_name": action.action_by_user.full_name if action.action_by_user else None,
                "action_role": action.action_role,
                "action_type": action.action_type,
                "comment": action.comment,
                "action_date": action.action_date.isoformat() if action.action_date else None
            })

        return jsonify({
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "leave_type_id": leave_request.leave_type_id,
                "leave_type_name": leave_request.leave_type.name if leave_request.leave_type else None,
                "unit_id": leave_request.unit_id,
                "unit_name": leave_request.unit.name if leave_request.unit else None,
                "supervisor_id": leave_request.supervisor_id,
                "supervisor_name": leave_request.supervisor.full_name if leave_request.supervisor else None,
                "head_user_id": leave_request.head_user_id,
                "head_user_name": leave_request.head_user.full_name if leave_request.head_user else None,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "submitted_at": leave_request.submitted_at.isoformat() if leave_request.submitted_at else None,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat() if leave_request.supervisor_action_at else None,
                "head_action_at": leave_request.head_action_at.isoformat() if leave_request.head_action_at else None
            },
            "approval_history": approval_history
        }), 200
    
    #===================SUPERVISOR CHECKS A LEAVE APPLICATION IN DETAIL===================
    @app.route("/supervisor/leave-requests/<int:request_id>", methods=["GET"])
    @roles_required("supervisor")
    def get_supervisor_leave_request_detail(request_id):
        """
        Supervisor-only route to view one assigned leave request
        together with its approval history.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        supervisor_user = UserModel.query.get(current_user_id)

        if not supervisor_user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure the logged-in supervisor is assigned to this request
        if leave_request.supervisor_id != supervisor_user.id:
            return jsonify({"message": "You are not allowed to view this leave request"}), 403

        # Sort approval history by action date (oldest first)
        sorted_actions = sorted(
            leave_request.approval_actions,
            key=lambda action: action.action_date or datetime.min
        )

        approval_history = []

        for action in sorted_actions:
            approval_history.append({
                "id": action.id,
                "action_by_user_id": action.action_by_user_id,
                "action_by_username": action.action_by_user.username if action.action_by_user else None,
                "action_by_full_name": action.action_by_user.full_name if action.action_by_user else None,
                "action_role": action.action_role,
                "action_type": action.action_type,
                "comment": action.comment,
                "action_date": action.action_date.isoformat() if action.action_date else None
            })

        return jsonify({
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "applicant_name": leave_request.applicant.full_name if leave_request.applicant else None,
                "leave_type_id": leave_request.leave_type_id,
                "leave_type_name": leave_request.leave_type.name if leave_request.leave_type else None,
                "unit_id": leave_request.unit_id,
                "unit_name": leave_request.unit.name if leave_request.unit else None,
                "supervisor_id": leave_request.supervisor_id,
                "supervisor_name": leave_request.supervisor.full_name if leave_request.supervisor else None,
                "head_user_id": leave_request.head_user_id,
                "head_user_name": leave_request.head_user.full_name if leave_request.head_user else None,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "submitted_at": leave_request.submitted_at.isoformat() if leave_request.submitted_at else None,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat() if leave_request.supervisor_action_at else None,
                "head_action_at": leave_request.head_action_at.isoformat() if leave_request.head_action_at else None
            },
            "approval_history": approval_history
        }), 200
    

    #===================HOU CHECKS A LEAVE APPLICATION IN DETAIL===================
    @app.route("/head/leave-requests/<int:request_id>", methods=["GET"])
    @roles_required("head_of_unit")
    def get_head_leave_request_detail(request_id):
        """
        Head-of-unit-only route to view one assigned leave request
        together with its approval history.
        """
        verify_jwt_in_request()

        current_user_id = get_jwt_identity()
        head_user = UserModel.query.get(current_user_id)

        if not head_user:
            return jsonify({"message": "User not found"}), 404

        leave_request = LeaveRequestModel.query.get(request_id)

        if not leave_request:
            return jsonify({"message": "Leave request not found"}), 404

        # Make sure the logged-in head user is assigned to this request
        if leave_request.head_user_id != head_user.id:
            return jsonify({"message": "You are not allowed to view this leave request"}), 403

        # Sort approval history by action date (oldest first)
        sorted_actions = sorted(
            leave_request.approval_actions,
            key=lambda action: action.action_date or datetime.min
        )

        approval_history = []

        for action in sorted_actions:
            approval_history.append({
                "id": action.id,
                "action_by_user_id": action.action_by_user_id,
                "action_by_username": action.action_by_user.username if action.action_by_user else None,
                "action_by_full_name": action.action_by_user.full_name if action.action_by_user else None,
                "action_role": action.action_role,
                "action_type": action.action_type,
                "comment": action.comment,
                "action_date": action.action_date.isoformat() if action.action_date else None
            })

        return jsonify({
            "leave_request": {
                "id": leave_request.id,
                "user_id": leave_request.user_id,
                "applicant_name": leave_request.applicant.full_name if leave_request.applicant else None,
                "leave_type_id": leave_request.leave_type_id,
                "leave_type_name": leave_request.leave_type.name if leave_request.leave_type else None,
                "unit_id": leave_request.unit_id,
                "unit_name": leave_request.unit.name if leave_request.unit else None,
                "supervisor_id": leave_request.supervisor_id,
                "supervisor_name": leave_request.supervisor.full_name if leave_request.supervisor else None,
                "head_user_id": leave_request.head_user_id,
                "head_user_name": leave_request.head_user.full_name if leave_request.head_user else None,
                "start_date": leave_request.start_date.isoformat(),
                "end_date": leave_request.end_date.isoformat(),
                "days_requested": leave_request.days_requested,
                "reason": leave_request.reason,
                "status": leave_request.status,
                "submitted_at": leave_request.submitted_at.isoformat() if leave_request.submitted_at else None,
                "supervisor_action_at": leave_request.supervisor_action_at.isoformat() if leave_request.supervisor_action_at else None,
                "head_action_at": leave_request.head_action_at.isoformat() if leave_request.head_action_at else None
            },
            "approval_history": approval_history
        }), 200


