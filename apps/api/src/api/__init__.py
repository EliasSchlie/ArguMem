"""ArguMem API application."""

from .main import app


def main():
    """Entry point for the API application."""
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
