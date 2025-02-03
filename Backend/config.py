import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Config:
    """
    A class used to represent the base configuration for the Flask application.

    Attributes:
        HOST_NAME (str): The hostname for the application, default is 'localhost'.
        APP_PORT (int): The port number for the application, default is 5000.
        GEMINI_API_KEY (str): The API key for the Gemini service.
        MONGO_DATABASE (str): The name of the MongoDB database, default is 'remyrecipex'.
        MONGO_URI (str): The URI for connecting to MongoDB, default is 'mongodb://localhost:27017'.
        CORS_SUPPORTS_CREDENTIALS (str): Indicates if CORS supports credentials, default is 'false'.
        SAMESITE_POLICY (str): The SameSite policy for session cookies, default is 'Lax'.
        DEBUG (bool): Indicates if the application is in debug mode, default is True.
        SECRET_KEY (str): The secret key for the Flask application, default is 'FLASK-RemyRecipeX-APP'.
        CORS_CONFIG (dict): Configuration for CORS, including allowed origins and methods.
    """

    HOST_NAME = os.getenv("HOST_NAME", 'localhost')
    APP_PORT = os.getenv("APP_PORT", 5000)

    # MONGO_DATABASE = os.getenv("MONGO_DATABASE", 'remyrecipex')
    # MONGO_URI = os.getenv("MONGO_URI", 'mongodb://localhost:27017')

    CORS_SUPPORTS_CREDENTIALS = os.getenv("CORS_SUPPORTS_CREDENTIALS", 'false')
    SAMESITE_POLICY = os.getenv("SESSION_COOKIE_SAMESITE", 'Lax')

    DEBUG = os.getenv("DEBUG", True)
    SECRET_KEY = os.getenv("SECRET_KEY", "FLASK-RemyRecipeX-APP")
    CORS_CONFIG = {
        'CORS_ORIGINS' : os.getenv("CORS_ORIGINS", '*').split(','),
        'CORS_METHODS': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'TRACE']
    }
