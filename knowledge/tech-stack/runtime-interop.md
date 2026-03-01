# The Gemini Runtime Interop Standard: CJS, ESM, and TypeScript

This document clarifies the architectural relationship between CommonJS (CJS) and TypeScript (TS) within the Gemini Skills Monorepo.

## 1. The Strategy: "Core Duality"

Gemini employs a **Dual-Layer Architecture** to balance runtime reliability with developer productivity.

| Layer | Technology | Philosophy | Role |
| :--- | :--- | :--- | :--- |
| **Runtime Layer** | CommonJS (`.cjs`) | "Physical Shield" | Core orchestration, security, and scripts. Always ready, zero-build. |
| **Development Layer** | TypeScript (`.ts`) | "Intellectual Layer" | Skill logic, type definitions, and schema enforcement. |

## 2. The "Physical Shield" (Why CJS?)

The decision to use `.cjs` for all core scripts and libraries is intentional:

1.  **Immediate Availability**: Core scripts (`scripts/cli.cjs`, `scripts/bootstrap.cjs`) must run on any Node.js environment without a compilation step (no `tsc` or `ts-node` required).
2.  **Resilience**: If a TypeScript compilation fails due to a minor type error in a remote skill, the **Core Ecosystem** (Auto-healing, SRE monitoring, Governance) must remain operational to fix it.
3.  **Bootstrapping**: `scripts/bootstrap.cjs` creates the `@agent/core` link before any other module is loaded, ensuring a stable foundation regardless of package manager state.

## 3. The "Intellectual Layer" (Why TS?)

TypeScript is used extensively for **Skills** and **Complex Logic**:

1.  **Type Safety**: Prevents common runtime errors in complex data-processing skills.
2.  **Schema Alignment**: Uses `.d.ts` and `types.ts` to ensure that skill outputs strictly match the `schemas/` defined in the project.
3.  **Developer Experience**: Provides IntelliSense and auto-completion for developers using `@agent/core` utilities.

## 4. Interoperability Mechanics

### A. The `@agent/core` Bridge
TS skills and CJS scripts both consume core utilities through the `@agent/core` namespace.

- **CJS Consumer**: `const { runSkill } = require('@agent/core');`
    - Resolves to: `libs/core/skill-wrapper.cjs` (via `package.json#exports`)
- **TS Consumer**: `import { runSkill } from '@agent/core';`
    - Resolves to: `libs/core/skill-wrapper.d.cts` (for types) and `libs/core/skill-wrapper.cjs` (at runtime).

### B. File Extension Policy

- **`.cjs`**: Mandatory for anything in `scripts/` or `libs/core/` that is part of the "Physical Shield."
- **`.ts`**: Recommended for all new **Skills** under `skills/`.
- **`.d.ts` / `.d.cts`**: Used to provide the type interface for the CJS runtime.

## 5. Summary: The Golden Rule

> **"The runtime must never depend on the compiler, but the developer must always benefit from the types."**

If a core utility is modified, the `.cjs` implementation is the **Source of Truth**. The corresponding `.d.ts` or `.ts` files must be updated to reflect the new interface.
