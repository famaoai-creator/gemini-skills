# Solution Mapping Rules

This document defines the rules for classifying GitHub repositories into business solutions based on name patterns and descriptions.

## Mapping Table

| Solution Category | Keywords / Patterns | Description |
| :--- | :--- | :--- |
| **Internet Banking (IB)** | `ib-`, `internet-banking`, `sbinbs_`, `bankingwhitelabel`, `sbibankingapi` | Customer-facing banking applications (Web/App). |
| **TrustIdiom (Auth)** | `trustid`, `trustidiom` | Identity verification and authentication services. |
| **eKYC / C-3 Solution** | `c-3_`, `ekyc` | Electronic Know Your Customer and C-3 platform components. |
| **IDP / Auth Infrastructure** | `idp-`, `authnz`, `keycloak`, `strongauth` | Identity providers and authentication infrastructure. |
| **Remit / Wallet / Crypto** | `remit-`, `wallet-`, `ripple-`, `token-` | Remittance, digital wallet, and blockchain-related services. |
| **Financial Cloud (FC)** | `fc-`, `sre-`, `aws-`, `terraform-`, `ansible-`, `infops-` | Infrastructure, PaaS, and SRE tools for the financial cloud. |
| **Core Banking** | `corebanking`, `shinsei_core` | Core banking systems and ledger management. |
| **Blockchain / DLT** | `canton-`, `agth-` | Canton and specialized blockchain infrastructure. |
| **Common / Library** | `common-`, `lib-`, `util-` | Shared components used across multiple solutions. |
| **PoC / Verification** | `mock-`, `sample-`, `test-`, `verif-` | Prototypes and verification environments. |

## Maintenance Status Criteria

- **Active**: Updated within the last 6 months.
- **Maintenance**: Updated between 6 months and 1 year ago.
- **Stale (Archive Recommended)**: Not updated for more than 1 year.