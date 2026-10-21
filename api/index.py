import sys
import os

# Add repository root to Python module search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app

# Vercel ASGI serverless handler
handler = app

