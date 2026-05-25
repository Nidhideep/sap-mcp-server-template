import { env } from "./env.js";

// Record<string, string> satisfies fetch()'s HeadersInit directly.
export type AuthHeaders = Record<string, string>;

/**
 * Returns HTTP headers for SAP system requests based on AUTH_METHOD.
 * Never logs credentials — only headers safe for debug output.
 *
 * See docs/authentication.md for fallback order and setup.
 */
export function getAuthHeaders(): AuthHeaders {
  const base: AuthHeaders = {
    "sap-client": env.SAP_CLIENT,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  switch (env.AUTH_METHOD) {
    case "token": {
      if (!env.SAP_TOKEN) throw new Error("AUTH_METHOD=token but SAP_TOKEN is not set");
      return { ...base, Authorization: `Bearer ${env.SAP_TOKEN}` };
    }
    case "basic": {
      if (!env.SAP_USERNAME || !env.SAP_PASSWORD) {
        throw new Error("AUTH_METHOD=basic but SAP_USERNAME or SAP_PASSWORD is not set");
      }
      const encoded = Buffer.from(`${env.SAP_USERNAME}:${env.SAP_PASSWORD}`).toString("base64");
      return { ...base, Authorization: `Basic ${encoded}` };
    }
    case "sso": {
      // SSO: token is injected by the runtime (e.g., Azure AD, SAP IAS).
      // Add your SSO token acquisition logic here.
      // Example: read from a shared token cache, call an OIDC endpoint, etc.
      throw new Error("SSO auth is not yet implemented — add your token provider in config/auth.ts");
    }
  }
}

/**
 * Builds a full SAP OData or RFC endpoint URL.
 */
export function sapUrl(path: string): string {
  return `${env.SAP_BASE_URL}${path}`;
}
