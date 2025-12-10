from mangum import Mangum
import sys
import os

# Add backend to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the FastAPI app
from app.main import app

# Export handler for Vercel
handler = Mangum(app, lifespan="off")
