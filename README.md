# Project Map Lab — open-source-test

> 실험 전용 프로토타입. 정식 Control Tower나 실시간 프로젝트 데이터베이스가 아닙니다.

## 두 가지 실험 화면

- **기존 11개 노드 데모:** https://jayjayjayyoon.github.io/open-source-test/
- **규모 확장 실험 V0.2:** https://jayjayjayyoon.github.io/open-source-test/scale-lab.html

규모 확장 실험에서는 **50·200·1,000개**의 *완전한 가상 데이터*를 생성합니다. `단계별 탐색`과 `전체 표시`를 같은 데이터 규모에서 전환해 가독성과 조작 반응을 직접 비교합니다. 1,000개 전체 표시는 브라우저에 부담이 될 수 있으므로 단계별 탐색을 기본값으로 사용하세요.

단계별 탐색: 전체(6개) → 분야 선택(10개) → 프로젝트 선택(해당 작업 추가). 전체 표시는 해당 규모의 모든 노드와 관계를 보여주는 부하 시험입니다. 어느 쪽이 편한지는 사용자가 직접 확인한 뒤 판단합니다.

## PC에서 실행

Node.js 설치 후 저장소 폴더에서:

```bash
npm install
npm run dev
```

기존 화면: `http://localhost:5173/`, 규모 실험: `http://localhost:5173/scale-lab.html`. 개발 서버를 종료하면 로컬 사이트도 중지됩니다.

## GitHub Pages 배포

`main`에 코드가 올라가면 `.github/workflows/deploy-pages.yml`이 테스트, 빌드, 배포를 수행합니다. Vite 빌드는 두 HTML 페이지 모두 `/open-source-test/` 경로에서 작동하도록 설정했습니다. [Actions 실행 결과](https://github.com/jayjayjayyoon/open-source-test/actions/workflows/deploy-pages.yml)에서 배포 성공 여부를 확인하세요.

저장소 소유자는 [Settings → Pages](https://github.com/jayjayjayyoon/open-source-test/settings/pages)에서 Source를 `GitHub Actions`로 설정해야 합니다. 공개 저장소와 공개 사이트에는 개인 자료, 인증 토큰, 비밀키를 넣지 마세요.

## 검증할 것

- 노드 드래그, 연결선, 확대·축소, 클릭 후 상세 정보 변경
- 50 / 200 / 1,000개 각각에서 전체 표시와 단계별 탐색 비교
- 전체 표시 시 텍스트가 읽히는지, 브라우저 반응이 괜찮은지 직접 확인
- 분야 → 프로젝트 → 작업으로 좁혀 보았을 때 원하는 정보를 찾기 쉬운지 확인
- 하단 체크리스트와 자유 메모로 결과를 정리하고, 필요하면 텍스트 복사

## 데이터 및 기능 경계

- 기존 데모 `src/data.js`는 이 채팅의 명시적인 의사결정만 샘플로 사용합니다.
- 규모 실험 `src/scaleData.js`는 실제 개인 자료가 아닌 결정적 가상 노드·관계를 생성합니다.
- Notion, GitHub API, 다른 대화나 개인 자료는 자동 수집·동기화하지 않습니다.
- 실제 기한이나 프로젝트 진행률을 만들어내지 않습니다.
- 체크 및 메모는 브라우저 메모리에서만 유지되며 새로고침하면 초기화됩니다. 다른 기기와도 공유되지 않습니다.
- 화면의 데이터 개수는 정확히 생성하지만 브라우저 성능이나 반응 속도를 보장하거나 실측 결과라고 주장하지 않습니다.

## 기술과 다음 단계

React, [@xyflow/react](https://github.com/xyflow/xyflow) (MIT), Vite, lucide-react를 사용합니다. 최초 설치 및 GitHub Actions 빌드에는 인터넷 연결이 필요합니다.

규모별 사용성을 시험한 뒤 실제 Control Tower에서 전체 지도, 분야별 탐색, 프로젝트 상세를 어떻게 나눌지 결정합니다. 정식 저장소 생성 및 실제 자료 연동은 그다음입니다.
