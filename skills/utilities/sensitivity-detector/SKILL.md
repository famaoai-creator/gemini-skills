---
name: sensitivity-detector
description: Detect PII and sensitive information in text.
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
  - codebase-mapper
  - doc-type-classifier
  - domain-classifier
  - html-reporter
  - intent-classifier
  - license-auditor
  - nonfunctional-architect
  - schema-validator
  - security-scanner
---

# Sensitivity Detector

Detect PII and sensitive information in text.

## Usage

node dist/index.js [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
