# 🎨 PicChat (픽챗)

실시간 P2P 캔버스 공유와 채팅, 그리고 다양한 멀티플레이어 미니게임을 한 곳에서 즐길 수 있는 프리미엄 실시간 인터랙티브 웹 애플리케이션입니다.

👉 **실시간 데모:** [https://jssimonlee.github.io/picchat/](https://jssimonlee.github.io/picchat/)

---

## 🌟 주요 특징 (Key Features)

### 1. 실시간 그림판 공유 (P2P Shared Canvas)
* **초고속 동기화:** 점(Dot)이 생기는 문제를 완전히 방지하면서 선을 그리는 궤적 데이터를 실시간 스트리밍하여 지연 없는 캔버스 공유를 지원합니다.
* **다양한 그리기 도구:** 브러시 굵기, 색상, 투명도 조절 및 지우개 기능을 지원합니다.
* **배경 및 가이드 설정:** 다크 모드 또는 검정색 계열 배경에서도 가이드라인(모눈종이, 점선, 줄노트)이 또렷하게 보이도록 디자인 시스템을 개선했습니다.

### 2. 실시간 멀티플레이어 미니게임 (Multiplayer Mini-games)
네트워크 레이어에서 조율자(Coordinator)와 참여자 간의 상태 패킷 동기화를 통해 지연 시간이 최소화된 실시간 게임 환경을 제공합니다.
* **🧩 멀티 스도쿠 (Sudoku):** 난이도 설정, 협동 턴제 모드 및 실시간 관전 가능한 스피드 레이스 경쟁 모드, Solo 모드 지원.
* **⚫⚪ 오목 (Gomoku):** 실시간 대국 및 관전, 기권/취소 동기화.
* **🟢⚫ 오셀로 (Othello):** 돌을 뒤집는 애니메이션 및 규칙 완벽 준수.
* **💣 지뢰찾기 (Minesweeper):** 실시간 지뢰 현황판 갱신 및 깃발 동기화.

### 3. 하이브리드 P2P 분산 네트워크 & 자가 치유(Self-Healing) 방장 위임
* **방장 이탈 시 방 유지 (Host Handover):** 방장이 강제 종료(배터리 방전, 탭 닫기, 네트워크 단절 등)되거나 정상 퇴장하더라도, Cloudflare D1 DB 기반 분산 좌표 동기화를 통해 남은 게스트 중 가장 오래 참여한 사람이 **자동 방장 승격(Promoted to Host)**되어 방을 안전하게 유지합니다.
* **나갔던 유저 재입장 지원**: 기존 방장이나 참여자가 방을 나갔다가 언제든 동일한 방 코드로 재입장하여 기존 대화와 그림을 이어서 즐길 수 있습니다.
* **비동기 사전 가져오기 (Pre-fetching):** 로비 로딩 즉시 Cloudflare Worker에서 ICE 설정을 사전에 비동기로 가져와 캐싱함으로써, 방 접속 버튼 클릭 시의 지연 속도를 획기적으로 개선했습니다.

### 4. P2P 파일 공유 및 스마트 대역폭 제한
* **채팅 사이드바 내 파일 공유:** 대화창 내에서 직접 상대방 혹은 방의 모든 인원에게 이미지, 오디오, 문서 등 파일을 WebRTC 데이터 채널을 통해 P2P로 직접 전송할 수 있습니다.
* **스마트 용량 제한**: WebRTC 접속 통계를 분석하여, TURN 릴레이망(Metered.ca)을 거칠 때는 **최대 20MB 이하**, 직접 P2P 연결 성공 시에는 **최대 100MB 이하**로 업로드 제한을 지능적으로 가변 조절하여 트래픽 낭비를 완벽히 차단합니다.

### 5. 다중 사용자 순차 색상 지정 및 채팅 색상 통일
* **고유 컬러 배정**: 10가지 프리미엄 고대비 컬러(Red, Blue, Emerald, Amber, Violet, Pink, Cyan, Orange, Teal, Fuchsia)를 기기 접속 순서에 맞춰 중복 없이 순차적으로 배정합니다.
* **채팅 프로필 색상 통일**: 각 참여자가 갖는 고유 색상이 참여자 목록 점(Dot) 색상뿐만 아니라 채팅방 닉네임 글자 색상에도 완벽히 1:1로 매칭되어 직관성을 높였습니다.

### 6. 보안성 보완 (Security First)
* **임시 비밀번호 체계**: 깃허브 공개 리포지토리 파일 상에 Metered.ca의 중요 TURN 서버 API 키와 자격 증명을 노출하지 않도록, 모든 정보는 Cloudflare Workers 암호화 비밀값(Secrets)을 거쳐 클라이언트에 일회용 임시 자격 증명 형태로 서빙되도록 완벽히 보호되어 있습니다.

### 7. 반응형 레이아웃 및 태블릿 최적화 (Tablet-Optimized UI)
* 디바이스 해상도에 맞게 캔버스 및 툴바 컴포넌트가 최적화됩니다.
* 태블릿 및 모바일 기기에서의 터치 탭 순서 오류(Double-toggling) 방지 및 모바일 동적 뷰포트(`100dvh`) 단위를 적용해 창 잘림 현상을 예방했습니다.

---

## 🛠 기술 스택 (Tech Stack)

* **Frontend:** Vanilla JS (ES6+), HTML5 Canvas, CSS3 Custom Properties (Variables)
* **P2P Networking:** WebRTC (PeerJS Engine), Google/Metered Public STUN
* **Serverless Backend:** Cloudflare Workers (API Gateway & Proxy)
* **Database:** Cloudflare D1 SQL Database (SQLite engine)
* **Hosting:** GitHub Pages (Frontend static hosting)

---

## 🚀 빠른 시작 (Quick Start)

### 1. 로컬에서 실행하기
이 애플리케이션은 서버사이드 빌드 과정이 필요 없는 순수 정적 웹 애플리케이션입니다.

```bash
# 1. 저장소 클론
git clone https://github.com/jssimonlee/picchat.git

# 2. 프로젝트 폴더로 이동
cd picchat

# 3. 로컬 서버 실행 (예: VS Code Live Server 또는 Python 심플 서버)
python3 -m http.server 8000
```
브라우저를 열고 `http://localhost:8000`에 접속하세요.

### 2. 백엔드 배포하기 (Cloudflare Workers + D1)
만약 나만의 독립 서버 및 DB 환경을 구축하려면 다음 단계를 진행합니다.

```bash
# 1. 워커 폴더로 이동
cd cloudflare-worker

# 2. 로컬 Cloudflare CLI 로그인 및 DB 생성
npx wrangler d1 create mydb

# 3. SQL 스키마 실행 (테이블 생성)
npx wrangler d1 execute mydb --remote --file=schema.sql

# 4. 워커 배포
npx wrangler deploy
```

---

## 📂 프로젝트 구조 (Project Structure)

```text
picchat/
├── index.html               # 메인 애플리케이션 화면 마크업
├── css/
│   └── style.css            # 글래스모피즘 UI 테마 및 디바이스 반응형 CSS 스타일시트
├── js/
│   ├── app.js               # 브러시 도구, 미니게임 비즈니스 로직 및 이벤트 바인딩
│   └── network.js           # Cloudflare Worker 연동 및 P2P 자가치유 네트워킹 레이어
├── cloudflare-worker/       # Cloudflare Workers 백엔드 서버 소스
│   ├── src/index.js         # API 라우터 (TURN 프록시 및 D1 룸 코디네이터 API)
│   ├── wrangler.toml        # 배포 및 D1 DB 바인딩 설정 파일
│   └── schema.sql           # 데이터베이스 테이블 구조 정의 SQL 파일
└── README.md                # 프로젝트 설명서
```

---

## 📜 라이선스 (License)

This project is licensed under the MIT License - see the LICENSE file for details.
