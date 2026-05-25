import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

/**
 * Entry point — starts the MCP server on stdio transport.
 * Claude Code communicates via stdin/stdout; do not use console.log here.
 * Use console.error for debug output (it goes to stderr, not the MCP channel).
 */
async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("[sap-mcp-server] running on stdio");
}

main().catch((error) => {
  console.error("[sap-mcp-server] fatal error:", error);
  process.exit(1);
});
