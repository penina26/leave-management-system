from db import db


class ApprovalActionType:
    """
    Allowed action types for approval history.
    """
    SUBMITTED = "submitted"
    ENDORSED = "endorsed"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class ApprovalActionModel(db.Model):
    """
    ApprovalActionModel represents the approval_actions table.

    This table stores the history of actions performed on a leave request.
    """

    __tablename__ = "approval_actions"

    # -----------------------------------------
    # COLUMNS
    # -----------------------------------------

    id = db.Column(db.Integer, primary_key=True)

    leave_request_id = db.Column(
        db.Integer,
        db.ForeignKey("leave_requests.id"),
        nullable=False
    )

    action_by_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    action_role = db.Column(db.String(50), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    comment = db.Column(db.Text, nullable=True)

    action_date = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    # -----------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------

    # Each approval action belongs to one leave request
    leave_request = db.relationship(
        "LeaveRequestModel",
        back_populates="approval_actions"
    )

    # Each approval action is performed by one user
    action_by_user = db.relationship(
        "UserModel",
        back_populates="approval_actions_performed"
    )

   
    def __repr__(self):
        return (
            f"<ApprovalAction leave_request_id={self.leave_request_id}, "
            f"action_type={self.action_type}>"
        )
