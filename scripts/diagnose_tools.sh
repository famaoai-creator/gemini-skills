#!/bin/bash

# Gemini Skills: Environment Diagnostic Tool
# Checks for external binary dependencies required by various skills.

echo "🔍 Diagnosing External Tool Dependencies..."

TOOLS=("node" "npm" "npx" "git" "gh" "swift" "python3" "pip3" "trivy" "mmdc" "java")

for tool in "${TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✅ [FOUND] $tool ($( $tool --version | head -n 1 ))"
    else
        echo "❌ [MISSING] $tool"
    fi
done

echo ""
echo "💡 Note: Missing tools will limit specific skills (e.g., missing 'trivy' affects security-scanner)."
