---
name: license-auditor
description: Scans project dependencies for license compliance risks. Identifies restrictive licenses (GPL, AGPL) and generates mandatory attribution (NOTICE) files.
---

# License Auditor

This skill ensures your project is legally sound by auditing the licenses of all third-party libraries.

## Capabilities

### 1. Compliance Scan
- Lists all licenses found in `package.json`, `requirements.txt`, etc.
- Flags restrictive (copyleft) licenses that might conflict with commercial use.

### 2. Attribution Management
- Automatically generates a `NOTICE` or `THIRD-PARTY-LICENSES` file containing all required legal notices and copyrights.

## Usage
- "Audit the licenses in this project and generate a compliance report."
- "Create a NOTICE file for the upcoming release."
