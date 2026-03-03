---
name: completeness-scorer
description: Evaluate text completeness based on criteria.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: 
  - name: criteria
    short: c
    type: string
    required: false
    description: JSON file with required keywords
category: Utilities
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - api-doc-generator
  - code-lang-detector
  - codebase-mapper
  - doc-sync-sentinel
  - doc-type-classifier
  - format-detector
  - glossary-resolver
  - intent-classifier
  - local-reviewer
  - quality-scorer
  - refactoring-engine
---

# Completeness Scorer

Evaluate text completeness based on criteria.

## Usage

node dist/index.js [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
