---
name: browser-navigator
description: Automates browser actions using Playwright CLI. Can record, replay, and generate browser automation scenarios stored in the knowledge base. Useful for UI testing, data extraction, and visual auditing.
---

# Browser Navigator (Playwright-based)

This skill automates web browser interactions using the Playwright CLI. It focuses on executing scenarios stored in `knowledge/browser-scenarios/` and generating new ones as needed.

## Capabilities

### 1. Scenario Execution
Run existing Playwright test scripts to perform complex multi-step actions.
- **Command**: `npx playwright test <path_to_spec>`
- **Results**: Check output logs and screenshots saved in `work/screenshots/`.

### 2. Scenario Generation
Create new automation scripts (`.spec.js`) based on user requirements.
- **Workflow**: 
    1.  Define the goal (e.g., "Log in and export the table").
    2.  Draft the Playwright script using `@playwright/test` syntax.
    3.  Save the script to `knowledge/browser-scenarios/` for future use.
    4.  Verify by running it.

### 3. Visual & Content Auditing
- Capture full-page screenshots for UI review.
- Extract text content or specific DOM elements for analysis.

## Knowledge Base
- **Scenarios**: `knowledge/browser-scenarios/`
  - Always check this directory first for reusable scripts before creating new ones.
  - New scripts should be named descriptively (e.g., `github-login.spec.js`).

## Usage Examples

- "Run the example scenario and show me the screenshot."
- "Create a new scenario to visit 'https://news.ycombinator.com', capture the top 10 titles, and save it as `hacker-news.spec.js`."
- "Debug the UI of my local dev server at localhost:3000."

## Safety & Best Practices
- **Privacy**: Never hardcode credentials. Use environment variables if necessary.
- **Paths**: Always save screenshots to `work/screenshots/`.
- **Cleanup**: Close browser contexts properly (Playwright handles this in `test` blocks).
- **Environment**: If Playwright is not installed, prompt the user to run `npm install -D @playwright/test`.
