import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import chokidar from "chokidar";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "트리맨더스.html");
const DEBOUNCE_MS = 2500;

let timer = null;
let deploying = false;
let pending = false;

function runDeploy() {
  if (deploying) {
    pending = true;
    return;
  }
  deploying = true;
  console.log("\n[" + new Date().toLocaleString("ko-KR") + "] firebase deploy --only hosting …");
  const p = spawn("firebase", ["deploy", "--only", "hosting"], {
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
      console.log("[감지] 트리맨더스.html 변경 → " + DEBOUNCE_MS / 1000 + "초 후 배포 예약");
      scheduleDeploy();
    }
  });

console.log("자동 배포 감시 중: " + target);
console.log("종료: Ctrl+C  |  저장 후 " + DEBOUNCE_MS / 1000 + "초 뒤 배포됩니다.\n");
