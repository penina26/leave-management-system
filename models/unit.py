from db import db


class UnitModel(db.Model):
    """
    UnitModel represents the units table.

    This table stores organizational units or departments,
    such as:
    - IT Unit
    - HR Unit
    - Finance Unit

    Each unit may also have a head of unit.
    """

    __tablename__ = "units"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Foreign key to users table
    # This stores the user who is the head of the unit
    head_user_id = db.Column(
    db.Integer,
    db.ForeignKey(
        "users.id",
        name="fk_units_head_user_id",
        use_alter=True
    ),
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

    # One unit can have many members
    members = db.relationship(
        "UserModel",
        back_populates="unit",
        foreign_keys="UserModel.unit_id"
    )

    # One unit can have one head user
    # Example: IT Unit -> Carol
    head = db.relationship(
        "UserModel",
        back_populates="headed_units",
        foreign_keys=[head_user_id]
    )

    leave_requests = db.relationship(
        "LeaveRequestModel",
        back_populates="unit",
        foreign_keys="LeaveRequestModel.unit_id"
    )


    def __repr__(self):
        return f"<Unit {self.name}>"