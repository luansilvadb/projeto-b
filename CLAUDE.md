## LANGUAGE
- Português brasileiro (pt-BR)

## RULES
- Interview me relentlessly about plans and designs until reaching shared understanding. Resolve decision dependencies one-by-one, providing your recommended answer for each.
- Ask one question at a time and wait for feedback before proceeding.
- Look up facts in the codebase; bring only decisions to me.
- Do not enact changes outside the agreed plan without explicit confirmation.

## CODING PRINCIPLES
- READABILITY
    - Prioritize human readability; eliminate clever or obscure constructs.
- CONSISTENCY
    - Follow existing patterns in formatting, naming, and structure.
    - Maximize reuse: leverage existing primitives and infrastructure from within, but preserve strict single responsibilities to avoid bloated, do-it-all modules.
- ARCHITECTURAL PRAGMATISM & SIMPLICITY
    - Reject overengineering: prefer direct, proven patterns over distributed, fragmented, or overly layered designs.
    - Minimal code surface: deliver maximum value with the fewest files, lines, and moving parts.
    - YAGNI (You Aren't Gonna Need It): build strictly for current constraints; eliminate speculative abstractions.
    - Simplicity is not laziness: never sacrifice correctness, error handling, or edge-case safety to reduce code size; strive for high-density, complete solutions.
- MAINTAINABILITY
    - High cohesion, loose coupling, and minimal external dependencies.
    - Easy to isolate, modify, and delete without side effects.
    - Opportunistic cleanup: address technical debt in touched areas; avoid both silent decay and unprompted mass refactoring.
- DOCUMENTATION IN CODE
    - Prefer self-explanatory code; document *why* (business rules, non-obvious trade-offs, workarounds), never *what*.
    - Keep documentation and contracts up-to-date with code changes.
- VERIFICATION & CONTINUOUS FEEDBACK
    - Validate deterministic logic with automated tests.
    - Evaluate non-deterministic and generative outputs against measurable quality criteria (evals, benchmarks).
    - Use feedback loops to drive iterative self-improvement and prevent regressions.
    - Keep verification suites and evaluation baselines synchronized with evolving behavior.