---
name: cognitive-load-auditor
description: Analyzes code and UI complexity from a cognitive science perspective. Identifies areas that exceed human information processing limits to prevent developer burnout and user confusion.
---

# Cognitive Load Auditor

This skill optimizes for the "Human Interface" by ensuring complexity stays within manageable limits.

## Capabilities

### 1. Developer Experience (DX) Audit
- **Complexity Scoring**: Estimates **Cyclomatic Complexity** and nesting depth.
- **Mental Effort Mapping**: Identifies "Spaghetti Logic" or overly dense functions that require excessive mental effort to understand.
- Suggests refactoring based on chunking and information hierarchy.

### 2. User Cognitive Load
- Analyzes UI density and decision points in screenshots.
- Flags "Choice Overload" or confusing navigation paths.

## Usage
- "Audit the cognitive load of our main processing loop and suggest ways to simplify it."
- "Is this new dashboard too complex for a first-time user? Perform a cognitive audit."

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
