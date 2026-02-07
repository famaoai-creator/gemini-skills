---
name: dependency-lifeline
description: Proactively monitors and plans library updates. Assesses the risk of breaking changes and proposes safe update paths.
---

# Dependency Lifeline

This skill moves from reactive vulnerability scanning to proactive dependency management.

## Capabilities

### 1. Update Strategy
- Monitors for new versions of project dependencies.
- Analyzes changelogs and issues to predict the risk of "Breaking Changes."

### 2. Automated Migration
- Proposes code changes required to support a newer library version.
- Validates updates by running existing tests via `test-genie`.

## Usage
- "What libraries in this project are out of date, and what is the risk of updating them?"
- "Propose an update plan for `package.json` to move to the next major version of React."
