from db import db


class LeaveRequestStatus:
    """
    Allowed status values for leave requests.
    """
    PENDING_SUPERVISOR = "pending_supervisor"
    PENDING_HEAD = "pending_head"
    APPROVED = "approved"
    REJECTED_BY_SUPERVISOR = "rejected_by_supervisor"
    REJECTED_BY_HEAD = "rejected_by_head"
    CANCELLED = "cancelled"


class LeaveRequestModel(db.Model):
    """
    LeaveRequestModel represents the leave_requests table.

    This is the core workflow table of the system.
    """

    __tablename__ = "leave_requests"

    # -----------------------------------------
    # COLUMNS
    # -----------------------------------------

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    leave_type_id = db.Column(
        db.Integer,
        db.ForeignKey("leave_types.id"),
        nullable=False
    )

    unit_id = db.Column(
        db.Integer,
        db.ForeignKey("units.id"),
        nullable=True
    )

    supervisor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    head_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True
    )

    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    days_requested = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=False)

    status = db.Column(
        db.String(50),
        nullable=False,
        default=LeaveRequestStatus.PENDING_SUPERVISOR
    )

    submitted_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    supervisor_action_at = db.Column(
        db.DateTime,
        nullable=True
    )

    head_action_at = db.Column(
        db.DateTime,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )

    # -----------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------

    applicant = db.relationship(
        "UserModel",
        foreign_keys=[user_id],
        back_populates="leave_requests"
    )

    leave_type = db.relationship(
        "LeaveTypeModel",
        back_populates="leave_requests"
    )

    unit = db.relationship(
        "UnitModel",
        foreign_keys=[unit_id],
        back_populates="leave_requests"
    )

    supervisor = db.relationship(
        "UserModel",
        foreign_keys=[supervisor_id],
        back_populates="supervised_leave_requests"
    )

    head_user = db.relationship(
        "UserModel",
        foreign_keys=[head_user_id],
        back_populates="head_approved_leave_requests"
    )

    # One leave request can have many approval actions
    approval_actions = db.relationship(
        "ApprovalActionModel",
        back_populates="leave_request",
        cascade="all, delete-orphan"
    )

  
    def __repr__(self):
        return f"<LeaveRequest id={self.id}, status={self.status}>"