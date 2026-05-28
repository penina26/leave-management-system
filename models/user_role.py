# Import the shared database object
from db import db


class UserRoleModel(db.Model):
    """
    UserRoleModel represents the user_roles table.

    This is the bridge table for the many-to-many relationship
    between users and roles.

    Example:
    - one user can have many roles
    - one role can belong to many users
    """

    # Name of the table in the database
    __tablename__ = "user_roles"

    # Prevent duplicate user-role assignments
    __table_args__ = (
        db.UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )

    # Primary key
    id = db.Column(db.Integer, primary_key=True)

    # Foreign key to users table
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Foreign key to roles table
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)

    # Date and time when the role was assigned
    assigned_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    
    # Relationship to UserModel
    # Each user_roles row belongs to one user
    user = db.relationship(
        "UserModel",
        back_populates="user_roles"
    )

    
    # Relationship to RoleModel
    # Each user_roles row belongs to one role
    role = db.relationship(
        "RoleModel",
        back_populates="user_roles"
    )



    def __repr__(self):
        """
        Helpful string representation for debugging
        """
        return f"<UserRole user_id={self.user_id}, role_id={self.role_id}>"