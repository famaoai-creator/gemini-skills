---
name: schema-validator
description: Validate JSON against schemas and identify best match.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: 
  - name: schema
    short: s
    type: string
    required: true
    description: 
category: Utilities
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - license-auditor
  - nonfunctional-architect
  - sensitivity-detector
---

# Schema Validator

Validate JSON against schemas and identify best match.

## Usage

node dist/index.js [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
