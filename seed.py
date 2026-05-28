# seed.py

from datetime import date, datetime

from werkzeug.security import generate_password_hash

from app import create_app
from db import db

from models.role import RoleModel
from models.user import UserModel
from models.user_role import UserRoleModel
from models.unit import UnitModel
from models.leave_type import LeaveTypeModel
from models.leave_balance import LeaveBalanceModel
from models.leave_request import LeaveRequestModel, LeaveRequestStatus
from models.approval_action import ApprovalActionModel, ApprovalActionType


app = create_app()


def get_or_create(model, defaults=None, **filters):
    """
    Generic helper:
    - If a record exists, return it
    - If it does not exist, create it

    defaults:
        values to set/update on the instance
    filters:
        values used to find the instance
    """
    instance = model.query.filter_by(**filters).first()

    if instance:
        if defaults:
            for key, value in defaults.items():
                setattr(instance, key, value)
        return instance, False

    params = {}
    params.update(filters)
    if defaults:
        params.update(defaults)

    instance = model(**params)
    db.session.add(instance)
    return instance, True


def ensure_user_role(user, role):
    """
    Make sure a user-role assignment exists in user_roles.
    """
    existing = UserRoleModel.query.filter_by(
        user_id=user.id,
        role_id=role.id
    ).first()

    if not existing:
        db.session.add(
            UserRoleModel(
                user_id=user.id,
                role_id=role.id
            )
        )


def seed_roles():
    """
    Seed roles table.
    """
    roles_data = [
        {
            "name": "staff",
            "description": "Can apply for leave and view personal leave records"
        },
        {
            "name": "supervisor",
            "description": "Can endorse or reject leave requests from direct reports"
        },
        {
            "name": "head_of_unit",
            "description": "Can approve or reject endorsed leave requests"
        },
        {
            "name": "admin",
            "description": "Can manage users, roles, units, leave types and balances"
        },
    ]

    roles = {}

    for role_data in roles_data:
        role, _ = get_or_create(
            RoleModel,
            defaults={"description": role_data["description"]},
            name=role_data["name"]
        )
        roles[role.name] = role

    db.session.flush()
    return roles


def seed_units():
    """
    Seed units table.
    Head users are assigned later after users exist.
    """
    units_data = [
        {
            "name": "IT Unit",
            "description": "Handles IT systems, applications and support"
        },
        {
            "name": "HR Unit",
            "description": "Handles human resource operations"
        },
    ]

    units = {}

    for unit_data in units_data:
        unit, _ = get_or_create(
            UnitModel,
            defaults={"description": unit_data["description"]},
            name=unit_data["name"]
        )
        units[unit.name] = unit

    db.session.flush()
    return units


def seed_leave_types():
    """
    Seed leave types table.
    """
    leave_types_data = [
        {
            "name": "Annual Leave",
            "description": "Annual rest leave",
            "default_days": 30,
            "requires_balance": True,
            "is_active": True,
        },
        {
            "name": "Sick Leave",
            "description": "Medical leave for illness",
            "default_days": 14,
            "requires_balance": True,
            "is_active": True,
        },
        {
            "name": "Compassionate Leave",
            "description": "Leave for compassionate reasons",
            "default_days": 7,
            "requires_balance": True,
            "is_active": True,
        },
    ]

    leave_types = {}

    for lt_data in leave_types_data:
        leave_type, _ = get_or_create(
            LeaveTypeModel,
            defaults={
                "description": lt_data["description"],
                "default_days": lt_data["default_days"],
                "requires_balance": lt_data["requires_balance"],
                "is_active": lt_data["is_active"],
            },
            name=lt_data["name"]
        )
        leave_types[leave_type.name] = leave_type

    db.session.flush()
    return leave_types


def seed_users(units):
    """
    Seed users table.
    We create users first, then assign supervisors and unit heads after IDs exist.
    """
    default_password = generate_password_hash("Password123!")

    users_data = [
        {
            "employee_number": "EMP001",
            "full_name": "Alice Staff",
            "username": "alice",
            "email": "alice@example.com",
            "password_hash": default_password,
            "unit_id": units["IT Unit"].id,
            "supervisor_username": "bob",
        },
        {
            "employee_number": "EMP002",
            "full_name": "Bob Supervisor",
            "username": "bob",
            "email": "bob@example.com",
            "password_hash": default_password,
            "unit_id": units["IT Unit"].id,
            "supervisor_username": None,
        },
        {
            "employee_number": "EMP003",
            "full_name": "Carol Head",
            "username": "carol",
            "email": "carol@example.com",
            "password_hash": default_password,
            "unit_id": units["IT Unit"].id,
            "supervisor_username": None,
        },
        {
            "employee_number": "EMP004",
            "full_name": "David Staff",
            "username": "david",
            "email": "david@example.com",
            "password_hash": default_password,
            "unit_id": units["IT Unit"].id,
            "supervisor_username": "bob",
        },
        {
            "employee_number": "EMP005",
            "full_name": "Eve Admin",
            "username": "eve",
            "email": "eve@example.com",
            "password_hash": default_password,
            "unit_id": None,
            "supervisor_username": None,
        },
        {
            "employee_number": "EMP006",
            "full_name": "Grace Head HR",
            "username": "grace",
            "email": "grace@example.com",
            "password_hash": default_password,
            "unit_id": units["HR Unit"].id,
            "supervisor_username": None,
        },
    ]

    users = {}

    # First pass: create/update users without supervisor_id
    for user_data in users_data:
        user, _ = get_or_create(
            UserModel,
            defaults={
                "employee_number": user_data["employee_number"],
                "full_name": user_data["full_name"],
                "email": user_data["email"],
                "password_hash": user_data["password_hash"],
                "unit_id": user_data["unit_id"],
                "is_active": True,
            },
            username=user_data["username"]
        )
        users[user.username] = user

    db.session.flush()

    # Second pass: assign supervisors now that all users exist
    for user_data in users_data:
        username = user_data["username"]
        supervisor_username = user_data["supervisor_username"]

        if supervisor_username:
            users[username].supervisor_id = users[supervisor_username].id

    # Assign unit heads now that users exist
    units["IT Unit"].head_user_id = users["carol"].id
    units["HR Unit"].head_user_id = users["grace"].id

    db.session.flush()
    return users


def seed_user_roles(users, roles):
    """
    Seed user_roles table.
    """
    ensure_user_role(users["alice"], roles["staff"])
    ensure_user_role(users["david"], roles["staff"])

    ensure_user_role(users["bob"], roles["supervisor"])
    ensure_user_role(users["carol"], roles["head_of_unit"])
    ensure_user_role(users["grace"], roles["head_of_unit"])
    ensure_user_role(users["eve"], roles["admin"])

    # Optional: if you want multi-role examples
    ensure_user_role(users["bob"], roles["staff"])
    ensure_user_role(users["carol"], roles["staff"])

    db.session.flush()


def seed_leave_balances(users, leave_types):
    """
    Seed leave_balances table.
    """
    balances_data = [
        {
            "user": users["alice"],
            "leave_type": leave_types["Annual Leave"],
            "year": 2026,
            "allocated_days": 30,
            "used_days": 5,
            "remaining_days": 25,
        },
        {
            "user": users["alice"],
            "leave_type": leave_types["Sick Leave"],
            "year": 2026,
            "allocated_days": 14,
            "used_days": 0,
            "remaining_days": 14,
        },
        {
            "user": users["david"],
            "leave_type": leave_types["Annual Leave"],
            "year": 2026,
            "allocated_days": 30,
            "used_days": 2,
            "remaining_days": 28,
        },
        {
            "user": users["david"],
            "leave_type": leave_types["Sick Leave"],
            "year": 2026,
            "allocated_days": 14,
            "used_days": 1,
            "remaining_days": 13,
        },
    ]

    for item in balances_data:
        get_or_create(
            LeaveBalanceModel,
            defaults={
                "allocated_days": item["allocated_days"],
                "used_days": item["used_days"],
                "remaining_days": item["remaining_days"],
            },
            user_id=item["user"].id,
            leave_type_id=item["leave_type"].id,
            year=item["year"]
        )

    db.session.flush()


def seed_leave_requests(users, units, leave_types):
    """
    Seed leave_requests table.
    We create two sample leave requests:
    - one pending_head
    - one pending_supervisor
    """
    requests = {}

    # Request 1: Alice has already been endorsed by supervisor and is pending head approval
    request_1, _ = get_or_create(
        LeaveRequestModel,
        defaults={
            "unit_id": units["IT Unit"].id,
            "supervisor_id": users["bob"].id,
            "head_user_id": users["carol"].id,
            "days_requested": 5,
            "reason": "Annual leave request",
            "status": LeaveRequestStatus.PENDING_HEAD,
            "submitted_at": datetime(2026, 5, 20, 9, 0, 0),
            "supervisor_action_at": datetime(2026, 5, 21, 8, 45, 0),
            "head_action_at": None,
        },
        user_id=users["alice"].id,
        leave_type_id=leave_types["Annual Leave"].id,
        start_date=date(2026, 6, 10),
        end_date=date(2026, 6, 14),
    )
    requests["alice_pending_head"] = request_1

    # Request 2: David has submitted and is waiting for supervisor endorsement
    request_2, _ = get_or_create(
        LeaveRequestModel,
        defaults={
            "unit_id": units["IT Unit"].id,
            "supervisor_id": users["bob"].id,
            "head_user_id": users["carol"].id,
            "days_requested": 3,
            "reason": "Family commitment",
            "status": LeaveRequestStatus.PENDING_SUPERVISOR,
            "submitted_at": datetime(2026, 5, 22, 10, 30, 0),
            "supervisor_action_at": None,
            "head_action_at": None,
        },
        user_id=users["david"].id,
        leave_type_id=leave_types["Annual Leave"].id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 3),
    )
    requests["david_pending_supervisor"] = request_2

    db.session.flush()
    return requests


def seed_approval_actions(users, requests):
    """
    Seed approval_actions table.
    """
    actions_data = [
        # Alice request: submitted
        {
            "leave_request_id": requests["alice_pending_head"].id,
            "action_by_user_id": users["alice"].id,
            "action_role": "staff",
            "action_type": ApprovalActionType.SUBMITTED,
            "comment": "Leave application submitted",
            "action_date": datetime(2026, 5, 20, 9, 0, 0),
        },
        # Alice request: endorsed
        {
            "leave_request_id": requests["alice_pending_head"].id,
            "action_by_user_id": users["bob"].id,
            "action_role": "supervisor",
            "action_type": ApprovalActionType.ENDORSED,
            "comment": "Recommended for approval",
            "action_date": datetime(2026, 5, 21, 8, 45, 0),
        },
        # David request: submitted
        {
            "leave_request_id": requests["david_pending_supervisor"].id,
            "action_by_user_id": users["david"].id,
            "action_role": "staff",
            "action_type": ApprovalActionType.SUBMITTED,
            "comment": "Leave request submitted",
            "action_date": datetime(2026, 5, 22, 10, 30, 0),
        },
    ]

    for action_data in actions_data:
        existing = ApprovalActionModel.query.filter_by(
            leave_request_id=action_data["leave_request_id"],
            action_by_user_id=action_data["action_by_user_id"],
            action_type=action_data["action_type"]
        ).first()

        if not existing:
            db.session.add(ApprovalActionModel(**action_data))

    db.session.flush()


def seed_all():
    """
    Main seed function.
    """
    with app.app_context():
        try:
            print("Seeding roles...")
            roles = seed_roles()

            print("Seeding units...")
            units = seed_units()

            print("Seeding leave types...")
            leave_types = seed_leave_types()

            print("Seeding users...")
            users = seed_users(units)

            print("Seeding user roles...")
            seed_user_roles(users, roles)

            print("Seeding leave balances...")
            seed_leave_balances(users, leave_types)

            print("Seeding leave requests...")
            requests = seed_leave_requests(users, units, leave_types)

            print("Seeding approval actions...")
            seed_approval_actions(users, requests)

            db.session.commit()
            print("✅ Initial seed completed successfully.")

        except Exception as e:
            db.session.rollback()
            print("❌ Seed failed. Rolling back transaction.")
            raise e


if __name__ == "__main__":
    seed_all()
