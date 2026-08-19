# Example: system-to-system integration flow

Copy this file for anything that crosses two or more systems — the direct
replacement for a Visio swimlane diagram. Swap the subgraph names/steps for
the real systems involved.

```mermaid
flowchart TD
    subgraph SystemA["System A (source)"]
        a1([Trigger: nightly batch]) --> a2[Extract records]
        a2 --> a3[[Call System B API]]
    end

    subgraph SystemB["System B (destination)"]
        b1[Receive payload] --> b2{Valid mapping?}
        b2 -->|Yes| b3[Write record]
        b2 -->|No| b4[Route to error queue]
    end

    subgraph Human["Ops team"]
        h1[Review error queue] --> h2[Fix mapping / re-run]
    end

    a3 --> b1
    b3 --> done[(System of record updated)]
    b4 --> h1
    h2 --> a3

    classDef ok fill:#1a7f4b,color:#fff,stroke:none
    classDef warn fill:#b9770e,color:#fff,stroke:none
    classDef err fill:#b3261e,color:#fff,stroke:none
    classDef neutral fill:#5b6472,color:#fff,stroke:none

    class b3,done ok
    class b4 err
    class h1,h2 warn
```

## When you need the call sequence instead of the swimlane view

Same integration, shown as a sequence diagram — better when the point is
*what calls what, in what order*, rather than *who owns which step*:

```mermaid
sequenceDiagram
    participant A as System A
    participant B as System B
    participant Ops as Ops team

    A->>A: Extract records (nightly batch)
    A->>B: POST /records (payload)
    alt valid mapping
        B->>B: Write record
        B-->>A: 200 OK
    else invalid mapping
        B->>B: Route to error queue
        B-->>A: 422 mapping error
        Ops->>B: Review + fix mapping
        Ops->>A: Trigger re-run
    end
```
