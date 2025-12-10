from mangum import Mangum
import sys
import os

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import FastAPI app
from app.main import app

# Create Mangum handler for Vercel
handler = Mangum(app, lifespan="off")
