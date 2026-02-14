# IT Cost Benchmarks & ROI Logic

## 1. Cost Assumptions
- **Engineer Hourly Rate**: $100 (Global Enterprise Standard)
- **Manual Overhead**: 20% (Context switching, setup time)

## 2. Manual Effort Estimation (Baseline)
AI スキルが実行するタスクを人間が手動で行った場合の想定時間。

| Skill Category | Manual Effort (per op) | Logic |
| :--- | :--- | :--- |
| **Audit/Scan** | 15 mins (900,000ms) | Checking 100+ files for patterns manually. |
| **Generation** | 30 mins (1,800,000ms) | Writing boilerplate, docs, or diagrams. |
| **Conversion** | 10 mins (600,000ms) | Converting formats (PDF to Text, etc). |
| **Analysis** | 60 mins (3,600,000ms) | Deep dive into logs or performance data. |
| **Default** | 5 mins (300,000ms) | Simple utility tasks. |

## 3. ROI Formula
```
Time Saved = (Manual Effort * Count) - (AI Execution Time)
Money Saved = (Time Saved / 3600000) * $100
ROI = (Money Saved / AI Cost) * 100%
```
※ AI Cost is negligible in local execution (electricity/CPU), assuming ~0 for this dashboard.
