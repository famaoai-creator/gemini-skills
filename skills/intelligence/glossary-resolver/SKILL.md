---
name: glossary-resolver
description: Resolve terms using glossary.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: 
  - name: glossary
    short: g
    type: string
    required: true
    description: 
  - name: out
    short: o
    type: string
    required: false
    description: 
category: Intelligence
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - codebase-mapper
  - completeness-scorer
  - doc-sync-sentinel
  - doc-type-classifier
  - intent-classifier
  - knowledge-harvester
  - quality-scorer
---

# glossary-resolver

Resolve terms using glossary.

## Usage

```bash
node dist/index.js [options]
```

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
