---
name: mission-control
description: Orchestrates multiple skills to achieve high-level goals. Acts as the brain of the ecosystem to coordinate complex workflows across the SDLC.
---

# Mission Control (Orchestrator)

This is the "Brain" of the Gemini Skills ecosystem. It knows how to combine 50+ specialized skills to fulfill abstract, high-level requests.

## Capabilities

### 1. Workflow Orchestration
- Translates "Get us ready for production" into a sequence of: `security-scanner` -> `ux-auditor` -> `license-auditor` -> `project-health-check`.
- Handles dependencies between skills (e.g., using output from `browser-navigator` for `ux-auditor`).

### 2. Executive Reporting
- Summarizes the results of multiple skill executions into a single, high-level status report for stakeholders.

## Usage
- "Execute a full production-readiness audit and report the results."
- "Orchestrate a complete onboarding experience for a new developer."
- "I want to release a new version. Coordinate all necessary checks and documentation."
