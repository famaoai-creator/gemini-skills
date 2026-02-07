--- 
name: quality-scorer
description: Score text quality (readability, length).
--- 
# quality-scorer
Score text quality (readability, length).
## Usage
```bash
node quality-scorer/scripts/score.cjs --input <file>
```

## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
