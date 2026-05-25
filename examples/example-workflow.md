# Example Workflow

This walkthrough shows the standard 5-step SAP MCP workflow using the template's placeholder tools. Replace with your real entity and business logic when cloning.

---

## Scenario

A user wants to create a new SAP business record and confirm it was saved correctly.

---

## Step 1 — Discover

Before writing, read available options so Claude can present the user with valid choices.

**Claude calls:** `example_read_record`
```json
{
  "recordId": "CATALOG-001",
  "includeDetails": true
}
```

**Purpose:** Confirm the reference entity exists and retrieve its attributes before creating a related record.

---

## Step 2 — Validate

Confirm the target for the new record is valid and in the correct state.

**Claude calls:** `example_read_record`
```json
{
  "recordId": "TARGET-001"
}
```

**Expected result:** Record exists, status is `"Open"` or `"In Process"` (not `"Closed"`).

If validation fails, Claude stops and informs the user before attempting a write.

---

## Step 3 — Check Existing State

Read the current state of the record that will be modified or created.

**Claude calls:** `example_read_record`
```json
{
  "recordId": "NEW-RECORD-XYZ"
}
```

If the record already exists, Claude presents the current data to the user and asks for confirmation before overwriting.

---

## Step 4 — Write

Execute the business operation with explicit user confirmation.

**Claude calls:** `example_write_record`
```json
{
  "recordId": "NEW-RECORD-XYZ",
  "displayName": "Q2 Maintenance Activity",
  "quantity": 8.0,
  "note": "Planned inspection per maintenance schedule"
}
```

---

## Step 5 — Verify

The write tool automatically reads back the result. Claude presents the verification to the user.

**Expected result from `example_write_record`:**
```json
{
  "success": true,
  "recordId": "NEW-RECORD-XYZ",
  "message": "Record NEW-RECORD-XYZ written and verified successfully.",
  "verification": {
    "recordExists": true,
    "currentStatus": "Saved",
    "lastUpdated": "2026-05-25T14:30:00Z"
  }
}
```

Claude confirms to the user: "The record was saved and verified. Current status: Saved, last updated May 25 at 2:30 PM."

---

## Failure Handling

If Step 4 fails (SAP rejects the write):
- The error message includes the SAP HTTP status and response body
- `auditLog()` records the failure
- Claude presents the error to the user in business terms (not raw SAP codes)
- No verification block is returned — the user knows the write did not succeed

If Step 5 shows `recordExists: false`:
- Claude warns the user: "The write appeared to succeed but the record cannot be confirmed. This may be due to SAP processing delay."
- The user can retry Step 1 after a short wait

---

## Adapting This Workflow

When you clone this template:
1. Replace `example_read_record` and `example_write_record` with your real tools
2. Update the entity names and field names throughout
3. Add domain-specific validation in Step 2 (e.g., date ranges, cost center authorization, material availability)
4. Add this workflow to `CLAUDE.md` so Claude knows the expected sequence

The 5-step structure should remain: Discover → Validate → Check → Write → Verify.
