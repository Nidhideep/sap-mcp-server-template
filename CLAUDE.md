# Claude Behavior Contract — SAP MCP Server

## Governing Standard

Before making any change to this server — tools, config, auth, or docs — read:

```
../personal-enterprise-brain/ontology/mcp/sap-mcp-standard.md
```

That file is the authoritative standard for all SAP MCP servers. This CLAUDE.md extends it with project-specific rules.

---

## What This Server Does

This is a SAP MCP server built from the shared template. It exposes business-oriented tools that Claude uses to interact with SAP systems safely and predictably.

Replace this section with the specific purpose of your SAP integration when you clone the template.

---

## Tool Design Rules

1. **Read tools** — safe to call any time, no side effects, always return structured data
2. **Write tools** — must log intent, execute the write, then verify by reading back
3. **No raw SAP fields** — always map `PERNR` → `employeeId`, `KOSTL` → `costCenter`, etc.
4. **Strict schemas** — every parameter must be typed and described; no `any` types
5. **Business meaning first** — tool names describe the business action, not the RFC/OData call

---

## Workflow Claude Should Follow

When a user asks Claude to perform a business action through this server:

1. Use read tools to discover available options first
2. Validate the target exists before writing
3. Check existing state so the user knows what will change
4. Execute the write with explicit user confirmation for destructive actions
5. Always verify the result using a read-back tool call

---

## What Claude Must NOT Do

- Expose SAP technical field names in responses to users
- Skip verification after write operations
- Guess at SAP system state — always read first
- Commit or suggest committing `.env`, `.mcp.json`, or any file with real credentials
- Use this server's tools to bypass governance rules defined in `config/policy.ts`

---

## Config Hierarchy (Do Not Flatten)

| Layer      | Where                  |
|------------|------------------------|
| Enterprise | `~/.claude/CLAUDE.md`  |
| Global     | `~/.claude/settings.json` |
| Project    | This file (`CLAUDE.md`) |
| Local      | `.env` (never committed) |

---

## Adding New Tools

1. Read `docs/tool-contract-standard.md` first
2. Create `tools/your-tool-name.tool.ts`
3. Register in `src/index.ts`
4. Update `README.md` tool table
5. Add example to `examples/example-workflow.md` if it's part of a workflow

---

## Auth

See `docs/authentication.md`. Auth method is set via `AUTH_METHOD` env var. Never hardcode credentials.

---

## Governance

See `docs/governance.md`. Policy enforcement lives in `config/policy.ts` — do not bypass it.
