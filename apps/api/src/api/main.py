"""FastAPI application for ArguMem."""

import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from argumem_core import ArguMem


app = FastAPI(
    title="ArguMem API", 
    description="API for ArguMem argumentative memory system",
    version="0.1.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ArguMem instance
argumem = ArguMem(db_path="argumem.db")


class MemoryRequest(BaseModel):
    """Request model for adding memories."""
    content: str
    context: str
    title: Optional[str] = None


class MemoryResponse(BaseModel):
    """Response model for added memories."""
    source_id: int
    message: str


class DatabaseInfo(BaseModel):
    """Database information model."""
    total_sources: int
    total_quotations: int
    total_propositions: int
    total_arguments: int


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "ArguMem API is running"}


@app.post("/memories", response_model=MemoryResponse)
async def add_memory(memory: MemoryRequest):
    """Add a new memory to the database."""
    try:
        source_id = argumem.addMemory(
            content=memory.content,
            context=memory.context,
            title=memory.title
        )
        return MemoryResponse(
            source_id=source_id,
            message=f"Memory added successfully with ID {source_id}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/database/info", response_model=DatabaseInfo)
async def get_database_info():
    """Get database statistics."""
    try:
        conn = sqlite3.connect("argumem.db")
        cursor = conn.cursor()
        
        # Get counts from each table
        cursor.execute("SELECT COUNT(*) FROM sources")
        sources_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM quotations")
        quotations_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM propositions")
        propositions_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM arguments")
        arguments_count = cursor.fetchone()[0]
        
        conn.close()
        
        return DatabaseInfo(
            total_sources=sources_count,
            total_quotations=quotations_count,
            total_propositions=propositions_count,
            total_arguments=arguments_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sources")
async def get_sources():
    """Get all sources from the database."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row  # Return rows as dicts
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, timestamp, raw_text, context, title 
            FROM sources 
            ORDER BY timestamp DESC
        """)
        sources = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sources/{source_id}/quotations")
async def get_source_quotations(source_id: int):
    """Get all quotations for a specific source."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, quotation_text, locator
            FROM quotations 
            WHERE source_id = ?
            ORDER BY id
        """, (source_id,))
        quotations = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return quotations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quotations")
async def get_all_quotations():
    """Get all quotations with their source information."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT q.id, q.quotation_text, q.locator,
                   s.id as source_id, s.title as source_title, s.context as source_context
            FROM quotations q
            JOIN sources s ON q.source_id = s.id
            ORDER BY s.timestamp DESC, q.id
        """)
        quotations = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return quotations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
