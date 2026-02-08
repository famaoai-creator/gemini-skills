---
name: context-injector
description: Inject knowledge into JSON data context.
status: implemented
---
# context-injector
Inject knowledge into JSON data context.
## Usage
```bash
node context-injector/scripts/inject.cjs [options]
```

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
