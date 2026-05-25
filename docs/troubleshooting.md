# Troubleshooting

---

## Server Not Discovered by Claude

**Symptom:** Claude says it doesn't have access to the SAP tools.

**Checks:**
1. Verify `dist/index.js` exists — run `npm run build` first
2. Check your `.mcp.json` path is absolute, not relative
3. Restart Claude Code after changing `.mcp.json`
4. Run the server manually to confirm it starts: `node dist/index.js`
5. Check Claude Code MCP settings: `claude mcp list`

---

## Authentication Failures

**Symptom:** Tools return HTTP 401 or 403 errors.

**For `AUTH_METHOD=token`:**
- Token may be expired — regenerate from your IdP
- Confirm `SAP_TOKEN` is set in `.env`
- Check the token has the correct scope for your SAP service

**For `AUTH_METHOD=basic`:**
- Verify `SAP_USERNAME` and `SAP_PASSWORD` in `.env`
- Confirm the user is active in SAP (not locked)
- Check `SAP_CLIENT` matches your target system client

**For CSRF errors (HTTP 403 on writes):**
- Add CSRF token fetch before write calls — see [authentication.md](authentication.md#csrf-tokens)
- Confirm your OData service requires CSRF (not all do)

---

## SAP Connection Errors

**Symptom:** Tools return `ECONNREFUSED` or `ETIMEDOUT`.

**Checks:**
1. Verify `SAP_BASE_URL` is reachable from your machine: `curl -I $SAP_BASE_URL`
2. Check VPN — SAP systems are often on-prem and require VPN
3. Confirm the SAP system is running (weekend maintenance windows are common)
4. Check firewall rules if running from a server or CI environment

---

## Tool Schema Validation Errors

**Symptom:** Claude reports "invalid tool parameters" or tools refuse to call.

**Checks:**
1. Ensure `inputSchema.properties` in the tool definition matches the Zod schema
2. Check `required[]` includes all non-optional fields
3. Rebuild after schema changes: `npm run build`
4. Run `npm run typecheck` to catch type mismatches before runtime

---

## Write Tool Returns No Verification

**Symptom:** Write succeeds but `verification.recordExists` is false.

**Likely causes:**
- SAP uses eventual consistency — the record may not be immediately readable
- The read-back is hitting a different SAP application server than the write
- The record was written to a staging buffer (e.g., CATS requires approval before it's queryable)

**Fix:** Add a short delay before read-back, or read from the staging table instead.

---

## Policy Violation Errors

**Symptom:** Write tool throws `PolicyViolation: Write blocked — DRY_RUN=true`.

**This is expected behavior.** Remove `DRY_RUN=true` from `.env` (or set it to `false`) to enable live writes.

For other policy violations, check `config/policy.ts` for the rule that applies.

---

## Environment Variable Not Loaded

**Symptom:** `Environment configuration invalid: SAP_BASE_URL: SAP_BASE_URL must be a valid URL`.

**Checks:**
1. Confirm `.env` file exists in the project root (not inside `src/`)
2. Confirm the variable name matches exactly (case-sensitive)
3. Restart the server after editing `.env`
4. Check for hidden characters or quotes around the value: `SAP_BASE_URL="https://..."` — remove the quotes

---

## Debug Logging

Set `LOG_LEVEL=debug` in `.env` to get per-tool request logs on stderr. These appear in the Claude Code MCP server log, not in the chat.

```env
LOG_LEVEL=debug
```

To view MCP server stderr in Claude Code, check the developer console or MCP log output per your Claude Code version.
