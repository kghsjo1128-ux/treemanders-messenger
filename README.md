# 트리맨더스 (Treemanders)

**카카오톡 스타일의 사내 메신저** — Firebase Authentication · Cloud Firestore · Firebase Hosting으로 동작하는 단일 페이지 웹앱입니다.

| 항목 | 내용 |
|------|------|
| **라이브 사이트** | [company-chat-c7944.web.app](https://company-chat-c7944.web.app) |
| **진입 파일** | `트리맨더스.html` |
| **백엔드** | Firebase (Auth, Firestore, Hosting) |

## 이 저장소에 포함된 것

- `트리맨더스.html` — 메신저 UI·채팅·관리자·스케줄 등 전체 클라이언트
- `firestore.rules` — Firestore 보안 규칙
- `firebase.json` / `.firebaserc` — Hosting·Firestore 배포 설정
- `package.json` — 배포·감시 스크립트 (`npm run deploy`, `npm run watch:hosting`)

## 로컬에서 보기

1. 이 폴더를 클론하거나 내려받습니다.
2. Firebase 프로젝트와 연동된 설정이 `트리맨더스.html`에 들어 있어야 로그인·채팅이 동작합니다.
3. 브라우저에서 `트리맨더스.html`을 열거나, 정적 서버로 루트를 서빙해도 됩니다.

## 배포 (Firebase Hosting)

```bash
npm install
npm run deploy
```

(Firebase CLI 로그인 및 프로젝트 권한이 필요합니다.)

## 라이선스 / 비고

내부·팀용 프로젝트로 쓰기에 맞게 구성되어 있습니다. 공개 저장소에 올릴 때는 조직 정책에 맞게 비공개 저장소 사용을 권장합니다.
