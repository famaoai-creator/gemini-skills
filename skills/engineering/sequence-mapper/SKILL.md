---
name: sequence-mapper
description: Generate Mermaid sequence diagrams from source code function calls.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: 
  - name: out
    short: o
    type: string
    required: false
    description: 
category: Engineering
last_updated: '2026-02-28'
tags:
  - automation
  - gemini-skill
---

# Sequence Mapper

Generate Mermaid sequence diagrams from source code function calls.

## Usage

node dist/index.js [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
