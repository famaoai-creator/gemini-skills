---
name: data-transformer
description: Convert between CSV, JSON, and YAML formats.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: undefined
  - name: to
    short: F
    type: string
    required: true
    description: undefined
  - name: out
    short: o
    type: string
    required: false
    description: undefined
category: Intelligence
last_updated: '2026-02-16'
tags:
  - data-engineering
  - gemini-skill
---

# Data Transformer

Convert between CSV, JSON, and YAML formats.

## Usage

node data-transformer/scripts/transform.cjs [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
