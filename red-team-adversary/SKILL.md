---
name: red-team-adversary
description: Performs active security "war gaming" by attempting to exploit identified vulnerabilities in a sandbox. Validates threat reality beyond static scans.
---

# Red-Team Adversary

This skill takes a proactive, offensive stance on security to ensure defenses are truly effective.

## Capabilities

### 1. Controlled Exploitation
- Attempts to exploit vulnerabilities found by `security-scanner` within a local sandbox or staging environment.
- Provides "Proof of Concept" (PoC) for critical bugs to demonstrate real impact.

### 2. Resilience Testing
- Simulates common attack vectors (DDoS, SQLi, Credential Stuffing) to test the robustness of the `crisis-manager` and `disaster-recovery-planner`.

## Usage
- "Perform a red-team audit on the authentication module and try to bypass it."
- "Verify if the SQLi vulnerability found yesterday is actually exploitable in our current setup."
