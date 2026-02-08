---
name: html-reporter
description: Generate standalone HTML reports from JSON/Markdown.
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: true
    description: Input markdown file path
  - name: title
    short: t
    type: string
    default: Report
    description: Report title
  - name: out
    short: o
    type: string
    required: true
    description: Output HTML file path
---

# Html Reporter

Generate standalone HTML reports from JSON/Markdown.

## Usage

node html-reporter/scripts/report.cjs [options]

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
