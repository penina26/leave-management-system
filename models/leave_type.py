from db import db


class LeaveTypeModel(db.Model):
    """
    LeaveTypeModel represents the leave_types table.
    """

    __tablename__ = "leave_types"

    # -----------------------------------------
    # COLUMNS
    # -----------------------------------------

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    default_days = db.Column(db.Integer, nullable=False)

    requires_balance = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    is_active = db.Column(
        db.Boolean,
        nullable=False,
        default=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    # -----------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------

    leave_requests = db.relationship(
        "LeaveRequestModel",
        back_populates="leave_type"
    )

    leave_balances = db.relationship(
        "LeaveBalanceModel",
        back_populates="leave_type",
        cascade="all, delete-orphan"
    )

    
    def __repr__(self):
        return f"<LeaveType {self.name}>"