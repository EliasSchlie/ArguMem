## ArguMem — Argumentative memory for LLMs

ArguMem turns unstructured text into an argument graph. It stores sources, extracts atomic quotations, and (roadmap) builds propositions and arguments on top.

### Core concepts
- **Source**: raw text with optional `context` and `title`.
- **Quotation**: atomic statement extracted from a source.
    - Can be represented as `[source_type]: "[source_name]" by [author(s)] [date] claims "[quotation]"` e.g. `Post on X: "Self-driving soon" by Elon Musk 01.01.2050 claims: "We will have self driving soon"`
    - Always true to source (e.g. `Müller et al., 2025 claims that Schneider et al., 2010 claims that AI will likely be beneficial to humanity`)
- **Proposition**: A clear one sentence claim that can be true or false. 
    - Can be supported/countered by multiple arguments.
    - Are used in arguments to support/counter other propositions 
- **Argument**: a collection of premises (= propositions or quotations) that support or counter its proposition.

### Data model (high-level)
```mermaid
flowchart TD

prem[Premise]
quot[Quotation]
prop[""Proposition""]
s[Source]
arg[Argument]

s -. many .-> quot
arg -. many .-> prem
prop -. many .-> arg
prem -. use .-> prop
prem -. use .-> quot
```

### Core functions

The [[argumem.py]] file contains the `Argumem` class which offers the following types of interactions
- `add_memory`
- `get_memory`
- `check_belief`

### Project layout
- `src/argumem`: core library
- `src/api`: FastAPI service exposing the HTTP API
- `web`: minimal React UI (Vite)

## Quickstart (with frontend)

Prereqs: `uv` (Python), Node 18+.

1) Run the API
```bash
uv run src/api/main.py
```

2) Run the web UI
```bash
cd web && npm install && npm run dev
```