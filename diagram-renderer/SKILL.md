---
name: diagram-renderer
description: Converts diagram code (Mermaid, PlantUML) into image files (PNG/SVG). Useful for visualizing text-based architecture diagrams, flowcharts, and sequence diagrams.
---

# Diagram Renderer

## Overview
This skill acts as a rendering engine for text-based diagrams. It takes code (like Mermaid or PlantUML) as input and outputs high-quality image files.

## Capabilities

1.  **Mermaid to Image**:
    - Converts `.mmd` files or text input to `.png` or `.svg`.
    - Uses `@mermaid-js/mermaid-cli` (Chromium-based).

2.  **PlantUML to Image** (Planned):
    - Future support for `.puml` files.

## Usage

```bash
# Render a Mermaid file to PNG
node scripts/render.cjs input.mmd output.png

# Render specific format (svg, pdf)
node scripts/render.cjs input.mmd output.svg
```

## Dependencies
- `@mermaid-js/mermaid-cli` (Requires Puppeteer/Chromium)
