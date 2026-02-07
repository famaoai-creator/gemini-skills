---
name: human-in-the-loop-orchestrator
description: Integrates human judgment into AI workflows. Automatically pauses autonomous processes for human review when uncertainty is high or ethical stakes are significant.
---

# Human-in-the-Loop Orchestrator

This skill ensures that AI autonomy is balanced with human oversight, preventing errors in high-stakes decisions.

## Capabilities

### 1. Uncertainty Triage
- Monitors the confidence scores of other skills (e.g., `autonomous-skill-designer`, `refactoring-engine`).
- Injects a mandatory "Human Approval" step if confidence falls below a set threshold.

### 2. Decision Learning
- Records human corrections or approvals to fine-tune future AI decision-making logic.
- Generates "Why was this flagged?" reports for humans to review.

## Usage
- "Execute the mass refactoring with `human-in-the-loop-orchestrator` enabled for the core logic files."
- "Verify this AI-generated skill design before it is installed."
