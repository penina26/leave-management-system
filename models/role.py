from db import db

class RoleModel(db.Model):
    """    
    RoleModel represents the roles table in the database.

    This table will store system roles such as:
    - staff
    - supervisor
    - head_of_unit
    - admin

    """

    # table name

    __tablename__ = "roles"

    
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(50), unique=True, nullable=False)

    description = db.Column(db.Text, nullable=True)

    
    # Relationship to UserRoleModel
    # One role can appear in many user_roles rows

    
    user_roles = db.relationship(
        "UserRoleModel",
        back_populates="role",
        cascade="all, delete-orphan",
        overlaps="users,roles"
    )

    
    users = db.relationship(
        "UserModel",
        secondary="user_roles",
        back_populates="roles",
        overlaps="user_roles,user,role"
    )




    def __repr__(self):
        return f"<Role {self.name}>"
