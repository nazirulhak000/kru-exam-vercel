import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface CloudPayload {
  version: number;
  updatedAt: string;
  customQuestions: unknown[];
  editedSeeds: Record<string, unknown>;
  deletedIds: string[];
  attempts: unknown[];
  mistakes: Record<string, unknown>;
}

const EMPTY_PAYLOAD: CloudPayload = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  customQuestions: [],
  editedSeeds: {},
  deletedIds: [],
  attempts: [],
  mistakes: {},
};

// ============================================================================
// 1. Cloudflare D1 REST API Driver (Auto-creates "kru-exam-db" + SQLite Table)
// ============================================================================

async function resolveCloudflareD1DatabaseId(
  accountId: string,
  apiToken: string,
  explicitDbId?: string
): Promise<string> {
  if (explicitDbId && explicitDbId.trim()) {
    return explicitDbId.trim();
  }

  const headers = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  // 1. ค้นหาฐานข้อมูล D1 ชื่อ kru-exam-db
  const listRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database?name=kru-exam-db`,
    { headers, cache: "no-store" }
  );
  const listData = await listRes.json();
  if (!listRes.ok || !listData.success) {
    throw new Error(
      listData?.errors?.[0]?.message ||
        `Cloudflare D1 Auth Failed (${listRes.status})`
    );
  }

  const existing = (listData.result || []).find(
    (db: { name?: string; uuid?: string }) => db.name === "kru-exam-db"
  );
  if (existing?.uuid) {
    return existing.uuid;
  }

  // 2. ถ้ายังไม่มี ให้สร้างฐานข้อมูล D1 ชื่อ kru-exam-db อัตโนมัติ
  const createRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "kru-exam-db" }),
    }
  );
  const createData = await createRes.json();
  if (!createRes.ok || !createData.success || !createData.result?.uuid) {
    throw new Error(
      createData?.errors?.[0]?.message || "ไม่สามารถสร้างฐานข้อมูล Cloudflare D1 ได้"
    );
  }

  return createData.result.uuid;
}

async function queryCloudflareD1(
  accountId: string,
  apiToken: string,
  dbId: string,
  sql: string,
  params: string[] = []
) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
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
  return data.result?.[0]?.results || [];
}

async function ensureD1Table(accountId: string, apiToken: string, dbId: string) {
  await queryCloudflareD1(
    accountId,
    apiToken,
    dbId,
    `CREATE TABLE IF NOT EXISTS kru_exam_cloud_state (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`
  );
}

async function readFromCloudflareD1(
  accountId: string,
  apiToken: string,
  explicitDbId?: string
): Promise<{ payload: CloudPayload; databaseId: string }> {
  const databaseId = await resolveCloudflareD1DatabaseId(
    accountId,
    apiToken,
    explicitDbId
  );
  await ensureD1Table(accountId, apiToken, databaseId);

  const rows = await queryCloudflareD1(
    accountId,
    apiToken,
    databaseId,
    `SELECT payload FROM kru_exam_cloud_state WHERE id = ? LIMIT 1;`,
    ["main"]
  );

  if (!rows || rows.length === 0 || !rows[0]?.payload) {
    return { payload: EMPTY_PAYLOAD, databaseId };
  }

  try {
    return {
      payload: JSON.parse(rows[0].payload as string) as CloudPayload,
      databaseId,
    };
  } catch {
    return { payload: EMPTY_PAYLOAD, databaseId };
  }
}

async function writeToCloudflareD1(
  accountId: string,
  apiToken: string,
  payload: CloudPayload,
  explicitDbId?: string
): Promise<{ databaseId: string }> {
  const databaseId = await resolveCloudflareD1DatabaseId(
    accountId,
    apiToken,
    explicitDbId
  );
  await ensureD1Table(accountId, apiToken, databaseId);

  const nowIso = new Date().toISOString();
  const serialized = JSON.stringify({ ...payload, updatedAt: nowIso });

  await queryCloudflareD1(
    accountId,
    apiToken,
    databaseId,
    `INSERT INTO kru_exam_cloud_state (id, payload, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at;`,
    ["main", serialized, nowIso]
  );

  return { databaseId };
}

// ============================================================================
// 2. GitHub Cloud Ref Driver (Zero-Config Cloud Sync via Git Data API)
//    เก็บข้อมูลไว้ใน custom Git Ref "refs/kru-cloud/state" โดยไม่ทริกเกอร์การ Build ใหม่
// ============================================================================

const GH_REF_NAME = "kru-cloud/state";

async function readFromGitHubCloud(
  ghToken: string,
  ghRepo: string
): Promise<CloudPayload> {
  const headers = {
    Authorization: `Bearer ${ghToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const refRes = await fetch(
    `https://api.github.com/repos/${ghRepo}/git/ref/${GH_REF_NAME}`,
    { headers, cache: "no-store" }
  );

  if (refRes.status === 404) {
    return EMPTY_PAYLOAD;
  }

  if (!refRes.ok) {
    throw new Error(`GitHub Cloud Ref Read Error (${refRes.status})`);
  }

  const refData = await refRes.json();
  const blobSha = refData?.object?.sha;
  if (!blobSha) return EMPTY_PAYLOAD;

  const blobRes = await fetch(
    `https://api.github.com/repos/${ghRepo}/git/blobs/${blobSha}`,
    { headers, cache: "no-store" }
  );
  if (!blobRes.ok) return EMPTY_PAYLOAD;

  const blobData = await blobRes.json();
  if (!blobData?.content) return EMPTY_PAYLOAD;

  const jsonStr = Buffer.from(blobData.content, "base64").toString("utf-8");
  return JSON.parse(jsonStr) as CloudPayload;
}

async function writeToGitHubCloud(
  ghToken: string,
  ghRepo: string,
  payload: CloudPayload
): Promise<void> {
  const headers = {
    Authorization: `Bearer ${ghToken}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const serialized = JSON.stringify(
    { ...payload, updatedAt: new Date().toISOString() },
    null,
    2
  );

  // 1. สร้าง Git Blob สำหรับ JSON สถานะล่าสุด
  const blobRes = await fetch(
    `https://api.github.com/repos/${ghRepo}/git/blobs`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: Buffer.from(serialized, "utf-8").toString("base64"),
        encoding: "base64",
      }),
      cache: "no-store",
    }
  );

  if (!blobRes.ok) {
    throw new Error(`GitHub Blob Create Failed (${blobRes.status})`);
  }

  const blobData = await blobRes.json();
  const newSha = blobData.sha;

  // 2. อัปเดตหรือสร้าง Ref "refs/kru-cloud/state"
  const checkRes = await fetch(
    `https://api.github.com/repos/${ghRepo}/git/ref/${GH_REF_NAME}`,
    { headers, cache: "no-store" }
  );

  if (checkRes.status === 404) {
    const createRefRes = await fetch(
      `https://api.github.com/repos/${ghRepo}/git/refs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          ref: `refs/${GH_REF_NAME}`,
          sha: newSha,
        }),
        cache: "no-store",
      }
    );
    if (!createRefRes.ok) {
      throw new Error(`GitHub Ref Create Failed (${createRefRes.status})`);
    }
  } else {
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${ghRepo}/git/refs/${GH_REF_NAME}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          sha: newSha,
          force: true,
        }),
        cache: "no-store",
      }
    );
    if (!updateRefRes.ok) {
      throw new Error(`GitHub Ref Update Failed (${updateRefRes.status})`);
    }
  }
}

// ============================================================================
// Route Handlers (GET = ดึงข้อมูลจาก Cloud, POST = บันทึก/ซิงก์ข้อมูลขึ้น Cloud)
// ============================================================================

function getCredentials(req: NextRequest) {
  const cfAccountId =
    req.headers.get("x-cf-account-id") ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    "";
  const cfApiToken =
    req.headers.get("x-cf-api-token") ||
    process.env.CLOUDFLARE_API_TOKEN ||
    "";
  const cfDbId =
    req.headers.get("x-cf-db-id") ||
    process.env.CLOUDFLARE_D1_DATABASE_ID ||
    "";

  const ghToken = process.env.CLOUD_SYNC_GH_TOKEN || "";
  const ghRepo =
    process.env.CLOUD_SYNC_GH_REPO || "nazirulhak000/kru-exam-vercel";

  return { cfAccountId, cfApiToken, cfDbId, ghToken, ghRepo };
}

export async function GET(req: NextRequest) {
  try {
    const { cfAccountId, cfApiToken, cfDbId, ghToken, ghRepo } =
      getCredentials(req);

    // ลำดับที่ 1: ใช้ Cloudflare D1 หากตั้งค่าไว้
    if (cfAccountId && cfApiToken) {
      const { payload, databaseId } = await readFromCloudflareD1(
        cfAccountId,
        cfApiToken,
        cfDbId
      );
      return NextResponse.json({
        ok: true,
        provider: "cloudflare-d1",
        databaseId,
        data: payload,
      });
    }

    // ลำดับที่ 2: ใช้ GitHub Cloud Database อัตโนมัติ
    if (ghToken && ghRepo) {
      const payload = await readFromGitHubCloud(ghToken, ghRepo);
      return NextResponse.json({
        ok: true,
        provider: "github-cloud",
        data: payload,
      });
    }

    return NextResponse.json({
      ok: false,
      provider: "local-only",
      message: "ยังไม่ได้เชื่อมต่อ Cloud Database",
      data: EMPTY_PAYLOAD,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Cloud Sync Read Failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cfAccountId, cfApiToken, cfDbId, ghToken, ghRepo } =
      getCredentials(req);
    const body = (await req.json()) as CloudPayload;

    // ลำดับที่ 1: บันทึกลง Cloudflare D1 หากตั้งค่าไว้
    if (cfAccountId && cfApiToken) {
      const { databaseId } = await writeToCloudflareD1(
        cfAccountId,
        cfApiToken,
        body,
        cfDbId
      );
      return NextResponse.json({
        ok: true,
        provider: "cloudflare-d1",
        databaseId,
        updatedAt: new Date().toISOString(),
      });
    }

    // ลำดับที่ 2: บันทึกลง GitHub Cloud Database อัตโนมัติ
    if (ghToken && ghRepo) {
      await writeToGitHubCloud(ghToken, ghRepo, body);
      return NextResponse.json({
        ok: true,
        provider: "github-cloud",
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        ok: false,
        provider: "local-only",
        error: "ยังไม่ได้ตั้งค่า Cloudflare D1 หรือ Cloud Token",
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Cloud Sync Write Failed",
      },
      { status: 500 }
    );
  }
}
