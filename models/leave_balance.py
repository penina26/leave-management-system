from db import db


class LeaveBalanceModel(db.Model):
    """
    LeaveBalanceModel represents the leave_balances table.

    This table stores the leave balance of a user for a specific
    leave type and year.
    """

    __tablename__ = "leave_balances"

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "leave_type_id",
            "year",
            name="uq_user_leave_type_year"
        ),
    )


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

    year = db.Column(db.Integer, nullable=False)
    allocated_days = db.Column(db.Integer, nullable=False)

    used_days = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    remaining_days = db.Column(db.Integer, nullable=False)

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

    user = db.relationship(
        "UserModel",
        back_populates="leave_balances"
    )

    leave_type = db.relationship(
        "LeaveTypeModel",
        back_populates="leave_balances"
    )

   
    def __repr__(self):
        return (
            f"<LeaveBalance user_id={self.user_id}, "
            f"leave_type_id={self.leave_type_id}, year={self.year}>"
        )