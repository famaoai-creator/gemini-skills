#!/usr/bin/env node
/**
 * mcp-terraform-connector - Main execution script.
 * Connector for Terraform Registry operations using terraform-mcp-server
 */

const { runSkillAsync } = require('@agent/core');
const { createStandardYargs } = require('@agent/core/cli-utils');
const { executeMcp } = require('../../scripts/mcp-client-engine.cjs');

const argv = createStandardYargs()
  .option('action', { alias: 'a', type: 'string', default: 'list_tools' })
  .option('name', { alias: 'n', type: 'string' })
  .option('arguments', { alias: 'g', type: 'string' })
  .parseSync();

runSkillAsync('mcp-terraform-connector', async () => {
  // 1. Argument Validation
  const action = argv.action;
  const toolName = argv.name;
  const toolArgs = argv.arguments ? JSON.parse(argv.arguments) : {};

  // 2. Logic: Terraform Registry Connector
  const mcpCommand = 'npx';
  const mcpArgs = ['-y', 'terraform-mcp-server'];

  const result = await executeMcp(mcpCommand, mcpArgs, {
    action,
    name: toolName,
    arguments: toolArgs
  });

  return result;
});
