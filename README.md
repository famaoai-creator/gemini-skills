# Gemini Skills Monorepo

A collection of 60+ specialized AI skills for the Gemini CLI, designed to automate the entire software development lifecycle (SDLC), business operations, and strategic management.

## Table of Contents
- [Quick Start](#quick-start)
- [Available Skills](#available-skills)
- [Usage Scenarios](./SCENARIOS.md)
- [Knowledge Base](#knowledge-base)
- [Contributing](#contributing)

## Quick Start
1. Clone this repository.
2. Install the skills manager: `gemini skill install ./github-skills-manager`
3. Install all skills: `for d in */; do gemini skill install "./$d" --scope user --consent; done`

## Available Skills

### 🧠 Strategic Orchestration (The Brain)
- **`mission-control`**: The ecosystem orchestrator. Coordinates 60+ skills for high-level goals like "Production Readiness".

### 🚀 Scaffolding & Infrastructure
- **`boilerplate-genie`**: Scaffolds new projects with CI/CD and testing best practices.
- **`environment-provisioner`**: Generates IaC (Terraform, Docker, K8s) from requirements.
- **`cloud-cost-estimator`**: Estimates monthly cloud costs from IaC files.
- **`disaster-recovery-planner`**: Generates DR runbooks and audits infrastructure resilience.
- **`terraform-arch-mapper`**: Visualizes IaC as Mermaid diagrams.

### 🤖 AI-Native Engineering
- **`prompt-optimizer`**: Self-improves agent instructions and context handling.
- **`token-economist`**: Smart summarization and chunking to minimize LLM costs.
- **`dataset-curator`**: Prepares and audits high-quality, PII-free datasets for AI/RAG.
- **`codebase-mapper`**: Maps directory structure for AI context.

### 📝 Requirements & Documentation
- **`requirements-wizard`**: (IPA-Standard) RD guide and review checklist.
- **`nonfunctional-architect`**: (IPA-Standard) Interactive NFR grade wizard.
- **`release-note-crafter`**: Generates business-value-focused release notes.
- **`doc-to-text`**: Universal extractor (PDF, Excel, Word, OCR, ZIP).
- **`ppt-artisan`**: Markdown to PowerPoint (Marp-based).

### 🛡️ Quality, Security & Legal
- **`security-scanner`**: Trivy-integrated vulnerability and secret scan.
- **`license-auditor`**: Scans dependencies for license compliance and generates NOTICE files.
- **`ux-auditor`**: Performs visual UX and accessibility audits on screenshots.
- **`project-health-check`**: Audits CI/CD, Tests, and Linting status.
- **`test-viewpoint-analyst`**: (IPA/TIS-Standard) Generates test scenarios.
- **`dependency-lifeline`**: Proactively monitors and plans library updates.

### 🤝 Team & Collaboration
- **`pr-architect`**: Crafts high-quality, descriptive Pull Request bodies.
- **`onboarding-wizard`**: Generates personalized project guides for new members.
- **`local-reviewer`**: Pre-commit AI code review.

### ⚙️ Operations & Feedback
- **`log-to-requirement-bridge`**: Drafts improvement requirements from runtime logs.
- **`performance-monitor-analyst`**: Correlates profiling results with NFR targets.
- **`log-analyst`**: Analyzes errors from log tails.
- **`db-extractor`**: Extracts schema/samples from live databases.

### 🌐 Browser & Web
- **`browser-navigator`**: Playwright-based browser automation.
- **`api-fetcher`**: Secure REST/GraphQL data fetching.
- **`data-collector`**: Traceable web data harvesting with metadata.

### 🛠️ Utilities
- **`github-skills-manager`**: Monorepo skill management dashboard.
- **`skill-quality-auditor`**: Self-audit for SKILL.md and script integrity.
- **`knowledge-refiner`**: Consolidates and cleans the knowledge base.
- **`diagram-renderer`**: Text-to-Image (Mermaid/PlantUML -> PNG).
- **`audio-transcriber`**: Whisper-based audio transcription.

## Usage Scenarios
For real-world examples (e.g., automated UI auditing, security pipelines), see **[SCENARIOS.md](./SCENARIOS.md)**.

## Knowledge Base
This monorepo includes a structured `knowledge/` directory shared across skills:
- `nonfunctional/`: IPA Non-Functional Grade 2018 definitions.
- `testing/`: TIS Test Viewpoint Catalog v1.6.
- `requirements-guide/`: IPA RD best practices.
- `browser-scenarios/`: Reusable Playwright scripts.

## License
Custom - See individual skill directories for specific usage terms (e.g., IPA, TIS).