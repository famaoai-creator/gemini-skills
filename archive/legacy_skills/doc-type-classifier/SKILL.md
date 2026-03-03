---
name: doc-type-classifier
description: Classify document type (meeting-notes, spec, etc).
status: implemented
category: Utilities
last_updated: '2026-02-28'
tags:
  - documentation
  - gemini-skill
related_skills:
  - completeness-scorer
  - doc-sync-sentinel
  - domain-classifier
  - glossary-resolver
  - intent-classifier
  - quality-scorer
  - sensitivity-detector
---

# doc-type-classifier

Classify document type (meeting-notes, spec, etc).

## Usage

```bash
node dist/index.js --input <file>
```

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
