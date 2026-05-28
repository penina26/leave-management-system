# Import SQLAlchemy so we can create the database object

from flask_sqlalchemy import SQLAlchemy

# create a single SLQLAlchemy object that will be used across the whole project

db = SQLAlchemy()