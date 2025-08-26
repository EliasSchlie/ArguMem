"""LLM-powered quotation extraction service."""

from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

from ..models.schemas import Quotation

class QuotationExtractor:
    """Service for extracting quotations using LLM."""
    
    def __init__(self, model: str = "gpt-5", temperature: float = 0):
        self.llm = ChatOpenAI(model=model, temperature=temperature)
        self.parser = JsonOutputParser(pydantic_object=Quotation)
        self.prompt = ChatPromptTemplate.from_template(
            "Extract all meaningful quotations, statements, or key passages from the following text. "
            "For each quotation, identify its approximate location (e.g., 'beginning', 'middle', 'end', or specific paragraph/sentence). "
            "Return them as a JSON array of quotation objects.\n"
            "Text: {text}\n"
            "{format_instructions}"
        )
        self.chain = self.prompt | self.llm | self.parser
    
    def extract(self, text: str) -> List[Dict[str, str]]:
        """
        Extract quotations from text.
        
        Args:
            text: Text to extract quotations from
            
        Returns:
            List of dicts with 'text' and 'locator' keys
        """
        try:
            result = self.chain.invoke({
                "text": text,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            if isinstance(result, list):
                return [{"text": q.get("text", ""), "locator": q.get("locator")} for q in result]
            elif result:
                return [{"text": result.get("text", ""), "locator": result.get("locator")}]
            else:
                return []
        except Exception:
            return []