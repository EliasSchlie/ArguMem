"""FastAPI application for ArguMem."""

import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

import sys
import os
# Add the src directory to the Python path so we can import argumem
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from argumem import ArguMem


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

# Initialize ArguMem instance with environment variable fallback
def get_argumem_instance(api_key: str = None):
    """Get ArguMem instance with provided or environment API key."""
    if api_key:
        # Temporarily set the API key in environment for this request
        original_key = os.environ.get('OPENAI_API_KEY')
        os.environ['OPENAI_API_KEY'] = api_key
        try:
            instance = ArguMem(db_path="argumem.db")
            return instance
        finally:
            # Restore original key or remove if it wasn't set
            if original_key:
                os.environ['OPENAI_API_KEY'] = original_key
            elif 'OPENAI_API_KEY' in os.environ:
                del os.environ['OPENAI_API_KEY']
    else:
        return ArguMem(db_path="argumem.db")


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
async def add_memory(
    memory: MemoryRequest, 
    x_openai_api_key: str = Header(None, alias="X-OpenAI-API-Key")
):
    """Add a new memory to the database."""
    try:
        # Use provided API key or fall back to environment variable
        argumem_instance = get_argumem_instance(x_openai_api_key)
        
        source_id = argumem_instance.addMemory(
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


@app.get("/sources/{source_id}")
async def get_source(source_id: int):
    """Get a specific source by ID."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, timestamp, raw_text, context, title 
            FROM sources 
            WHERE id = ?
        """, (source_id,))
        source = cursor.fetchone()
        
        if not source:
            raise HTTPException(status_code=404, detail=f"Source {source_id} not found")
        
        conn.close()
        return dict(source)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quotations/{quotation_id}")
async def get_quotation(quotation_id: int):
    """Get a specific quotation by ID with its source information."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT q.id, q.quotation_text, q.locator,
                   s.id as source_id, s.title as source_title, 
                   s.context as source_context, s.raw_text as source_text,
                   s.timestamp as source_timestamp
            FROM quotations q
            JOIN sources s ON q.source_id = s.id
            WHERE q.id = ?
        """, (quotation_id,))
        quotation = cursor.fetchone()
        
        if not quotation:
            raise HTTPException(status_code=404, detail=f"Quotation {quotation_id} not found")
        
        conn.close()
        return dict(quotation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quotations/{quotation_id}/propositions")
async def get_quotation_propositions(quotation_id: int):
    """Get all propositions for a specific quotation."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Note: Current schema doesn't link propositions directly to quotations
        # This would require joining through argument_quotation and argument_proposition tables
        # For now, return empty list since no propositions are created in the current implementation
        cursor.execute("""
            SELECT p.id, p.core_thesis as proposition_text, NULL as paraphrase
            FROM propositions p
            JOIN argument_proposition ap ON p.id = ap.proposition_id
            JOIN arguments a ON ap.argument_id = a.id  
            JOIN argument_quotation aq ON a.id = aq.argument_id
            WHERE aq.quotation_id = ?
            ORDER BY p.id
        """, (quotation_id,))
        propositions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return propositions
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


@app.get("/recent")
async def get_recent_items():
    """Get recently added items from all tables."""
    try:
        conn = sqlite3.connect("argumem.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get recent sources
        cursor.execute("""
            SELECT 'source' as type, id, timestamp, title, 
                   substr(raw_text, 1, 200) as preview,
                   raw_text as content, context
            FROM sources 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        sources = [dict(row) for row in cursor.fetchall()]
        
        # Get recent quotations with source info
        cursor.execute("""
            SELECT 'quotation' as type, q.id, s.timestamp, 
                   'Quotation from: ' || COALESCE(s.title, 'Source #' || s.id) as title,
                   substr(q.quotation_text, 1, 200) as preview,
                   q.quotation_text as content, q.locator,
                   s.id as source_id, s.title as source_title
            FROM quotations q
            JOIN sources s ON q.source_id = s.id
            ORDER BY s.timestamp DESC, q.id DESC
            LIMIT 10
        """)
        quotations = [dict(row) for row in cursor.fetchall()]
        
        # Get recent propositions with quotation info
        # Note: Current schema doesn't directly link propositions to quotations
        # Skip propositions for now since none are created in current implementation
        propositions = []
        
        # Combine and sort all items by timestamp
        all_items = sources + quotations + propositions
        all_items.sort(key=lambda x: x['timestamp'], reverse=True)
        
        conn.close()
        return all_items[:20]  # Return top 20 most recent items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/database")
async def clear_database():
    """Clear all data from the database."""
    try:
        conn = sqlite3.connect("argumem.db")
        cursor = conn.cursor()
        
        # Delete all data from tables (in reverse dependency order)
        cursor.execute("DELETE FROM arguments")
        cursor.execute("DELETE FROM propositions")
        cursor.execute("DELETE FROM quotations")
        cursor.execute("DELETE FROM sources")
        
        # Reset auto-increment counters
        cursor.execute("DELETE FROM sqlite_sequence")
        
        conn.commit()
        conn.close()
        
        return {"message": "Database cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
