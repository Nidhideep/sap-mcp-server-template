import { z } from "zod";
import { getAuthHeaders, sapUrl } from "../config/auth.js";
import { env } from "../config/env.js";
import { enforceWritePolicy, auditLog } from "../config/policy.js";
import { exampleReadTool } from "./example-read.tool.js";

// ─── Input schema ────────────────────────────────────────────────────────────

export const ExampleWriteInputSchema = z.object({
  recordId: z
    .string()
    .describe("Business identifier for the record to create or update"),
  displayName: z
    .string()
    .min(1)
    .describe("Human-readable name or description for the record"),
  quantity: z
    .number()
    .positive()
    .describe("Quantity in business units (hours, units, etc.)"),
  note: z
    .string()
    .optional()
    .describe("Optional free-text note attached to the record"),
});

export type ExampleWriteInput = z.infer<typeof ExampleWriteInputSchema>;

// ─── Output type ─────────────────────────────────────────────────────────────

export interface ExampleWriteResult {
  success: boolean;
  recordId: string;
  message: string;
  // Verification: always read back after writing
  verification: {
    recordExists: boolean;
    currentStatus: string;
    lastUpdated: string;
  };
}

// ─── Tool definition ─────────────────────────────────────────────────────────

export const exampleWriteTool = {
  name: "example_write_record",
  description:
    "Creates or updates a SAP business record. " +
    "Always reads back the result after writing to confirm success. " +
    "Call example_read_record first to check existing state before using this tool.",

  inputSchema: {
    type: "object" as const,
    properties: {
      recordId: {
        type: "string",
        description: "Business identifier for the record",
      },
      displayName: {
        type: "string",
        description: "Human-readable name or description",
      },
      quantity: {
        type: "number",
        description: "Quantity in business units",
      },
      note: {
        type: "string",
        description: "Optional free-text note",
      },
    },
    required: ["recordId", "displayName", "quantity"],
  },

  async handler(rawInput: unknown): Promise<ExampleWriteResult> {
    const input = ExampleWriteInputSchema.parse(rawInput);

    // 1. Governance check — throws PolicyViolation if not allowed
    enforceWritePolicy({ toolName: "example_write_record" });

    let result: ExampleWriteResult;

    try {
      // 2. Map business fields to SAP technical fields
      // TODO: replace with your entity's OData or RFC payload
      const payload = {
        // YourIdField: input.recordId,
        // YourDescriptionField: input.displayName,
        // YourQuantityField: input.quantity.toString(),
        // YourNoteField: input.note ?? "",
      };

      if (env.LOG_LEVEL === "debug") {
        console.error(`[example_write_record] writing record ${input.recordId}`);
      }

      // 3. Execute write
      const endpoint = sapUrl(`/sap/opu/odata/sap/YOUR_SERVICE_SRV/YourEntitySet`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `SAP write failed ${response.status}: ${await response.text()}`
        );
      }

      // 4. Verify — always read back after writing
      const verified = await exampleReadTool.handler({ recordId: input.recordId });

      result = {
        success: true,
        recordId: input.recordId,
        message: `Record ${input.recordId} written and verified successfully.`,
        verification: {
          recordExists: true,
          currentStatus: verified.status,
          lastUpdated: verified.lastUpdated,
        },
      };
    } catch (error) {
      // 5. Audit on failure
      auditLog({
        toolName: "example_write_record",
        input,
        result: "error",
        detail: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    // 6. Audit on success
    auditLog({
      toolName: "example_write_record",
      input,
      result: "success",
      detail: result.message,
    });

    return result;
  },
};
