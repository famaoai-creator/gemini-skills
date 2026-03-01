---
name: mcp-terraform-connector
description: >-
  Connects to the Terraform Registry via the Model Context Protocol (MCP).
status: implemented
arguments:
  - name: action
    short: a
    type: string
    required: false
    description: "MCP action: list_tools (default), call_tool, list_resources"
  - name: name
    short: n
    type: string
    required: false
    description: "MCP tool name (required for call_tool)"
  - name: arguments
    short: g
    type: string
    required: false
    description: "JSON string of arguments for the MCP tool"
  - name: out
    short: o
    type: string
    required: false
    description: "Output file path"
category: Connector
last_updated: '2026-03-01'
tags:
  - terraform
  - iac
  - mcp
---

# Terraform MCP Connector

This skill provides real-time access to the Terraform Registry (providers, modules, schemas) via the Model Context Protocol.

## Capabilities

- **`search_providers`**: Find Terraform providers in the registry.
- **`get_provider_schema`**: Retrieve the resource/data source schema for a specific provider.
- **`search_modules`**: Search for public Terraform modules.

## Usage

- "Get the Terraform schema for the AWS provider (v5.0)."
- "Search for a Terraform module that deploys an S3 bucket with encryption."

## Knowledge Protocol

- Default behavior queries the public Terraform Registry.
- Can be configured for private registries (e.g., TFC/TFE) by setting `TFC_TOKEN` in the environment.
