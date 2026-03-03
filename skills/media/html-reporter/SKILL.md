---
name: html-reporter
description: Generate standalone HTML reports from JSON/Markdown.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: Path to input Markdown file
  - name: out
    short: o
    type: string
    required: true
    description: Output HTML file path
  - name: title
    short: t
    type: string
    required: false
    description: Report title
category: Media
last_updated: '2026-02-28'
tags:
  - automation
  - gemini-skill
related_skills:
  - ai-ethics-auditor
  - bug-predictor
  - cloud-cost-estimator
  - cloud-waste-hunter
  - code-lang-detector
  - codebase-mapper
  - compliance-officer
  - crisis-manager
  - dependency-grapher
  - dependency-lifeline
  - license-auditor
  - post-quantum-shield
  - project-health-check
  - quality-scorer
  - refactoring-engine
  - security-scanner
  - sensitivity-detector
  - supply-chain-sentinel
  - sustainability-consultant
---

# Html Reporter

Generate standalone HTML reports from JSON/Markdown.

## Usage

node dist/index.js [options]

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
