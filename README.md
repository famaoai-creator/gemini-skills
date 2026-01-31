# Gemini Skills Monorepo

This repository contains a collection of specialized skills for the **Gemini CLI**. These skills extend the agent's capabilities to automate software engineering tasks and document analysis.

## 🛠 Skills in this Repository

### 1. [GitHub Skills Manager](./github-skills-manager/)
An interactive TUI dashboard to manage the lifecycle of Gemini skills.
- **Features:** Create, install, sync, and delete skills from local or remote repositories.
- **How to use:**
  ```bash
  node github-skills-manager/scripts/dashboard.cjs
  ```

### 2. [Doc-to-Text](./doc-to-text/)
A powerful text extraction engine that supports various file formats, including OCR for embedded images.
- **Capabilities:**
  - **Office Documents:** Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`) - *Includes OCR for embedded images.*
  - **PDF:** Plain text extraction.
  - **Images:** OCR for `.png`, `.jpg`, `.webp`, etc. (Supports English & Japanese).
  - **Archives:** Text extraction from `.zip` files.
  - **Emails:** Parsing `.eml` files.
- **How to use:**
  ```bash
  node doc-to-text/scripts/extract.cjs <path_to_file>
  ```

## 🚀 Installation

To install these skills into your Gemini CLI workspace:

1. Clone this repository:
   ```bash
   git clone https://github.com/famaoai-creator/gemini-skills.git
   cd gemini-skills
   ```

2. Install dependencies for the skills:
   ```bash
   cd doc-to-text && npm install && cd ..
   ```

3. Install the skills into Gemini CLI:
   ```bash
   gemini skills install doc-to-text --scope workspace
   gemini skills install github-skills-manager --scope workspace
   ```

## 📂 Project Structure

```text
.
├── doc-to-text/            # Document extraction and OCR skill
├── github-skills-manager/  # TUI for skill management
└── README.md               # You are here
```

## 📝 Development

- **Language:** Node.js (v25.5.0+)
- **License:** MIT
