---
name: format-detector
description: Detect text format (JSON, YAML, CSV, etc.) and confidence.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: 
category: Utilities
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - completeness-scorer
  - quality-scorer
---

# Format Detector

Detect text format (JSON, YAML, CSV, etc.) and confidence.

## Usage

node dist/index.js [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
