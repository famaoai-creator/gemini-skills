---
name: quality-scorer
description: Evaluates technical and textual quality based on IPA benchmarks and readability standards.
status: unstable
arguments:
  - name: content
    short: c
    type: string
    required: false
    description: Content to score
  - name: file
    short: f
    type: string
    required: false
    description: File to score
  - name: out
    short: o
    type: string
    required: false
    description: Output JSON path
category: Audit
last_updated: '2026-03-02'
tags:
  - gemini-skill
related_skills:
  - bug-predictor
  - code-lang-detector
  - codebase-mapper
  - completeness-scorer
  - doc-sync-sentinel
  - doc-type-classifier
  - format-detector
  - glossary-resolver
  - html-reporter
  - intent-classifier
  - license-auditor
  - local-reviewer
  - project-health-check
  - refactoring-engine
  - security-scanner
---

# Quality Scorer

This skill provides a multi-dimensional quality assessment of software projects and documentation.

## Capabilities

### 1. Technical Metrics Audit

- **Waterfall Benchmarks**: Evaluates bug and test densities against the IPA standards defined in `knowledge/quality-management/metrics_standards.md`.
- **Integrity Check**: Flags potential quality risks (e.g., high test density but zero bugs found, suggesting weak test items).

### 2. Textual Analysis

- **Readability & Style**: Scores text based on complexity, length, and adherence to professional standards.

## Usage

```bash
node dist/index.js --input <file_or_dir>
```

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
