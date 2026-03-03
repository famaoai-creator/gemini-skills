---
name: codebase-mapper
description: Maps the directory structure of the project to help the AI understand the codebase layout.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: false
    description: Root directory to map
  - name: out
    short: o
    type: string
    required: false
    description: Output path for JSON map
  - name: depth
    short: d
    type: number
    required: false
    description: Max tree depth
category: Engineering
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - api-doc-generator
  - bug-predictor
  - completeness-scorer
  - dependency-grapher
  - doc-sync-sentinel
  - glossary-resolver
  - html-reporter
  - knowledge-harvester
  - license-auditor
  - quality-scorer
  - refactoring-engine
  - security-scanner
  - sensitivity-detector
---

# Codebase Mapper Skill

Maps the directory structure of the project to help the AI understand the codebase layout.

## Usage

```bash
node dist/index.js <directory_path> [max_depth]
```

- `<directory_path>`: Root directory to map (default: `.`)
- `[max_depth]`: How deep to traverse (default: `3`)

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
