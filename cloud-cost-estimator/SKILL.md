---
name: cloud-cost-estimator
description: Estimates monthly cloud infrastructure costs from IaC files (Terraform, CloudFormation). Helps align architecture with budget constraints.
---

# Cloud Cost Estimator

This skill adds financial awareness to infrastructure design by estimating costs for AWS, Azure, and GCP resources.

## Capabilities

### 1. Cost Projection
- Parses `.tf` files to identify resource types and counts.
- Provides estimated monthly costs based on standard pricing models.

### 2. Efficiency Recommendations
- Suggests cost-saving alternatives (e.g., "Use Spot instances for this worker group").
- Identifies "expensive" architectural choices.

## Usage
- "How much will this Terraform configuration cost per month on AWS?"
- "Compare the estimated cost of this multi-region setup vs a single-region setup."
