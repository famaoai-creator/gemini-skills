---
name: supply-chain-sentinel
description: ''
status: implemented
arguments:
  - name: input
    short: i
    type: string
    required: false
    description: Project directory to audit for supply chain
  - name: sbom
    type: boolean
    required: false
    description: Generate CycloneDX SBOM
  - name: scan
    type: boolean
    required: false
    description: Query vulnerability database (OSV) for dependencies
  - name: internal-prefixes
    type: string
    required: false
    description: Comma-separated internal package name prefixes (for dependency confusion check)
  - name: out
    short: o
    type: string
    required: false
    description: Output path for report
category: Audit
last_updated: '2026-02-28'
tags:
  - gemini-skill
related_skills:
  - ai-ethics-auditor
  - compliance-officer
  - crisis-manager
  - html-reporter
  - post-quantum-shield
  - sustainability-consultant
---

# Supply Chain Sentinel

This skill ensures the integrity of everything your software depends on.

## Capabilities

### 1. SBoM Generation

- Generates a **Software Bill of Materials (SBoM)** in CycloneDX or SPDX formats.
- Lists all direct and transitive dependencies with their hashes and origin.

### 2. Provenance & Risk Audit

- Analyzes dependency maintenance health (e.g., commit frequency, open issues).
- Flags potential "typosquatting" or known malicious package patterns.

## Usage

- "Generate an SBoM for our production release."
- "Audit our supply chain for packages with poor maintenance or suspicious origins."

## Knowledge Protocol

- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
\n## Governance Alignment\n\n- This skill aligns with **IPA** non-functional standards and **FISC** security guidelines to ensure enterprise-grade compliance.
