---
name: security-scanner
description: Scans the codebase for security risks, including hardcoded secrets (API keys, tokens), dangerous code patterns (eval, shell injection), and insecure configurations. Use to audit code before committing or reviewing.
---

# Security Scanner

## Overview
This skill performs a lightweight Static Application Security Testing (SAST) and Secret Scanning audit on the current project. It does not require external heavy tools (like SonarQube or Trivy) but relies on efficient pattern matching to catch common mistakes.

## Capabilities

1.  **Secret Detection**: Identifies potential leaked credentials.
    - AWS Access Keys
    - GitHub Personal Access Tokens
    - Google API Keys
    - Slack Webhooks
    - Private Keys (RSA, PEM)
    - Generic "password = ..." patterns

2.  **Dangerous Code Patterns**: Flags potentially unsafe coding practices.
    - `eval()`, `setTimeout(string)` (Arbitrary Code Execution)
    - `dangerouslySetInnerHTML` (XSS)
    - `child_process.exec` with variables (Command Injection)
    - Hardcoded IPs or internal URLs.

## Usage

Run the scanner from the root of your project.

```bash
node scripts/scan.cjs
```

## Configuration
The script automatically ignores files listed in `.gitignore` (if available) and common binary/vendor directories (`node_modules`, `.git`, `dist`, `build`, etc.) to keep the scan fast and relevant.
