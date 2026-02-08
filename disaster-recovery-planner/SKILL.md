---
name: disaster-recovery-planner
description: Generates actionable Disaster Recovery (DR) runbooks from infrastructure and requirements. Validates IaC for resilience (backups, redundancy).
status: implemented
---

# Disaster Recovery Planner

This skill translates "Availability" requirements into actual recovery procedures (Runbooks).

## Capabilities

### 1. Runbook Generation
- Creates step-by-step guides for recovering from server failures or data loss.
- Tailored to your specific Cloud provider and architecture.

### 2. Resilience Audit
- Scans Terraform/CloudFormation to ensure automated backups and multi-region/multi-AZ settings are active.

## Usage
- "Generate a DR runbook for our production database on AWS."
- "Audit our IaC to see if we can actually meet our 4-hour RTO (Recovery Time Objective)."

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
