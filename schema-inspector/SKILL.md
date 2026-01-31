# Schema Inspector Skill

Automatically locates and displays the content of schema definition files (SQL, Prisma, OpenAPI, etc.) to help the AI understand data models and APIs.

## Usage

```bash
node schema-inspector/scripts/inspect.cjs <project_root>
```

## Supported Patterns
- `*.sql`
- `schema.prisma`
- `swagger.json` / `openapi.yaml`
- `models.py` / `Schema.js` / `entity/*.ts`
