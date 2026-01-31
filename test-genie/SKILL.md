# Test Genie Skill

Executes the project's test suite and returns the output. It attempts to auto-detect the test command (npm, pytest, etc.) but accepts a custom command.

## Usage

```bash
node test-genie/scripts/run.cjs <project_root> [custom_command]
```

## Examples
- Auto-detect: `node test-genie/scripts/run.cjs .`
- Custom: `node test-genie/scripts/run.cjs . "npm run test:unit"`
