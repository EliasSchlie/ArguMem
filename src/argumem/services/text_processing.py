"""Text processing utilities."""

from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter


class TextProcessor:
    """Service for text chunking and processing."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "! ", "? ", "; ", " ", ""]
        )
    
    def split_text(self, text: str) -> List[str]:
        """
        Split text into chunks if it's longer than the chunk size.
        
        Args:
            text: Text to split
            
        Returns:
            List of text chunks
        """
        if len(text) > self.chunk_size:
            return self.text_splitter.split_text(text)
        else:
            return [text]
    
    @staticmethod
    def remove_duplicate_quotations(quotations: List[List[dict]]) -> List[dict]:
        """
        Remove duplicate quotations from nested lists.
        
        Args:
            quotations: Nested list of quotation dicts
            
        Returns:
            Flattened list with duplicates removed
        """
        flat_quotations = [q for sublist in quotations for q in sublist]
        seen = set()
        unique_quotations = []
        
        for q in flat_quotations:
            text = q["text"]
            if text not in seen:
                seen.add(text)
                unique_quotations.append(q)
        
        return unique_quotations
