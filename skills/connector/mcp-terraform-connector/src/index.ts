import { runSkillAsync } from '@agent/core';
import { createStandardYargs } from '@agent/core/cli-utils';
import { executeMcp } from '@agent/core/mcp-client-engine';

const argv = createStandardYargs()
  .option('action', { alias: 'a', type: 'string', default: 'list_tools' })
  .option('name', { alias: 'n', type: 'string' })
  .option('arguments', { alias: 'g', type: 'string' })
  .parseSync();

if (require.main === module || (typeof process !== 'undefined' && process.env.VITEST !== 'true')) {
  runSkillAsync('mcp-terraform-connector', async () => {
    const action = argv.action as string;
    const toolName = argv.name as string | undefined;
    const toolArgs = argv.arguments ? JSON.parse(argv.arguments as string) : {};

    const mcpCommand = 'npx';
    const mcpArgs = ['-y', 'terraform-mcp-server'];

    const result = await executeMcp(mcpCommand, mcpArgs, {
      action: action as any,
      name: toolName,
      arguments: toolArgs
    });

    return result;
  });
}
