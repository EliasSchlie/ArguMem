"""Database repository for sources and quotations."""

from typing import Optional, List, Dict
import sqlite3

from ..db import get_db


class SourceRepository:
    """Repository for source database operations."""
    
    def __init__(self, db_path: str = "argumem.db"):
        self.db_path = db_path
    
    def create(
        self,
        content: str, 
        context: str, 
        title: Optional[str] = None, 
        timestamp: Optional[str] = None
    ) -> int:
        """
        Create a source in the database.
        
        Args:
            content: The raw text content
            context: Context information  
            title: Optional title
            timestamp: Optional custom timestamp (unused, for compatibility)
            
        Returns:
            The ID of the created source
        """
        conn = get_db(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Note: timestamp parameter is ignored since the database uses auto-generated timestamps
            cursor.execute(
                "INSERT INTO sources (raw_text, context, title) VALUES (?, ?, ?)",
                (content, context, title)
            )
            
            source_id = cursor.lastrowid
            conn.commit()
            return source_id
        finally:
            conn.close()

    def get_recent(self, limit: int = 10) -> List[Dict]:
        """
        Get the most recent sources.
        
        Args:
            limit: The number of sources to retrieve
            
        Returns:
            A list of recent sources
        """
        conn = get_db(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute(
                "SELECT id, title, created_at, last_edited FROM sources ORDER BY last_edited DESC LIMIT ?",
                (limit,)
            )
            sources = cursor.fetchall()
            return [
                {"id": row[0], "title": row[1], "created_at": row[2], "last_edited": row[3]}
                for row in sources
            ]
        finally:
            conn.close()


class QuotationRepository:
    """Repository for quotation database operations."""
    
    def __init__(self, db_path: str = "argumem.db"):
        self.db_path = db_path
    
    def create_many(self, quotations: List[Dict[str, str]], source_id: int) -> None:
        """
        Create multiple quotations in the database.
        
        Args:
            quotations: List of quotation dicts with 'text' and 'locator' keys
            source_id: ID of the source these quotations belong to
        """
        if not quotations:
            return
        
        conn = get_db(self.db_path)
        cursor = conn.cursor()
        
        try:
            for quotation in quotations:
                cursor.execute(
                    "INSERT INTO quotations (source_id, quotation_text, locator) VALUES (?, ?, ?)",
                    (source_id, quotation["text"], quotation.get("locator"))
                )
            conn.commit()
        finally:
            conn.close()
