# ArguMem - Argumentative memory for LLMs

In this approach, memories are used to build a graph of propositions, that connect by arguing for and against each other.

The whole logic is based on the two endpoints add_memory and get_memory

I will write a paper about it

- The `/apps` directory contains a simple FastAPI + React frontend vor visualization and experimentation
- The main logic can be found in `/packages/argumem-core`

## Project Structure

```
ArguMem/
├── apps/                    # Applications using the core library
│   ├── api/                # FastAPI backend service
│   └── web/                # React frontend for visualization
├── packages/               # Reusable packages
│   └── argumem-core/      # Core ArguMem logic and algorithms
└── pyproject.toml         # Workspace configuration
```