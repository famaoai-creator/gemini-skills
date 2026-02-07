---
name: mission-control
description: Orchestrates multiple skills to achieve high-level goals. Acts as the brain of the ecosystem to coordinate complex workflows across the SDLC.
---

# Mission Control (Orchestrator)

This is the "Brain" of the Gemini Skills ecosystem. It knows how to combine 50+ specialized skills to fulfill abstract, high-level requests.

## Capabilities

### 1. Workflow Orchestration
- **Professional Proposal Pipeline**: Translates "Create a proposal for [Client]" into an autonomous sequence:
    1.  `google_web_search`: Research client business, brand colors, and current tech stack.
    2.  `stakeholder-communicator`: Draft a strategy focused on ROI, "Pain & Gain," and social proof.
    3.  `layout-architect`: Generate a brand-specific Marp CSS theme in `knowledge/templates/themes/`.
    4.  `diagram-renderer`: Create high-impact SVG diagrams (e.g., funnels, architectures).
    5.  `ppt-artisan`: Combine all assets into a final, visual-first PowerPoint.
- **Production Readiness Audit**: Coordinates `security-scanner` -> `ux-auditor` -> `license-auditor` -> `project-health-check`.
- **Autonomous Troubleshooting**: Links `log-analyst` -> `crisis-manager` -> `self-healing-orchestrator`.

### 2. Executive Reporting
- Summarizes the results of multiple skill executions into a single, high-level status report for stakeholders.

## Usage
- "Execute a full production-readiness audit and report the results."
- "Orchestrate a complete onboarding experience for a new developer."
- "I want to release a new version. Coordinate all necessary checks and documentation."
