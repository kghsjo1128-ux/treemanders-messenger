/**
 * Firebase Authentication에서 주 관리자 비밀번호를 123456으로 맞춥니다.
 *
 * 1) Firebase 콘솔 → 프로젝트 설정(톱니) → 서비스 계정 → 새 비공개 키 생성
 * 2) 받은 JSON을 이 폴더에 저장 (예: admin-sdk.json) — Git에 올리지 마세요
 * 3) 터미널에서 실행:
 *    node reset-admin-password.mjs admin-sdk.json
 *
 * 또는 환경 변수:
 *    set GOOGLE_APPLICATION_CREDENTIALS=C:\...\admin-sdk.json
 *    node reset-admin-password.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_EMAIL = "trmendous@treemanders.internal";
const NEW_PASSWORD = "123456";

function resolveKeyFile(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const candidates = [
    s,
    path.isAbsolute(s) ? null : path.join(process.cwd(), s),
    path.isAbsolute(s) ? null : path.join(__dirname, s),
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return path.resolve(p);
    } catch (_) {}
  }
  return null;
}

let abs = resolveKeyFile(process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (!abs) {
  const auto = fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter((d) => d.isFile() && /firebase-adminsdk.*\.json$/i.test(d.name))
    .map((d) => path.join(__dirname, d.name));
  if (auto.length === 1) abs = path.resolve(auto[0]);
}

if (!abs) {
  const tried = [process.argv[2], process.env.GOOGLE_APPLICATION_CREDENTIALS].filter(Boolean);
  console.error("서비스 계정 JSON 파일을 찾지 못했습니다.");
  if (tried.length) console.error("입력/환경변수:", tried.join(", "));
  console.error("\n1) Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → 「새 비공개 키 생성」");
  console.error("2) 받은 파일을 이 폴더에 두세요:");
  console.error("   ", __dirname);
  console.error("3) 파일 이름이 길면 그대로 두고 실행:");
  console.error('   node reset-admin-password.mjs "company-chat-c7944-firebase-adminsdk-xxxxx.json"');
  console.error("   (또는 다운로드 폴더 전체 경로를 인자로 넣어도 됩니다.)");
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(abs, "utf8"));
const projectId = serviceAccount.project_id;
if (!projectId) {
  console.error("JSON에 project_id가 없습니다.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId,
});

try {
  const u = await admin.auth().getUserByEmail(ADMIN_EMAIL);
  await admin.auth().updateUser(u.uid, { password: NEW_PASSWORD });
  console.log("완료: 기존 계정 비밀번호를", NEW_PASSWORD, "로 변경했습니다.");
  console.log("  이메일:", ADMIN_EMAIL);
  console.log("  로그인 아이디(앱): trmendous");
} catch (e) {
  if (e.code === "auth/user-not-found") {
    await admin.auth().createUser({
      email: ADMIN_EMAIL,
      password: NEW_PASSWORD,
      emailVerified: true,
      displayName: "관리자",
    });
    console.log("완료: 관리자 계정을 새로 만들었습니다.");
    console.log("  이메일:", ADMIN_EMAIL);
    console.log("  비밀번호:", NEW_PASSWORD);
    console.log("  로그인 아이디(앱): trmendous");
  } else {
    console.error("오류:", e.message || e);
    process.exit(1);
  }
}

process.exit(0);
