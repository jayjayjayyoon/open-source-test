# Project Map Lab — open-source-test

> **실험 전용 프로토타입.** 정식 Control Tower나 실시간 프로젝트 데이터베이스가 아닙니다.

현재 채팅에서 합의한 정보만 샘플 데이터로 사용하여 [React Flow](https://reactflow.dev/) 기반 인터랙티브 그래프를 시험합니다.

## PC에서 실행

Node.js 설치 후 저장소 폴더에서:

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소(일반적으로 `http://localhost:5173/`)를 브라우저에서 엽니다. 개발 서버를 종료하면 로컬 사이트도 중지됩니다.

## GitHub Pages에 배포

GitHub Actions 배포 설정은 `.github/workflows/deploy-pages.yml`에 포함되어 있습니다. Vite의 프로덕션 빌드는 `/open-source-test/` 경로를 사용하고, 로컬 개발은 `/`를 사용합니다.

**저장소 소유자가 GitHub 웹 화면에서 최초 1회 활성화해야 합니다.**

1. [Settings → Pages](https://github.com/jayjayjayyoon/open-source-test/settings/pages)로 이동합니다.
2. `Build and deployment` 아래 `Source`에서 `GitHub Actions`를 선택합니다.
3. [Actions → Deploy Project Map Lab to GitHub Pages](https://github.com/jayjayjayyoon/open-source-test/actions/workflows/deploy-pages.yml)에서 기존 실패 실행의 `Re-run all jobs` 또는 `Run workflow`를 사용합니다.
4. 실행이 성공하면 예상 주소 `https://jayjayjayyoon.github.io/open-source-test/`에서 확인합니다. **배포 성공 전에는 주소가 활성화되었다고 가정하지 마세요.**

코드가 `main`에 반영되면 빌드·검증·배포가 자동 실행됩니다. 배포된 사이트는 집 PC 전원이 꺼져 있어도 접속할 수 있습니다. 공개 저장소와 공개 사이트에는 개인 자료, 인증 토큰, 비밀키를 넣지 마세요.

## 직접 시험할 기능

- 원형 노드 드래그, 연결선, 확대·축소, 미니맵
- 노드 클릭 → 상태/목적/다음 행동/출처 표시
- NOW / NEXT / WAITING / DONE 필터 및 텍스트 검색
- 검증 보드 체크리스트 (브라우저 메모리에서만 반영되며 새로고침 시 초기화)
- 모바일·데스크톱 화면 구성

## 데이터 범위

- `src/data.js`는 **현재 채팅에서 확인된 선택과 제안만** 수동 입력한 샘플입니다.
- Notion, GitHub API, 기존 대화, 사용자 개인 자료를 자동 수집하거나 동기화하지 않습니다.
- 실제 기한·완료율·프로젝트 진행 상황을 임의 생성하지 않습니다.
- `WAITING`은 데모 성공 후 검토를 의미합니다.
- 체크 표시는 다른 기기와 공유되지 않으며 서버나 GitHub에 저장되지 않습니다.

## 기술과 다음 단계

React, [@xyflow/react](https://github.com/xyflow/xyflow) (MIT), Vite, lucide-react를 사용합니다. 최초 설치 및 Actions 빌드에는 인터넷 연결이 필요합니다.

그래프/상세 패널/필터의 사용성을 검증하고, 만족스러울 경우에만 정식 Control Tower 저장소를 따로 만듭니다. 실제 자료 연동은 그다음에 권한, 기준 데이터, 동기화 규칙을 정하고 구현합니다.
