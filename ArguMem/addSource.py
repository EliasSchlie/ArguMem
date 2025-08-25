from typing import Optional

def addMemory(
        memoryContent: str,
        context: str,
        dir: str = "ArguMem_Vault",
        timestamp: Optional[str] = None,
        ):
    """
    Creates a new source in the agent's ArguMemory vault and starts a chain that derives and updates propositions following from it.

    Args:
        memoryContent: The content of the memory to add.
        context: The context of the memory to add.
        dir: The directory where the agent's ArguMemory vault lives.
        timestamp: The timestamp of the memory to add. (default: current timestamp)

    Returns:
        The id of the new source.
    """
    pass