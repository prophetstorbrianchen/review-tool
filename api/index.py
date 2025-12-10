import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import FastAPI app
from app.main import app
from mangum import Mangum

# Configure root path for Vercel
app.root_path = "/api"

# Create handler for Vercel serverless
handler = Mangum(app, lifespan="off")
