# AWS Unified Operations (Cloud Operations)

AWS Unified Operations combines specialized services to provide a single control plane for managing hybrid, multi-cloud, and on-premises environments.

## 1. Core Components
- **AWS Systems Manager (SSM)**: The central hub for automation.
    - **Patch Manager**: Automates patching across EC2 and on-prem servers.
    - **OpsCenter**: Aggregates operational issues (OpsItems) from CloudWatch and other sources for centralized remediation.
    - **Automation**: Executes runbooks (SSM Documents) to fix issues without human intervention.
- **Amazon CloudWatch**: The eyes and ears.
    - Monitors metrics and logs from all environments.
    - Triggers Alarms that feed into EventBridge or OpsCenter.
- **Amazon EventBridge**: The nervous system.
    - Routes events (e.g., "Instance Stopped", "Security Alert") to automated targets like Lambda or SSM Automation.

## 2. Operational Flow
1. **Detect**: CloudWatch detects an anomaly (e.g., High CPU).
2. **Route**: EventBridge captures the alarm state change.
3. **Remediate**: SSM Automation triggers a specific runbook (e.g., Restart Service) or creates an OpsItem for human review.

## 3. Hybrid & Multi-Cloud Strategy
- **SSM Hybrid Activations**: Allows non-AWS servers to be managed exactly like EC2 instances.
- **Unified Agent**: Using the CloudWatch and SSM agents on all nodes ensures consistent visibility and control regardless of location.
