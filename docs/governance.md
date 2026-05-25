# Governance

SAP MCP servers operate inside SAP business systems that affect real data — payroll, maintenance orders, financial postings. Governance is not optional.

---

## Core Rules

### 1. No Secrets in Committed Files

The following must never be committed to git:
- SAP credentials (username, password, token)
- `.mcp.json` with real system URLs
- `.env` files

Enforced by `.gitignore`. If you accidentally commit a secret, rotate it immediately.

### 2. Write Tools Must Verify

Every write tool must read back after writing. A response of `{ success: true }` without verification is a governance violation. The write may have partially succeeded or been rejected by SAP business rules.

Required in every write result:
```ts
verification: {
  recordExists: boolean;
  currentStatus: string;
  lastUpdated: string;
}
```

### 3. Audit Every Write

Call `auditLog()` from `config/policy.ts` on every write, whether it succeeds or fails. The audit log is your evidence trail for SAP authorization audits.

### 4. Respect Policy Boundaries

`config/policy.ts` defines what write operations are allowed. Do not bypass `enforceWritePolicy()`. Add new restrictions there — not in tool handlers.

Current enforced policies:
- **DRY_RUN mode**: when `DRY_RUN=true`, all writes are blocked. Use for testing.
- *(Add domain-specific policies as your integration matures)*

### 5. No Raw SAP Field Exposure

Tools are the abstraction boundary between Claude and SAP. Users and Claude should never see `PERNR`, `KOSTL`, `AUFNR`, or other SAP technical keys in tool inputs, outputs, or error messages.

---

## Config Layer Governance

Each config layer has a defined scope. Never collapse layers:

| Layer      | Governed by  | Scope                              |
|------------|--------------|------------------------------------|
| Enterprise | IT / Infra   | All users, all projects            |
| Global     | Developer    | Personal defaults                  |
| Project    | Team / Lead  | This MCP server                    |
| Local      | Individual   | Machine-specific overrides, secrets |

---

## Roles and Permissions

Define what Claude is and is not authorized to do in `CLAUDE.md`. Example structure:

```
Claude CAN:
- Read any record in scope
- Suggest writes based on user input
- Present verification results

Claude CANNOT:
- Write without explicit user request
- Bypass DRY_RUN mode
- Expose raw SAP field names in responses
```

---

## Change Control

When modifying write tool behavior in production:
1. Test with `DRY_RUN=true` first
2. Review audit logs after the first live run
3. Update `docs/governance.md` if policy rules change
4. Update `CLAUDE.md` if Claude's permitted behavior changes

---

## SAP Authorization Objects

MCP tools execute with the SAP user credentials configured in `.env`. That user's SAP authorization objects define what is actually possible. The MCP governance layer is additive — it can only restrict further, not grant permissions SAP has denied.

Document the required SAP authorization objects for your integration here:

| Authorization Object | Field | Value | Purpose |
|---------------------|-------|-------|---------|
| *(add your objects)* | | | |

---

## Incident Response

If a write tool causes an unintended change in SAP:
1. Set `DRY_RUN=true` immediately to halt further writes
2. Use read tools to assess current state
3. Document the incident in your change log
4. Contact your SAP basis team for rollback options (SAP does not auto-rollback)
