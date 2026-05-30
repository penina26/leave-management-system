from flask import Flask

from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Import db & configuration settings
from db import db
from config import Config
import models

# resources
from resources.auth import register_auth_routes
from resources.leave_request import register_leave_request_routes
from resources.admin_users import register_admin_user_routes
from resources.admin_roles import register_admin_role_routes
from resources.admin_leave_types import register_admin_leave_type_routes
from resources.admin_leave_balances import register_admin_leave_balance_routes




# Create the migrate object
migrate = Migrate()

#Create JWT object
jwt = JWTManager()


def create_app():
    """
    Application factory function.
    This creates and configures the Flask application.
    """
    app = Flask(__name__)
    
    CORS(app)

    # Load configuration from Config class
    app.config.from_object(Config)

    # Initialize the database with the app
    db.init_app(app)

    # Initialize Flask-Migrate
    migrate.init_app(app, db)

    #Initialize JWTManager
    jwt.init_app(app)

    #Register route resources
    register_auth_routes(app)
    register_leave_request_routes(app)
    register_admin_user_routes(app)
    register_admin_role_routes(app)
    register_admin_leave_type_routes(app)
    register_admin_leave_balance_routes(app)



    # Simple test route
    @app.route("/")
    def home():
        return {"message": "Leave Management System API is running"}

    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
