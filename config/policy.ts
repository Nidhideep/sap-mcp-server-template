import { env } from "./env.js";

/**
 * Governance policy — enforced before any write tool executes.
 * Add domain-specific rules here: date windows, employee scope, cost center limits, etc.
 */

export class PolicyViolation extends Error {
  constructor(rule: string, detail: string) {
    super(`Policy violation [${rule}]: ${detail}`);
    this.name = "PolicyViolation";
  }
}

/**
 * Call at the start of every write tool handler.
 * Throws PolicyViolation if the operation is not allowed.
 */
export function enforceWritePolicy(context: {
  toolName: string;
  userId?: string;
  targetEntity?: string;
}): void {
  // Dry-run guard — write tools become no-ops
  if (env.DRY_RUN) {
    throw new PolicyViolation(
      "DRY_RUN",
      `Write blocked — DRY_RUN=true. Tool: ${context.toolName}`
    );
  }

  // Add additional rules below as your SAP integration grows:
  //
  // Example: restrict writes to certain cost centers
  // if (!ALLOWED_COST_CENTERS.includes(context.targetEntity ?? "")) {
  //   throw new PolicyViolation("COST_CENTER_SCOPE", `Not authorized for ${context.targetEntity}`);
  // }
  //
  // Example: block writes outside business hours
  // const hour = new Date().getUTCHours();
  // if (hour < 6 || hour > 20) {
  //   throw new PolicyViolation("BUSINESS_HOURS", "Writes are only allowed 06:00–20:00 UTC");
  // }
}

/**
 * Audit log — call after every write tool completes (success or failure).
 * Replace with your real logging sink (Splunk, CloudWatch, SAP audit trail, etc.)
 */
export function auditLog(entry: {
  toolName: string;
  userId?: string;
  input: unknown;
  result: "success" | "error";
  detail?: string;
}): void {
  if (env.LOG_LEVEL === "debug" || env.LOG_LEVEL === "info") {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        audit: true,
        ...entry,
      })
    );
  }
}
