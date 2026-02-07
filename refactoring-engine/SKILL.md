---
name: refactoring-engine
description: Executes large-scale architectural refactoring and technical debt reduction across the entire codebase. Ensures consistency with modern design patterns.
---

# Refactoring Engine

This skill moves beyond line-by-line changes to perform systemic improvements to the code architecture.

## Capabilities

### 1. Pattern Migration
- Migrates components to new design systems (e.g., from CSS modules to Tailwind, or to Atomic Design).
- Converts legacy syntax to modern standards (e.g., Class components to Functional components in React).

### 2. Dependency Decoupling
- Identifies and breaks circular dependencies.
- Extracts shared logic into centralized services or utilities.

## Workflow

1.  **Pinning Tests (Mandatory)**: Before changing any code, create tests that capture the *current* behavior (even if it's messy). This ensures no regression occurs.
2.  **Architectural Analysis**: Use `cognitive-load-auditor` to identify high-complexity hotspots.
3.  **Pattern Migration**: Apply clean code patterns (Guard Clauses, Strategy, etc.).
