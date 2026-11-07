#!/usr/bin/env node
// Self-healing production server for local preview.
//
//   npm run serve:auto            (PORT=3001 by default)
//
// - Builds first if there is no production build in .next/.
// - Runs `next start` and restarts it when:
//     * a new build replaces .next/ (another tool ran `next build`),
//     * the server process exits or is killed,
//     * the page's CSS/JS assets stop loading (stale build in memory).
// - If another process already owns the port, it waits instead of killing it.
// Stop with Ctrl+C (the server is stopped with it).
import { spawn, spawnSync, execSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 3001);
const BUILD_ID_FILE = path.join(ROOT, ".next", "BUILD_ID");
const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const WATCH_MS = 3000;
const HEALTH_MS = 20000;

let child = null;
let servingBuild = null;
let busy = false; // a build/start/restart is in progress
let pendingBuild = null;
let healthFailures = 0;
let shuttingDown = false;

const log = (...args) =>
  console.log(`[serve-auto ${new Date().toLocaleTimeString("th-TH")}]`, ...args);

const readBuildId = () => {
  try {
    return fs.readFileSync(BUILD_ID_FILE, "utf8").trim() || null;
  } catch {
    return null;
  }
};

const portIsFree = () =>
  new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(PORT, "0.0.0.0");
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// `next start` spawns a child that holds the port, so kill the whole tree.
function killTree(proc) {
  if (!proc || proc.exitCode !== null) return;
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(-proc.pid, "SIGTERM");
    }
  } catch {
    try {
      proc.kill("SIGKILL");
    } catch {
      // already gone
    }
  }
}

async function stopServer() {
  const proc = child;
  child = null;
  if (!proc) return;
  killTree(proc);
  for (let i = 0; i < 20 && !(await portIsFree()); i++) await sleep(250);
}

function build() {
  log("ไม่พบ production build — กำลัง build (ใช้เวลาประมาณ 1 นาที)");
  const res = spawnSync(process.execPath, [NEXT_BIN, "build"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  return res.status === 0;
}

async function startServer() {
  if (shuttingDown) return;
  busy = true;
  try {
    if (!readBuildId() && !build()) {
      log("build ไม่สำเร็จ จะลองใหม่ใน 15 วินาที");
      setTimeout(startServer, 15000);
      return;
    }
    let warned = false;
    while (!(await portIsFree())) {
      if (!warned) {
        log(`port ${PORT} มีโปรแกรมอื่นใช้อยู่ — รอจนกว่าจะว่าง (ไม่ปิดของคนอื่น)`);
        warned = true;
      }
      await sleep(3000);
      if (shuttingDown) return;
    }
    servingBuild = readBuildId();
    healthFailures = 0;
    const proc = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
      cwd: ROOT,
      stdio: "inherit",
      detached: process.platform !== "win32",
    });
    child = proc;
    log(`เปิด server แล้ว http://localhost:${PORT} (build ${servingBuild})`);
    proc.on("exit", (code) => {
      if (child !== proc || shuttingDown) return; // we stopped it on purpose
      child = null;
      log(`server หยุดทำงาน (code ${code}) — เปิดใหม่ใน 3 วินาที`);
      setTimeout(startServer, 3000);
    });
  } finally {
    busy = false;
  }
}

async function restart(reason) {
  if (busy || shuttingDown) return;
  busy = true;
  log(`รีสตาร์ท: ${reason}`);
  await stopServer();
  busy = false;
  await startServer();
}

// A new BUILD_ID means someone rebuilt .next/. Restart once it stops changing.
setInterval(() => {
  if (busy || shuttingDown) return;
  const id = readBuildId();
  if (!id) return; // build in progress (.next wiped) — wait
  if (!child) return;
  if (id === servingBuild) {
    pendingBuild = null;
    return;
  }
  if (pendingBuild !== id) {
    pendingBuild = id; // first sighting; confirm on the next tick
    return;
  }
  pendingBuild = null;
  void restart(`พบ build ใหม่ (${id})`);
}, WATCH_MS);

// The page must load its CSS/JS; a stale in-memory build makes them 404.
setInterval(async () => {
  if (busy || shuttingDown || !child) return;
  try {
    const html = await (await fetch(`http://localhost:${PORT}/`)).text();
    const assets = [...html.matchAll(/\/_next\/static\/[^"?]+\.(?:css|js)/g)]
      .map((m) => m[0])
      .slice(0, 4);
    let ok = assets.length > 0;
    for (const a of assets) {
      const res = await fetch(`http://localhost:${PORT}${a}`);
      if (res.status !== 200) ok = false;
    }
    healthFailures = ok ? 0 : healthFailures + 1;
  } catch {
    healthFailures += 1;
  }
  if (healthFailures >= 2) void restart("ไฟล์ CSS/JS ของหน้าเว็บโหลดไม่ได้");
}, HEALTH_MS);

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log("กำลังปิด server");
  await stopServer();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
