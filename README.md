# SAP MCP Server Template

A production-ready starting point for building SAP MCP (Model Context Protocol) servers that integrate Claude with SAP business systems.

---

## Purpose

This template enforces the [SAP MCP Server Standard](../personal-enterprise-brain/ontology/mcp/sap-mcp-standard.md) across every new SAP MCP integration. It provides:

- A clean TypeScript MCP server skeleton
- Strict read/write tool separation
- Mandatory verification after every write
- Layered config (enterprise → global → project → local)
- Governance and audit hooks
- Business-oriented abstractions over raw SAP fields

Start every new SAP MCP server by cloning this repo — never from scratch.

---

## Architecture

```
sap-mcp-server-template/
├── src/
│   ├── index.ts          # Entry point — registers tools and starts server
│   └── server.ts         # MCP server bootstrap and middleware
├── tools/
│   ├── example-read.tool.ts   # Pattern for all read tools
│   └── example-write.tool.ts  # Pattern for all write tools (includes verify step)
├── config/
│   ├── env.ts            # Environment variable loading (no secrets in code)
│   ├── auth.ts           # Auth provider (SSO / token / cookie fallback)
│   └── policy.ts         # Governance rules — what tools are allowed to do
├── docs/
│   ├── tool-contract-standard.md
│   ├── authentication.md
│   ├── governance.md
│   └── troubleshooting.md
├── examples/
│   └── example-workflow.md
├── CLAUDE.md             # Claude behavior contract for this server
├── .mcp.example.json     # Example MCP config — copy, never commit real values
└── .claude/
    └── settings.json     # Claude Code project-level settings
```

### Config Hierarchy

| Layer      | File                   | Scope                        |
|------------|------------------------|------------------------------|
| Enterprise | `~/.claude/CLAUDE.md`  | All projects, all users      |
| Global     | `~/.claude/settings.json` | User-level defaults        |
| Project    | `CLAUDE.md`            | This server                  |
| Local      | `.env` (gitignored)    | Machine/developer overrides  |

---

## Setup

### 1. Clone and rename

```bash
git clone https://github.com/Nidhideep/sap-mcp-server-template my-sap-xyz-mcp
cd my-sap-xyz-mcp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .mcp.example.json .mcp.json
# Edit .mcp.json with your real SAP system URL and credentials path
```

Create a `.env` file (gitignored):

```
SAP_BASE_URL=https://your-sap-system.example.com
SAP_CLIENT=100
AUTH_METHOD=token
# Add other system-specific variables
```

### 4. Build and run

```bash
npm run build
npm start
```

### 5. Register with Claude Code

Add to your Claude Code MCP config (`.mcp.json` in the Claude settings directory):

```json
{
  "mcpServers": {
    "my-sap-xyz": {
      "command": "node",
      "args": ["/absolute/path/to/my-sap-xyz-mcp/dist/index.js"]
    }
  }
}
```

---

## Available Tools

### Read Tools

| Tool | Description |
|------|-------------|
| `example_read_record` | Fetches a record by ID — replace with your entity |

### Write Tools

| Tool | Description |
|------|-------------|
| `example_write_record` | Creates or updates a record, then verifies the write |

> Every write tool must include a verification step. See [tool-contract-standard.md](docs/tool-contract-standard.md).

---

## Standard Workflow

Every SAP MCP integration should follow this sequence:

1. **Discover** — read available options (project codes, task types, work centers)
2. **Validate** — confirm the target entity exists and accepts the operation
3. **Check existing** — read current state before any write
4. **Write** — execute the business operation
5. **Verify** — read back the result and confirm success

See [example-workflow.md](examples/example-workflow.md) for a concrete walkthrough.

---

## Governance Rules

- No secrets in committed files — use `.env` (gitignored)
- Read tools are always safe to call; write tools must log intent before executing
- All write tools return verification data, not just a success flag
- SAP technical field names (e.g., `PERNR`, `KOSTL`) must be mapped to business names
- Tools must be composable — no tool should require another tool's internal state

See [governance.md](docs/governance.md) for full policy.

---

## Troubleshooting

See [troubleshooting.md](docs/troubleshooting.md) for common issues:

- Auth failures (SSO vs token vs cookie)
- SAP RFC/OData connection errors
- Tool schema validation errors
- MCP server not discovered by Claude

---

## Contributing

When adding new tools:
1. Read the [tool contract standard](docs/tool-contract-standard.md)
2. Keep read and write tools in separate files
3. Every write tool must have a corresponding verify step
4. Map all SAP technical fields to business-friendly names

---

## Reference

- [SAP MCP Server Standard](../personal-enterprise-brain/ontology/mcp/sap-mcp-standard.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Anthropic Claude Code Docs](https://docs.anthropic.com/claude-code)
