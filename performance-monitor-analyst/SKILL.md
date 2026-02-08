---
name: performance-monitor-analyst
description: Correlates performance targets with actual profiling results. Identifies bottlenecks and validates against non-functional requirements.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: Path to a JSON file containing performance metrics
  - name: out
    short: o
    type: string
    description: Output file path
---

# Performance Monitor Analyst

This skill compares "what we want" (NFR) with "what we have" (Profiling Logs).

## Capabilities

### 1. Profiling Log Analysis
- Reads outputs from `Clinic.js`, `cProfile`, or `chrome://tracing`.
- Identifies heavy functions and memory leaks.

### 2. Gap Analysis
- Compares measured response times against the targets in `knowledge/nonfunctional/`.
- Issues "Warning" if targets are missed.

## Usage
- "Analyze this `profile.json` and tell me if we are meeting our 200ms response time requirement."
- "Where is the bottleneck in this Python profile?"

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
