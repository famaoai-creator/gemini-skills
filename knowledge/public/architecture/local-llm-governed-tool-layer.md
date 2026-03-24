# Local LLM Governed Tool Layer v0

## Thesis

Local LLM integration must not be implemented as provider-specific filesystem access.

The correct abstraction is:

- provider: generates reasoning and tool intent
- tool contract: describes governed read operations
- tool executor: performs reads through Kyberion control layers
- policy layer: constrains scope, authority, and payload size

This keeps `ollama`, `vllm-openai`, `local-openai`, and future local providers on the same conceptual path.

## Core Principle

Local models do not receive raw filesystem access.

Instead, they receive access to a small governed tool surface implemented by Kyberion.

The model may ask for:

- mission state
- task board
- next tasks
- runtime topology
- approval queue
- governed artifact content

Kyberion decides:

- whether the read is allowed
- how much data can be returned
- whether redaction is required
- whether a summarized view is safer than a raw file read

## Architecture

### 1. Provider Layer

Examples:

- `ollama`
- `local-openai`
- `vllm-openai`

Responsibility:

- chat/completion
- structured tool intent
- result synthesis

Non-responsibility:

- direct filesystem reads
- authority checks
- raw secure-io access

### 2. Tool Contract Layer

Canonical read-only tools:

- `load_mission_overview(mission_id)`
- `load_task_board(mission_id)`
- `load_next_tasks(mission_id)`
- `load_runtime_topology()`
- `load_pending_approvals(kind?)`
- `read_governed_artifact(path)`
- `list_governed_dir(path)`

Rules:

- all tools are read-only in v0
- all tool outputs are bounded
- all tool outputs are human-legible

### 3. Tool Executor Layer

Implemented in Kyberion core, not in the provider.

Execution sources:

- `safeReadFile`
- `safeReaddir`
- `readGovernedArtifactJson`
- Chronos intelligence helpers
- approval-store helpers
- runtime supervisor helpers

The executor converts tool calls into governed reads and returns structured results.

### 4. Policy Layer

Each tool call is checked against:

- authority role
- allowed logical path families
- maximum payload size
- redaction policy
- surface/runtime ownership context

Recommended v0 policy:

- local providers get read-only tools only
- no direct write tools
- no unrestricted path tool
- no repo-root recursive listing

## Why This Is Better Than Provider-Specific FS Access

This approach:

- works for any local provider
- keeps governance centralized
- avoids provider lock-in
- preserves explainability
- lets Chronos, Slack, terminal, and presence use the same read contracts

## Chronos Implication

Chronos should prefer structured intelligence payloads over raw file reads.

Priority order:

1. use `load_runtime_topology()`
2. use `load_pending_approvals()`
3. use `load_mission_overview(mission_id)`
4. only then fall back to `read_governed_artifact(path)`

This keeps Chronos deterministic and avoids oversized context windows.

## Suggested v0 Output Shapes

### `load_mission_overview`

```json
{
  "mission_id": "MSN-EXAMPLE-001",
  "status": "active",
  "tier": "public",
  "control_summary": "execution ready",
  "task_board": {
    "status": "In Progress",
    "steps_total": 6,
    "steps_done": 2,
    "steps_active": 1,
    "steps_pending": 3
  },
  "next_tasks": {
    "total": 4,
    "pending": 3,
    "completed": 1
  }
}
```

### `load_pending_approvals`

```json
{
  "count": 1,
  "requests": [
    {
      "request_id": "secreq_001",
      "kind": "secret_mutation",
      "service_id": "slack",
      "secret_key": "SLACK_BOT_TOKEN",
      "risk_level": "high",
      "pending_roles": ["sovereign"]
    }
  ]
}
```

## Execution Flow

1. local model receives user/system prompt
2. model emits tool intent
3. Kyberion validates the tool request
4. Kyberion executes the tool via governed read APIs
5. result is returned to the model
6. model produces a final response

This is provider-independent and can later support:

- structured tool calls
- MCP-backed tools
- ADF-based tool envelopes

## Recommended v1 Implementation Order

1. add read-only tool catalog for local providers
2. implement executor wrappers around Chronos/intelligence and artifact-store helpers
3. expose tool permissions through agent manifest
4. wire local providers to structured tool intent
5. add observability for tool call count, failures, and payload size

## Naming

Prefer:

- `governed tool layer`
- `local provider read tools`
- `provider-independent read contracts`

Avoid:

- `ollama filesystem mode`
- `provider raw file access`

Because the concept belongs to Kyberion, not to a single model backend.
