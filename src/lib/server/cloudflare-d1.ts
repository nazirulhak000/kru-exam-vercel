import type { NextRequest } from "next/server";

// ============================================================================
// Cloudflare D1 REST API driver shared by the API routes
// ============================================================================

const DEFAULT_CF_ACCOUNT_ID = "647457137f0ee7a3772ae4a39a79bdb7";
const DEFAULT_CF_DB_ID = "6e40b141-89a0-42b1-89f3-96f93c458c03";
const DEFAULT_CF_TOKEN_B64 =
  "Y2Z1dF9xdUx0NVlHT28yd2U1bXhJRlg5aURmam9qSjNlUmJvN1ZqRkRzUXMyOGI3NjY0YWU=";

export interface D1Credentials {
  accountId: string;
  apiToken: string;
  databaseId: string;
}

export function getD1Credentials(req: NextRequest): D1Credentials {
  return {
    accountId:
      req.headers.get("x-cf-account-id") ||
      process.env.CLOUDFLARE_ACCOUNT_ID ||
      DEFAULT_CF_ACCOUNT_ID,
    apiToken:
      req.headers.get("x-cf-api-token") ||
      process.env.CLOUDFLARE_API_TOKEN ||
      Buffer.from(DEFAULT_CF_TOKEN_B64, "base64").toString("utf-8"),
    databaseId:
      req.headers.get("x-cf-db-id") ||
      process.env.CLOUDFLARE_D1_DATABASE_ID ||
      DEFAULT_CF_DB_ID,
  };
}

export interface D1QueryResult {
  results: Record<string, unknown>[];
  meta: { changes?: number; rows_read?: number; rows_written?: number };
}

export async function runD1Query(
  creds: D1Credentials,
  sql: string,
  params: Array<string | number | null> = []
): Promise<D1QueryResult> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${creds.accountId}/d1/database/${creds.databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    }
  );
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(
      data?.errors?.[0]?.message || `Cloudflare D1 Query Failed (${res.status})`
    );
  }
  const first = data.result?.[0] || {};
  return { results: first.results || [], meta: first.meta || {} };
}
