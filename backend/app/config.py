"""Configuration settings for the investment analyzer backend."""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
RAPID_API_KEY = os.getenv("RAPID_API_KEY")  # Optional for extended Yahoo Finance API access

# API Configuration
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "5000"))
ENABLE_CORS = os.getenv("ENABLE_CORS", "True").lower() == "true"

# Feature Flags
USE_FASTAPI = os.getenv("USE_FASTAPI", "True").lower() == "true"
ENABLE_NEWS_SENTIMENT = os.getenv("ENABLE_NEWS_SENTIMENT", "True").lower() == "true"
ENABLE_TREND_FORECASTING = os.getenv("ENABLE_TREND_FORECASTING", "True").lower() == "true"

# Cache settings
CACHE_TIMEOUT = int(os.getenv("CACHE_TIMEOUT", "3600"))  # 1 hour default