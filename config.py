import os
from dotenv import load_dotenv

#load environment variables from .env file
load_dotenv()

class Config:
    """
    Application configuration settings.
    """

    # PostgreSQL database connection string from the .env file
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    # Disable modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # secrete key for jwt generation
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


