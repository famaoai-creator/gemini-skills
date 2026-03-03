---
name: code-lang-detector
description: Detect programming language of source code.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: false
    description: 
category: Engineering
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - bug-predictor
  - completeness-scorer
  - html-reporter
  - license-auditor
  - local-reviewer
  - project-health-check
  - quality-scorer
  - refactoring-engine
  - security-scanner
---

# code-lang-detector

Detect programming language of source code.

## Usage

```bash
node dist/index.js --input <file>
```

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
