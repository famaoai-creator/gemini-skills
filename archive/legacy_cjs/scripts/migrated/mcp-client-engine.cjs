/**
 * MCP Client Engine (Common logic for Approach B individual wrappers)
 */
// Use the official exports from the SDK package.json
const { Client } = require("@modelcontextprotocol/sdk/client");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

/**
 * Execute a command on an MCP server.
 * @param {string} command - Command to run the MCP server (e.g., 'npx')
 * @param {string[]} args - Arguments for the command
 * @param {object} actionRequest - { action: 'list_tools'|'call_tool'|'list_resources', name?: string, arguments?: object }
 */
async function executeMcp(command, args, actionRequest) {
  const transport = new StdioClientTransport({
    command: command,
    args: args,
    stderr: "inherit",
  });

  const client = new Client(
    {
      name: "Gemini-Connector-Client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);

    let result;
    if (actionRequest.action === 'list_tools') {
      result = await client.listTools();
    } else if (actionRequest.action === 'call_tool') {
      if (!actionRequest.name) throw new Error("Tool name is required for call_tool");
      result = await client.callTool({
        name: actionRequest.name,
        arguments: actionRequest.arguments || {},
      });
    } else if (actionRequest.action === 'list_resources') {
        result = await client.listResources();
    } else {
        throw new Error(`Unsupported action: ${actionRequest.action}`);
    }

    return result;
  } finally {
    try {
      await transport.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}

module.exports = { executeMcp };
