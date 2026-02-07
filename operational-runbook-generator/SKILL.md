---
name: operational-runbook-generator
description: Generates detailed, step-by-step operational runbooks for day-to-day tasks (scaling, patching, updates). Ensures consistency and safety with built-in rollback procedures.
---

# Operational Runbook Generator

This skill ensures that every operational task is documented with professional rigor to prevent human error.

## Capabilities

### 1. Runbook Synthesis
- Translates high-level requests (e.g., "Rotate the DB keys") into a structured Markdown runbook.
- Follows the format in `knowledge/operations/runbooks/standard.md`.

### 2. Risk & Rollback Planning
- Automatically identifies risks associated with the task.
- Generates specific rollback commands for each step.

## Usage
- "Generate an operational runbook for upgrading our RDS instance from t3.medium to t3.large."
- "Create a procedure for annual SSL certificate rotation."

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`.
