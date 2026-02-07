---
name: monitoring-config-auditor
description: Audits infrastructure code (Terraform, K8s) for monitoring compliance. Ensures alarms, thresholds, and notification paths are set up correctly according to best practices.
---

# Monitoring Config Auditor

This skill provides a proactive audit of your "Observability" setup before it goes to production.

## Capabilities

### 1. Alarm Integrity Check
- Scans for missing basic alarms (CPU, Error Rate, Disk Space).
- Verifies that thresholds match the project's Non-Functional Requirements.

### 2. Notification Audit
- Ensures that every alarm has a defined and valid notification destination (SNS, Slack, PagerDuty).

## Usage
- "Audit our current Terraform files for monitoring compliance."
- "Are we missing any critical alerts for this new microservice deployment?"

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`.
