--- 
name: domain-classifier
description: Classify domain (tech, finance, legal).
--- 
# domain-classifier
Classify domain (tech, finance, legal).
## Usage
```bash
node domain-classifier/scripts/classify.cjs --input <file>
```

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
