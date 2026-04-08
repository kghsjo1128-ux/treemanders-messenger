import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import chokidar from "chokidar";

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "트리맨더스.html");
const DEBOUNCE_MS = 2500;

let timer = null;
let deploying = false;
let pending = false;

async function gitStagedHasChanges() {
  try {
    await execFileAsync("git", ["diff", "--cached", "--quiet"], { cwd: __dirname });
    return false;
  } catch (e) {
    if (e && e.code === 1) return true;
    throw e;
  }
}

async function pushToGitHub() {
  const rel = "트리맨더스.html";
  try {
    await execFileAsync("git", ["add", "--", rel], { cwd: __dirname });
  } catch (e) {
    console.log("[Git] git add 실패:", e.message || e);
    return;
  }

  const hasStaged = await gitStagedHasChanges();
  if (!hasStaged) {
    console.log("[Git] 커밋할 변경 없음(이미 반영됨)");
    return;
  }

  const msg = `chore: 자동 저장·배포 ${new Date().toISOString()}`;
  try {
    await execFileAsync("git", ["commit", "-m", msg], { cwd: __dirname });
    console.log("[Git] 커밋 완료");
  } catch (e) {
    console.log("[Git] 커밋 실패:", e.message || e);
    return;
  }

  try {
    await execFileAsync("git", ["push", "origin", "HEAD"], { cwd: __dirname });
    console.log("[Git] GitHub push 완료");
  } catch (e) {
    console.log("[Git] push 실패(네트워크·인증 확인):", e.message || e);
    console.log("[Git] 로컬 배포는 계속 진행합니다.\n");
  }
}

function runDeploy() {
  if (deploying) {
    pending = true;
    return;
  }
  deploying = true;

  (async () => {
    await pushToGitHub();
    console.log("\n[" + new Date().toLocaleString("ko-KR") + "] firebase deploy --only hosting …");
    const p = spawn("npx", ["--yes", "firebase", "deploy", "--only", "hosting"], {
      stdio: "inherit",
      shell: true,
      cwd: __dirname,
    });
    p.on("close", (code) => {
      deploying = false;
      if (code === 0) console.log("[완료] Hosting 배포 성공\n");
      else console.log("[실패] exit code " + code + "\n");
      if (pending) {
        pending = false;
        scheduleDeploy();
      }
    });
  })().catch((err) => {
    deploying = false;
    console.error("[오류]", err);
  });
}

function scheduleDeploy() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    runDeploy();
  }, DEBOUNCE_MS);
}

chokidar
  .watch(target, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 } })
  .on("all", (ev) => {
    if (ev === "add" || ev === "change") {
      console.log("[감지] 트리맨더스.html 변경 → " + DEBOUNCE_MS / 1000 + "초 후 GitHub 저장 + 배포 예약");
      scheduleDeploy();
    }
  });

console.log("자동 저장·배포 감시 중: " + target);
console.log("종료: Ctrl+C  |  저장 후 " + DEBOUNCE_MS / 1000 + "초 뒤 Git 커밋·push → Hosting 배포됩니다.\n");
