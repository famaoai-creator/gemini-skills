#!/usr/bin/env node
/**
 * mcp-aws-knowledge-connector - Main execution script.
 * Connector for AWS Knowledge Base retrieval using @modelcontextprotocol/server-aws-kb-retrieval
 */

const { runSkillAsync } = require('@agent/core');
const { createStandardYargs } = require('@agent/core/cli-utils');
const { executeMcp } = require('../../scripts/mcp-client-engine.cjs');

const argv = createStandardYargs()
  .option('action', { alias: 'a', type: 'string', default: 'list_tools' })
  .option('name', { alias: 'n', type: 'string' })
  .option('arguments', { alias: 'g', type: 'string' })
  .parseSync();

runSkillAsync('mcp-aws-knowledge-connector', async () => {
  // 1. Argument Validation
  const action = argv.action;
  const toolName = argv.name;
  const toolArgs = argv.arguments ? JSON.parse(argv.arguments) : {};

  // 2. Logic: AWS Knowledge Base Retrieval
  const mcpCommand = 'npx';
  const mcpArgs = ['-y', '@modelcontextprotocol/server-aws-kb-retrieval'];

  const result = await executeMcp(mcpCommand, mcpArgs, {
    action,
    name: toolName,
    arguments: toolArgs
  });

  return result;
});
