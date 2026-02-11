---
name: ppt-artisan
description: Create and convert PowerPoint presentations from Markdown using Marp. Use when the user wants to generate slides, manage themes, or convert MD to PPTX/PDF.
status: implemented
---

# PowerPoint Artisan (ppt-artisan)

This skill creates high-impact, boardroom-ready presentations. It goes beyond simple Markdown conversion by integrating with custom brand themes and high-resolution visual assets.

## Capabilities

### 1. Visual-First Presentation Generation
- **Theme Awareness**: Automatically checks `knowledge/templates/themes/` for client-specific CSS before falling back to default themes.
- **High-Impact Layouts**: Leverages the `theme_design_guide.md` to structure information using cards, multi-column grids, and "Lead" slides.
- **Asset Integration**: Mandates the use of absolute paths for images and prefers SVG diagrams (from `diagram-renderer`) for scalability.

### 2. Multi-Format Conversion
- **PPTX**: Default format for editable presentations.
- **PDF/HTML**: Formats for quick preview and digital distribution.

## High-Fidelity Authoring Workflow (Anti-Summarization)

To ensure technical depth and prevent information loss, follow this "Deep Dive" standard:

1.  **Storyboard Strategy**: Define a target slide count for each chapter (e.g., "Architecture: 10 slides"). Do not aim for a single overview slide.
2.  **Granular Expansion**:
    - Break each sub-topic into its own slide (e.g., Security -> VPC, Security -> IAM, Security -> KMS).
    - If a sub-topic is complex, use multiple sequential slides (Part 1, Part 2).
3.  **Mandatory Evidence**: Every technical claim must include:
    - **Configuration Tables**: Specific parameters and values.
    - **Implementation Snippets**: Code blocks with CLI commands or YAML manifests.
    - **Verification Assertions**: How to verify the state (Assert).
4.  **Synthesis**: Combine detailed sections with explicit page breaks (`---`).

## Best Practices
- **Topic-Per-Slide (Deep Dive)**: Instead of brief bullets, provide detailed technical specs. A professional system design should naturally exceed 40 slides.
- **Visual Evidence**: Use two-column layouts to place conceptual diagrams next to technical tables.
- **High Fidelity**: Always use `--allow-local-files` to ensure assets render.
## Knowledge Protocol
- This skill adheres to the `knowledge/orchestration/knowledge-protocol.md`. It automatically integrates Public, Confidential (Company/Client), and Personal knowledge tiers, prioritizing the most specific secrets while ensuring no leaks to public outputs.
