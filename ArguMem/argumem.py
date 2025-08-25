"""Main ArguMem class - the primary interface for the library."""

from typing import Optional
from pathlib import Path

from .db import init_db, get_db
from .services.extraction import QuotationExtractor
from .services.text_processing import TextProcessor
from .repositories.database import SourceRepository, QuotationRepository


class ArguMem:
    """
    Main ArguMem interface for managing argumentative memories.
    
    Example:
        >>> mem = ArguMem(db_path="research.db")
        >>> source_id = mem.addMemory("AI is transforming society", "Tech article")
        >>> memories = mem.getMemory(query="AI")
    """
    
    def __init__(self, db_path: str = "argumem.db"):
        """
        Initialize ArguMem with a database location.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self._ensure_db_initialized()
        
        # Initialize services and repositories
        self.extractor = QuotationExtractor()
        self.text_processor = TextProcessor()
        self.source_repo = SourceRepository(db_path)
        self.quotation_repo = QuotationRepository(db_path)
    
    def _ensure_db_initialized(self):
        """Initialize database if it doesn't exist."""
        if not Path(self.db_path).exists():
            init_db(self.db_path)
    
    def addMemory(
        self, 
        content: str, 
        context: str, 
        title: Optional[str] = None,
        timestamp: Optional[str] = None
    ) -> int:
        """
        Add a new memory to the database.
        
        Args:
            content: The text content to store
            context: Context information about the content
            title: Optional title for the memory
            timestamp: Optional custom timestamp
            
        Returns:
            The ID of the created source
            
        Example:
            >>> mem = ArguMem()
            >>> source_id = mem.addMemory(
            ...     content="Climate change requires immediate action",
            ...     context="Environmental policy paper",
            ...     title="Climate Action Report 2024"
            ... )
        """
        # Split text into chunks if needed
        memory_chunks = self.text_processor.split_text(content)
        
        # Extract quotations from each chunk
        all_quotations = []
        for chunk in memory_chunks:
            quotations = self.extractor.extract(chunk)
            all_quotations.append(quotations)
        
        # Remove duplicates
        unique_quotations = self.text_processor.remove_duplicate_quotations(all_quotations)
        
        # Create source in database
        source_id = self.source_repo.create(content, context, title, timestamp)
        
        # Create quotations in database
        self.quotation_repo.create_many(unique_quotations, source_id)
        
        return source_id
    
    def getMemory(self, query: str) -> list:
        """
        Retrieve memories based on a query.
        
        Args:
            query: Search query
            
        Returns:
            List of matching memories
            
        Note:
            This method is a placeholder for future implementation.
        """
        # TODO: Implement memory retrieval
        raise NotImplementedError("getMemory will be implemented in retrieveSource.py")
