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
            timestamp: Optional timestamp
            
        Returns:
            The ID of the created source
        """
        conn = get_db(self.db_path)
        cursor = conn.cursor()
        
        try:
            if timestamp:
                cursor.execute(
                    "INSERT INTO sources (raw_text, context, title, timestamp) VALUES (?, ?, ?, ?)",
                    (content, context, title, timestamp)
                )
            else:
                cursor.execute(
                    "INSERT INTO sources (raw_text, context, title) VALUES (?, ?, ?)",
                    (content, context, title)
                )
            
            source_id = cursor.lastrowid
            conn.commit()
            return source_id
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
