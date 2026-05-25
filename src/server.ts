import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exampleReadTool } from "../tools/example-read.tool.js";
import { exampleWriteTool } from "../tools/example-write.tool.js";

/**
 * Creates and configures the MCP server instance with all registered tools.
 *
 * To add a new tool:
 * 1. Create tools/your-tool.tool.ts following the read or write pattern
 * 2. Import it here
 * 3. Call registerTool() below
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "sap-mcp-server",       // TODO: rename to your specific server name
    version: "0.1.0",
  });

  registerReadTools(server);
  registerWriteTools(server);

  return server;
}

function registerReadTools(server: McpServer): void {
  server.tool(
    exampleReadTool.name,
    exampleReadTool.description,
    exampleReadTool.inputSchema.properties,
    async ({ recordId, includeDetails }) => {
      const result = await exampleReadTool.handler({ recordId, includeDetails });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Register additional read tools here
}

function registerWriteTools(server: McpServer): void {
  server.tool(
    exampleWriteTool.name,
    exampleWriteTool.description,
    exampleWriteTool.inputSchema.properties,
    async ({ recordId, displayName, quantity, note }) => {
      const result = await exampleWriteTool.handler({ recordId, displayName, quantity, note });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Register additional write tools here
}
