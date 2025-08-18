import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', '6543'))
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
    
    # Supabase configuration
   # SUPABASE_URL = os.getenv('SUPABASE_URL')
   # SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    # Yahoo Finance API configuration
    START_DATE = '2000-01-01'
    RATE_LIMIT_DELAY = 1  # seconds between requests
    
    # Data processing configuration
    BATCH_SIZE = 1000  # number of records to process in batches
    MAX_RETRIES = 3    # maximum retry attempts for failed requests
    
    # Logging configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = 'historical_prices.log'
