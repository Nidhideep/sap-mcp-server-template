import { z } from "zod";
import { getAuthHeaders, sapUrl } from "../config/auth.js";
import { env } from "../config/env.js";

// ─── Input schema ────────────────────────────────────────────────────────────
// Use business-friendly names. Map to SAP technical fields inside the handler.
// Never expose PERNR, KOSTL, AUFNR etc. directly in tool parameter names.

export const ExampleReadInputSchema = z.object({
  recordId: z
    .string()
    .describe("Business identifier for the record (e.g., order number, project code)"),
  includeDetails: z
    .boolean()
    .optional()
    .default(false)
    .describe("When true, fetches extended attributes along with the summary"),
});

export type ExampleReadInput = z.infer<typeof ExampleReadInputSchema>;

// ─── Output type ─────────────────────────────────────────────────────────────

export interface ExampleReadResult {
  recordId: string;
  displayName: string;
  status: string;
  lastUpdated: string;
  details?: Record<string, string>;
}

// ─── Tool definition ─────────────────────────────────────────────────────────

export const exampleReadTool = {
  name: "example_read_record",
  description:
    "Fetches a SAP business record by its identifier. " +
    "Use this before any write operation to check current state. " +
    "Safe to call any time — no side effects.",

  async handler(rawInput: unknown): Promise<ExampleReadResult> {
    const input = ExampleReadInputSchema.parse(rawInput);

    // Map business identifier to SAP technical key
    // TODO: replace with your entity's OData or RFC endpoint
    const endpoint = sapUrl(`/sap/opu/odata/sap/YOUR_SERVICE_SRV/YourEntitySet('${input.recordId}')`);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `SAP returned ${response.status} for record ${input.recordId}: ${await response.text()}`
      );
    }

    const data = (await response.json()) as { d: Record<string, string> };
    const record = data.d;

    // Map SAP technical fields to business-friendly output
    // TODO: update field mappings for your entity
    const result: ExampleReadResult = {
      recordId: input.recordId,
      displayName: record["YourDescriptionField"] ?? "",
      status: record["YourStatusField"] ?? "Unknown",
      lastUpdated: record["ChangedAt"] ?? "",
    };

    if (input.includeDetails) {
      // TODO: map additional SAP fields here
      result.details = {
        costCenter: record["Kostl"] ?? "",
        plant: record["Werks"] ?? "",
      };
    }

    if (env.LOG_LEVEL === "debug") {
      console.error(`[example_read_record] fetched ${input.recordId}`);
    }

    return result;
  },
};
