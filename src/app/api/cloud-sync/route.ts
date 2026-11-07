import { NextRequest, NextResponse } from "next/server";
import { getD1Credentials } from "@/lib/server/cloudflare-d1";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface CommentPayloadItem {
  id: string;
  questionId: string;
  authorKey: string;
  isAdminAuthor?: boolean;
  type: "report_wrong" | "comment";
  suggestedAnswer?: number | null;
  message: string;
  status?: "pending" | "resolved";
  resolvedNote?: string;
  createdAt: string;
  displayDate: string;
}

interface CloudPayload {
  version: number;
  updatedAt: string;
  historyClearedAt?: string;
  customQuestions: unknown[];
  editedSeeds: Record<string, unknown>;
  deletedIds: string[];
  questionComments?: Record<string, CommentPayloadItem[]>;
  attempts: unknown[];
  mistakes: Record<string, unknown>;
  adminAction?: "replace_shared_bank";
}

const EMPTY_PAYLOAD: CloudPayload = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  historyClearedAt: "",
  customQuestions: [],
  editedSeeds: {},
  deletedIds: [],
  questionComments: {},
  attempts: [],
  mistakes: {},
};

const SHARED_BANK_RECORD_ID = "shared-question-bank";

function sanitizeUserId(raw: string | null): string {
  if (!raw) return "default-user";
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return cleaned || "default-user";
}

function getAdminSecretKey(): string {
  return (process.env.ADMIN_SECRET_KEY || "kru-admin-9999")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

function isRequestFromAdmin(req: NextRequest, userId: string): boolean {
  const adminSecret = getAdminSecretKey();
  const headerAdminKey = sanitizeUserId(req.headers.get("x-kru-admin-key"));
  return userId === adminSecret || (!!headerAdminKey && headerAdminKey === adminSecret);
}

function getQuestionFingerprintServer(item: unknown): string {
  if (!item || typeof item !== "object") return "";
  const q = item as { question?: unknown };
  if (typeof q.question !== "string") return "";
  return q.question
    .replace(/^(?:ข้อ(?:ที่)?\s*)?\d+\s*[.)]\s*/, "")
    .replace(/\s+/g, "")
    .replace(/[.,;!?'"()[\]{}\-_/\\]+/g, "")
    .toLowerCase();
}

function isAuthenticValidQuestion(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const q = item as {
    question?: unknown;
    options?: unknown;
    confidenceScore?: unknown;
  };
  if (typeof q.question !== "string") return false;

  const cleanStem = q.question
    .replace(/^(?:ข้อ(?:ที่)?\s*)?\d+\s*[.)]\s*/, "")
    .trim();
  if (cleanStem.length < 12) return false;
  if (/(.)\1{5,}/.test(cleanStem)) return false;

  const spamPattern =
    /(?:ติดต่อโฆษณา|สั่งซื้อแนวข้อสอบ|line\s*id|คลิกที่นี่|เว็บพนัน|คาสิโน)/i;
  if (spamPattern.test(cleanStem)) return false;

  if (!Array.isArray(q.options) || q.options.length < 4) return false;
  const normOpts = q.options.slice(0, 4).map((o) =>
    String(o || "")
      .replace(/^[กขคงABCD1-4][.)]\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
  if (normOpts.some((o) => o.length === 0)) return false;
  if (new Set(normOpts).size < 3) return false;

  if (
    typeof q.confidenceScore === "number" &&
    q.confidenceScore > 0 &&
    q.confidenceScore < 65
  ) {
    return false;
  }

  return true;
}

function mergeSharedQuestions(
  existingList: unknown[],
  incomingList: unknown[],
  deletedIdsSet: Set<string>
): unknown[] {
  const map = new Map<string, Record<string, unknown>>();

  const upsert = (rawItem: unknown) => {
    if (!isAuthenticValidQuestion(rawItem)) return;
    const item = rawItem as Record<string, unknown>;
    const idStr = String(item.id || "");
    if (idStr && deletedIdsSet.has(idStr)) return;

    const fp = getQuestionFingerprintServer(item);
    if (!fp) return;

    const prev = map.get(fp);
    if (!prev) {
      map.set(fp, item);
      return;
    }

    const prevExp = typeof prev.explanation === "string" ? prev.explanation : "";
    const nextExp = typeof item.explanation === "string" ? item.explanation : "";

    map.set(fp, {
      ...prev,
      ...item,
      id: prev.id || item.id,
      majorSubject: item.majorSubject || prev.majorSubject,
      explanation: nextExp.length >= prevExp.length ? nextExp : prevExp,
      lawReference: item.lawReference || prev.lawReference,
      keyTakeaway: item.keyTakeaway || prev.keyTakeaway,
    });
  };

  for (const q of existingList || []) upsert(q);
  for (const q of incomingList || []) upsert(q);

  return Array.from(map.values());
}

function mergeQuestionComments(
  existingMap: Record<string, CommentPayloadItem[]> = {},
  incomingMap: Record<string, CommentPayloadItem[]> = {},
  isAdmin: boolean,
  replaceAllComments: boolean
): Record<string, CommentPayloadItem[]> {
  if (isAdmin && replaceAllComments) {
    return incomingMap || {};
  }

  const result: Record<string, CommentPayloadItem[]> = {};
  const allQuestionIds = new Set([
    ...Object.keys(existingMap || {}),
    ...Object.keys(incomingMap || {}),
  ]);

  for (const qId of Array.from(allQuestionIds)) {
    const existingArr = Array.isArray(existingMap[qId]) ? existingMap[qId] : [];
    const incomingArr = Array.isArray(incomingMap[qId]) ? incomingMap[qId] : [];
    const byId = new Map<string, CommentPayloadItem>();

    for (const c of existingArr) {
      if (c && c.id && typeof c.message === "string" && c.message.trim()) {
        byId.set(c.id, c);
      }
    }

    for (const c of incomingArr) {
      if (!c || !c.id || typeof c.message !== "string" || !c.message.trim()) {
        continue;
      }
      const prev = byId.get(c.id);
      if (!prev) {
        // อนุญาตให้ผู้ใช้ทุกคนเพิ่มคอมเมนต์ใหม่ได้
        byId.set(c.id, {
          ...c,
          message: c.message.trim().slice(0, 1000),
          status: c.type === "report_wrong" ? c.status || "pending" : undefined,
        });
      } else if (isAdmin) {
        // เฉพาะแอดมินที่อัปเดตสถานะคอมเมนต์เดิมได้ (เช่น กดยืนยันตรวจสอบแล้ว)
        byId.set(c.id, {
          ...prev,
          ...c,
        });
      }
    }

    const mergedList = Array.from(byId.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    if (mergedList.length > 0) {
      result[qId] = mergedList;
    }
  }

  return result;
}

// ============================================================================
// Cloudflare D1 REST API Driver
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

async function readRecordFromD1(
  accountId: string,
  apiToken: string,
  databaseId: string,
  recordId: string
): Promise<CloudPayload | null> {
  const rows = await queryCloudflareD1(
    accountId,
    apiToken,
    databaseId,
    `SELECT payload FROM kru_exam_cloud_state WHERE id = ? LIMIT 1;`,
    [recordId]
  );
  if (!rows || rows.length === 0 || !rows[0]?.payload) {
    return null;
  }
  try {
    return JSON.parse(rows[0].payload as string) as CloudPayload;
  } catch {
    return null;
  }
}

async function writeRecordToD1(
  accountId: string,
  apiToken: string,
  databaseId: string,
  recordId: string,
  payload: CloudPayload
): Promise<void> {
  const nowIso = new Date().toISOString();
  const serialized = JSON.stringify({ ...payload, updatedAt: nowIso });
  await queryCloudflareD1(
    accountId,
    apiToken,
    databaseId,
    `INSERT INTO kru_exam_cloud_state (id, payload, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at;`,
    [recordId, serialized, nowIso]
  );
}

async function readHybridStateFromD1(
  accountId: string,
  apiToken: string,
  userId: string,
  explicitDbId?: string
): Promise<{
  payload: CloudPayload;
  databaseId: string;
  hasExistingRecord: boolean;
}> {
  const databaseId = await resolveCloudflareD1DatabaseId(
    accountId,
    apiToken,
    explicitDbId
  );
  await ensureD1Table(accountId, apiToken, databaseId);

  let sharedRecord = await readRecordFromD1(
    accountId,
    apiToken,
    databaseId,
    SHARED_BANK_RECORD_ID
  );

  if (!sharedRecord) {
    const legacyMain = await readRecordFromD1(
      accountId,
      apiToken,
      databaseId,
      "main"
    );
    if (legacyMain && Array.isArray(legacyMain.customQuestions)) {
      const cleanedShared = mergeSharedQuestions(
        [],
        legacyMain.customQuestions,
        new Set(legacyMain.deletedIds || [])
      );
      sharedRecord = {
        ...EMPTY_PAYLOAD,
        updatedAt: new Date().toISOString(),
        customQuestions: cleanedShared,
        editedSeeds: legacyMain.editedSeeds || {},
        deletedIds: legacyMain.deletedIds || [],
        questionComments: legacyMain.questionComments || {},
      };
      await writeRecordToD1(
        accountId,
        apiToken,
        databaseId,
        SHARED_BANK_RECORD_ID,
        sharedRecord
      );
    } else {
      sharedRecord = EMPTY_PAYLOAD;
    }
  }

  const userRecord = await readRecordFromD1(
    accountId,
    apiToken,
    databaseId,
    userId
  );

  const deletedSet = new Set(sharedRecord.deletedIds || []);
  const activeSharedCustom = (sharedRecord.customQuestions || []).filter((q) => {
    if (!q || typeof q !== "object") return false;
    const id = String((q as { id?: unknown }).id || "");
    return !deletedSet.has(id);
  });

  const combinedPayload: CloudPayload = {
    version: 1,
    updatedAt: userRecord?.updatedAt || sharedRecord.updatedAt,
    historyClearedAt: userRecord?.historyClearedAt || "",
    customQuestions: activeSharedCustom,
    editedSeeds: sharedRecord.editedSeeds || {},
    deletedIds: sharedRecord.deletedIds || [],
    questionComments: sharedRecord.questionComments || {},
    attempts: userRecord?.attempts || [],
    mistakes: userRecord?.mistakes || {},
  };

  return {
    payload: combinedPayload,
    databaseId,
    hasExistingRecord: userRecord !== null,
  };
}

async function writeHybridStateToD1(
  accountId: string,
  apiToken: string,
  userId: string,
  isAdmin: boolean,
  incoming: CloudPayload,
  explicitDbId?: string
): Promise<{
  databaseId: string;
  sharedQuestionCount: number;
  sharedPayload: CloudPayload;
}> {
  const databaseId = await resolveCloudflareD1DatabaseId(
    accountId,
    apiToken,
    explicitDbId
  );
  await ensureD1Table(accountId, apiToken, databaseId);

  const existingShared =
    (await readRecordFromD1(
      accountId,
      apiToken,
      databaseId,
      SHARED_BANK_RECORD_ID
    )) || EMPTY_PAYLOAD;

  // 1. สิทธิ์การจัดการคลังข้อสอบกลาง (เฉพาะ Admin เท่านั้นที่เพิ่ม/แก้ไข/ลบข้อสอบได้)
  let nextDeletedIds = existingShared.deletedIds || [];
  let nextEditedSeeds = existingShared.editedSeeds || {};
  let nextCustomQuestions = existingShared.customQuestions || [];

  if (isAdmin) {
    const mergedDeletedSet = new Set<string>([
      ...(existingShared.deletedIds || []),
      ...(Array.isArray(incoming.deletedIds) ? incoming.deletedIds : []),
    ]);
    nextDeletedIds = Array.from(mergedDeletedSet);

    nextEditedSeeds = {
      ...(existingShared.editedSeeds || {}),
      ...(incoming.editedSeeds && typeof incoming.editedSeeds === "object"
        ? incoming.editedSeeds
        : {}),
    };

    if (incoming.adminAction === "replace_shared_bank") {
      // กรณีแอดมินกดแก้ไขหรือลบข้อสอบโดยตรง ให้ยึดตามรายการล่าสุดของแอดมิน
      nextCustomQuestions = mergeSharedQuestions(
        [],
        Array.isArray(incoming.customQuestions) ? incoming.customQuestions : [],
        mergedDeletedSet
      );
    } else {
      nextCustomQuestions = mergeSharedQuestions(
        existingShared.customQuestions || [],
        Array.isArray(incoming.customQuestions) ? incoming.customQuestions : [],
        mergedDeletedSet
      );
    }
  }

  // 2. สิทธิ์การคอมเมนต์ข้อสอบ (ผู้ใช้ทุกคนเพิ่มคอมเมนต์ได้, แอดมินลบหรือกดตรวจสอบได้)
  const nextComments = mergeQuestionComments(
    existingShared.questionComments || {},
    incoming.questionComments || {},
    isAdmin,
    incoming.adminAction === "replace_shared_bank"
  );

  const updatedSharedPayload: CloudPayload = {
    ...EMPTY_PAYLOAD,
    version: 1,
    updatedAt: new Date().toISOString(),
    customQuestions: nextCustomQuestions,
    editedSeeds: nextEditedSeeds,
    deletedIds: nextDeletedIds,
    questionComments: nextComments,
  };

  await writeRecordToD1(
    accountId,
    apiToken,
    databaseId,
    SHARED_BANK_RECORD_ID,
    updatedSharedPayload
  );

  // 3. บันทึกเฉพาะประวัติการสอบและจุดผิดของ User แต่ละคนแยกตามรหัสผู้สอบ
  const userPersonalPayload: CloudPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    historyClearedAt: incoming.historyClearedAt || "",
    customQuestions: [],
    editedSeeds: {},
    deletedIds: [],
    attempts: Array.isArray(incoming.attempts) ? incoming.attempts : [],
    mistakes:
      incoming.mistakes && typeof incoming.mistakes === "object"
        ? incoming.mistakes
        : {},
  };

  await writeRecordToD1(
    accountId,
    apiToken,
    databaseId,
    userId,
    userPersonalPayload
  );

  return {
    databaseId,
    sharedQuestionCount: nextCustomQuestions.length,
    sharedPayload: updatedSharedPayload,
  };
}

function getCredentials(req: NextRequest) {
  const {
    accountId: cfAccountId,
    apiToken: cfApiToken,
    databaseId: cfDbId,
  } = getD1Credentials(req);

  const userId = sanitizeUserId(
    req.headers.get("x-kru-user-id") || req.nextUrl.searchParams.get("userId")
  );
  const isAdmin = isRequestFromAdmin(req, userId);

  return { cfAccountId, cfApiToken, cfDbId, userId, isAdmin };
}

export async function GET(req: NextRequest) {
  try {
    const { cfAccountId, cfApiToken, cfDbId, userId, isAdmin } =
      getCredentials(req);

    if (cfAccountId && cfApiToken) {
      const { payload, databaseId, hasExistingRecord } =
        await readHybridStateFromD1(cfAccountId, cfApiToken, userId, cfDbId);
      return NextResponse.json({
        ok: true,
        provider: "cloudflare-d1",
        databaseId,
        userId,
        isAdmin,
        hasExistingRecord,
        data: payload,
      });
    }

    return NextResponse.json({
      ok: false,
      provider: "local-only",
      userId,
      isAdmin,
      hasExistingRecord: false,
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
    const { cfAccountId, cfApiToken, cfDbId, userId, isAdmin } =
      getCredentials(req);
    const body = (await req.json()) as CloudPayload;

    if (cfAccountId && cfApiToken) {
      const { databaseId, sharedQuestionCount, sharedPayload } =
        await writeHybridStateToD1(
          cfAccountId,
          cfApiToken,
          userId,
          isAdmin,
          body,
          cfDbId
        );
      return NextResponse.json({
        ok: true,
        provider: "cloudflare-d1",
        databaseId,
        userId,
        isAdmin,
        sharedQuestionCount,
        sharedData: sharedPayload,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        ok: false,
        provider: "local-only",
        error: "ยังไม่ได้ตั้งค่า Cloudflare D1 บนเซิร์ฟเวอร์",
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
