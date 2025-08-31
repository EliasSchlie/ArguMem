"""LLM-powered quotation extraction service."""

from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

from ..models.schemas import Quotations_list

class QuotationExtractor:
    """Service for extracting quotations using LLM."""
    
    def __init__(self, model: str = "gpt-5-mini"):

        with open("src/argumem/prompts/quote_extractor_system_prompt.md", "r") as f:
            system_prompt = f.read()

        self.llm = ChatOpenAI(
            model=model,            
            use_responses_api=True,
            system_message=system_prompt,
        ).with_structured_output(Quotations_list)
    
    def extract(self, text: str) -> List[Dict[str, str]]:
        """
        Extract quotations from text.
        
        Args:
            text: Text to extract quotations from
            
        Returns:
            List of dicts with 'text' and 'locator' keys
        """
        return self.llm.invoke(text)
        
if __name__ == "__main__":
    extractor = QuotationExtractor()
    test_text = """
    uv supports persistent configuration files at both the project- and user-level.

    Specifically, uv will search for a pyproject.toml or uv.toml file in the current directory, or in the nearest parent directory.

    Note

    For tool commands, which operate at the user level, local configuration files will be ignored. Instead, uv will exclusively read from user-level configuration (e.g., ~/.config/uv/uv.toml) and system-level configuration (e.g., /etc/uv/uv.toml).

    In workspaces, uv will begin its search at the workspace root, ignoring any configuration defined in workspace members. Since the workspace is locked as a single unit, configuration is shared across all members.

    If a pyproject.toml file is found, uv will read configuration from the [tool.uv] table. For example, to set a persistent index URL, add the following to a pyproject.toml:
    """
    print(extractor.extract(test_text))


# Tool approach is currently abandoned for this approach because it would require multiple api calls and would thus increase latency and cost.
'''
def log_quotation(
        text: str = Field(description="Proposition found in the source in its most clear and concise form"),
    ) -> None:
    """
    Log an atomic quotation from the provided source text. Quotations must be clear concise propositions.
    Usually, this requires paraphrasing what is written in the source, but sometimes it might be a direct quotation.
    """
    return None

def confirm_task_done() -> None:
    """Call this tool when you are sure that you successfully and completely finished your task. (might be immediately if the task doesn't require action)"""
    return None
'''