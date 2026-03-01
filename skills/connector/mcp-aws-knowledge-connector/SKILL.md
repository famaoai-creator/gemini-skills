---
name: mcp-aws-knowledge-connector
description: >-
  Connects to AWS Knowledge Base (Bedrock RAG) using the Model Context Protocol (MCP).
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
  - aws
  - bedrock
  - mcp
  - rag
---

# AWS Knowledge MCP Connector

This skill provides access to AWS Knowledge Bases (Amazon Bedrock RAG) via the Model Context Protocol.

## Capabilities

- **`retrieve_from_aws_kb`**: Query your own documents indexed in Amazon Bedrock Knowledge Bases.
- **`list_tools`**: Discover available tools on the AWS Knowledge MCP server.

## Usage

- "Retrieve information about our internal security policies from the AWS Knowledge Base."
- "List available tools in the AWS Knowledge MCP server."

## Knowledge Protocol

- Requires `AWS_REGION` and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` to be set in the environment.
- The `knowledgeBaseId` is passed as an argument to `call_tool`.
