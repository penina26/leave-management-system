from db import db

from werkzeug.security import generate_password_hash, check_password_hash


class UserModel(db.Model):
    __tablename__ = "users"

    # -----------------------------------------
    # COLUMNS
    # -----------------------------------------

    id = db.Column(db.Integer, primary_key=True)
    employee_number = db.Column(db.String(50), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

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

    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )

    # -----------------------------------------
    # ROLE RELATIONSHIPS
    # -----------------------------------------

    user_roles = db.relationship(
        "UserRoleModel",
        back_populates="user",
        cascade="all, delete-orphan",
        overlaps="roles,users"
    )

    roles = db.relationship(
        "RoleModel",
        secondary="user_roles",
        back_populates="users",
        overlaps="user_roles,user,role"
    )

    # -----------------------------------------
    # UNIT RELATIONSHIPS
    # -----------------------------------------

    unit = db.relationship(
        "UnitModel",
        back_populates="members",
        foreign_keys=[unit_id]
    )

    headed_units = db.relationship(
        "UnitModel",
        back_populates="head",
        foreign_keys="UnitModel.head_user_id"
    )

    # -----------------------------------------
    # SUPERVISOR SELF-REFERENCE
    # -----------------------------------------

    supervisor = db.relationship(
        "UserModel",
        remote_side=[id],
        foreign_keys=[supervisor_id],
        back_populates="subordinates"
    )

    subordinates = db.relationship(
        "UserModel",
        foreign_keys=[supervisor_id],
        back_populates="supervisor"
    )

    # -----------------------------------------
    # LEAVE REQUEST RELATIONSHIPS
    # -----------------------------------------

    leave_requests = db.relationship(
        "LeaveRequestModel",
        foreign_keys="LeaveRequestModel.user_id",
        back_populates="applicant"
    )

    supervised_leave_requests = db.relationship(
        "LeaveRequestModel",
        foreign_keys="LeaveRequestModel.supervisor_id",
        back_populates="supervisor"
    )

    head_approved_leave_requests = db.relationship(
        "LeaveRequestModel",
        foreign_keys="LeaveRequestModel.head_user_id",
        back_populates="head_user"
    )

    # -----------------------------------------
    # LEAVE BALANCE RELATIONSHIPS
    # -----------------------------------------

    leave_balances = db.relationship(
        "LeaveBalanceModel",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # -----------------------------------------
    # APPROVAL ACTION RELATIONSHIPS
    # -----------------------------------------

    # One user can perform many approval actions
    approval_actions_performed = db.relationship(
        "ApprovalActionModel",
        back_populates="action_by_user"
    )

    # -----------------------------------------
    # METHODS
    # -----------------------------------------

    def set_password(self, password):
        """
        Hash a plain password and store it in password_hash.
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """
        Check whether the provided plain password matches
        the stored password hash.
        """
        return check_password_hash(self.password_hash, password)
    

    def __repr__(self):
        return f"<User {self.username}>"