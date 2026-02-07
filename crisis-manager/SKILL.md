---
name: crisis-manager
description: Provides rapid response during production incidents or critical security breaches. Coordinates diagnostics, temporary fixes, and post-mortem data collection.
---

# Crisis Manager

This skill is for high-stakes, time-sensitive situations where rapid recovery is paramount.

## Capabilities

### 1. Incident Diagnostic
- Rapidly correlates logs, security alerts, and recent commits to find the "smoking gun."
- Suggests immediate workarounds or rollbacks.

### 2. Post-Mortem Preparation
- Captures the state of the system during the incident for later analysis.
- Drafts the initial incident report (What happened, Timeline, Immediate Action).

## Usage
- "We have a production outage! Run `crisis-manager` to analyze logs and recent changes immediately."
- "A critical zero-day was found. Coordinate with `security-scanner` to find all affected instances."

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
