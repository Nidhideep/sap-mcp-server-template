
# SAP MCP Server Template

Stop building MCP servers like API wrappers.

This template helps you build **enterprise-ready MCP servers for SAP** with:

- Structured tool contracts
- Workflow-driven design (not just endpoints)
- Read / write separation + verification
- Config hierarchy (enterprise / project / local)
- Governance and safety patterns
- Business-friendly abstraction over SAP fields

Built for teams working with SAP, AI agents, and orchestration platforms.

## Why this exists

Most MCP examples:
- expose raw APIs
- ignore workflows
- skip governance
- don’t scale across teams

SAP MCP gets part of it right.

Claude best practices solve another part.

This repo combines both into a **reusable enterprise standard**.
## Quick Start

```bash
git clone https://github.com/Nidhideep/sap-mcp-server-template
cd sap-mcp-server-template
npm install
npm run build
npm start
