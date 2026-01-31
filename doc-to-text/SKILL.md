---
name: doc-to-text
description: Extract text content from binary document formats (PDF, Excel, Word). Use this when the user asks to read, summarize, or analyze files with extensions .pdf, .xlsx, .xls, .csv, .docx.
---

# Document to Text Converter

## Overview
This skill allows Gemini CLI to read the contents of binary document formats that are not natively supported as text files. It extracts raw text or structured data (CSV for spreadsheets) so that it can be processed, summarized, or analyzed.

## Capabilities

### 1. Extract Text
Reads a file and outputs its text content to stdout.

**Supported Formats:**
- **PDF** (`.pdf`): Extracts plain text.
- **Excel** (`.xlsx`, `.xls`, `.csv`): Converts each sheet to CSV format.
- **Word** (`.docx`): Extracts raw text content.

## Usage

To read a file, execute the `extract.cjs` script with the file path.

```bash
node scripts/extract.cjs <path/to/file>
```

**Example:**
User: "Summarize the report in report.pdf"
Action:
1. Run `node scripts/extract.cjs report.pdf`
2. Read the output.
3. Summarize the text content for the user.

## Dependencies
This skill requires Node.js packages.
Run `npm install` in the skill directory before using.