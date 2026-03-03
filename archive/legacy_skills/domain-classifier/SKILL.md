---
name: domain-classifier
description: Classify domain (tech, finance, legal).
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
  - doc-type-classifier
  - intent-classifier
  - sensitivity-detector
---

# domain-classifier

Classify domain (tech, finance, legal).

## Usage

```bash
node dist/index.js --input <file>
```

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
