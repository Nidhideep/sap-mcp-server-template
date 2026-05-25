# Tool Contract Standard

Every tool in an SAP MCP server must follow this contract. It ensures tools are composable, predictable, and safe for Claude to orchestrate.

---

## 1. Tool Naming

- Use `snake_case` and prefix with the domain (e.g., `eam_get_work_orders`, `cats_write_booking`)
- Read tools use `get_`, `list_`, `search_`, `check_`
- Write tools use `write_`, `create_`, `update_`, `submit_`
- No generic names like `do_thing` or `call_sap`

---

## 2. Input Schema Rules

- Every parameter must have a `description` that explains its business meaning
- Use business-friendly names — not SAP technical field names
  - `employeeId` not `PERNR`
  - `costCenter` not `KOSTL`
  - `workOrder` not `AUFNR`
- All required parameters must be in `required[]`
- Use `enum` for parameters with a fixed set of valid values
- No `any` types — Zod validation required in handler

**Good:**
```ts
recordId: z.string().describe("Work order number visible in the SAP Fiori app")
```

**Bad:**
```ts
aufnr: z.string() // raw SAP field, no description
```

---

## 3. Output Structure Rules

- Return structured objects, never raw SAP JSON payloads
- Always include the business identifier in the output so Claude can correlate results
- Use ISO 8601 for all dates
- Map status codes to human-readable strings (`"Released"` not `"REL"`)
- Write tools must always include a `verification` block (see section 5)

---

## 4. Read Tool Pattern

```
handler(input) {
  1. Validate input with Zod
  2. Map business fields → SAP technical fields
  3. Call SAP OData/RFC
  4. Map SAP response → business-friendly output
  5. Return structured result
}
```

Read tools:
- Are always safe to call (no side effects)
- Should never throw on empty results — return `null` or empty arrays
- Must not require session state from prior calls

---

## 5. Write Tool Pattern

```
handler(input) {
  1. Validate input with Zod
  2. Call enforceWritePolicy()        ← governance check
  3. Map business fields → SAP fields
  4. Execute write (OData POST/PATCH/RFC)
  5. Call read-back tool              ← verification step
  6. Call auditLog()                  ← audit trail
  7. Return result + verification block
}
```

Write tools:
- Must call `enforceWritePolicy()` before any SAP call
- Must read back after writing — never return just `{ success: true }`
- Must call `auditLog()` on both success and failure
- Should describe the intended change in the tool description so Claude can explain it to users

**Verification block (required in every write result):**
```ts
verification: {
  recordExists: boolean;
  currentStatus: string;
  lastUpdated: string;
}
```

---

## 6. Error Handling

- Throw descriptive `Error` objects, not string rejections
- Include the SAP HTTP status code and response body in error messages
- Do not swallow errors with empty catch blocks
- Policy violations throw `PolicyViolation` (from `config/policy.ts`) — let these propagate

---

## 7. No Raw SAP Exposure

Tools are the abstraction boundary. The following must never appear in tool names, parameter names, or output field names:

| Raw SAP | Use instead |
|---------|-------------|
| `PERNR` | `employeeId` |
| `KOSTL` | `costCenter` |
| `AUFNR` | `workOrder` |
| `MATNR` | `materialNumber` |
| `WERKS` | `plant` |
| `BUKRS` | `companyCode` |
| `VBELN` | `salesOrder` |

Add to this list as your integration expands.

---

## 8. Tool Registration

Register all tools in `src/server.ts`:
- Read tools in `registerReadTools()`
- Write tools in `registerWriteTools()`

This separation makes it easy to audit what can and cannot cause side effects.
