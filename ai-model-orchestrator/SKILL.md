---
name: ai-model-orchestrator
description: Dynamically selects the optimal AI model based on task complexity, cost, and latency. Routes requests to Gemini, GPT-4, Claude, or local LLMs to maximize efficiency.
---

# AI Model Orchestrator

This skill ensures that the most appropriate and cost-effective intelligence is used for every task.

## Capabilities

### 1. Task Triage
- Analyzes the "Hardness" of a prompt or code task.
- Routes simple tasks (e.g., translation, basic cleanup) to faster/cheaper models.
- Routes complex tasks (e.g., architectural design, deep debugging) to state-of-the-art models.

### 2. Multi-Provider Fallback
- Automatically switches providers if an API is down or throttled.
- Compares outputs from multiple models for critical tasks (consensus building).

## Usage
- "Execute the code review using the most cost-effective model that maintains high precision."
- "Orchestrate a multi-model evaluation of our new security architecture."
