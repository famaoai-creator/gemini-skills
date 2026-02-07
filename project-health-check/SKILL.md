---
name: project-health-check
description: Audits the project for modern development standards (CI/CD, Tests, Linting, IaC, Docs) and provides a health score with improvement suggestions. Use when you need to assess the quality, readiness, or modernization level of a repository.
---

# Project Health Check

## Overview
This skill analyzes the current project's structure and configuration files to evaluate its adherence to modern engineering practices. It generates a "health report" covering:

1.  **DevOps & CI/CD**: Existence of automated pipelines.
2.  **Testing**: Presence of testing frameworks and configuration.
3.  **Code Quality**: Linter and formatter setups.
4.  **Infrastructure**: Containerization and IaC usage.
5.  **Documentation**: Essential project documentation.

## Usage

Run the audit script from the root of the project you want to check.

```bash
node scripts/audit.cjs
```

## Interpretation
The script outputs a score (0-100) and a list of checks.
- **PASS**: The criterion is met.
- **WARN**: Partial compliance or suggestions for improvement.
- **FAIL**: Critical modern standard missing.

Use the output to guide refactoring or infrastructure setup tasks.

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
