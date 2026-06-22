# 🎨 PicChat (픽챗)

실시간 P2P 캔버스 공유와 채팅, 그리고 다양한 멀티플레이어 미니게임을 한 곳에서 즐길 수 있는 프리미엄 실시간 인터랙티브 웹 애플리케이션입니다.

👉 **실시간 데모:** [https://jssimonlee.github.io/picchat/](https://jssimonlee.github.io/picchat/)

---

## 🌟 주요 특징 (Key Features)

### 1. 실시간 그림판 공유 (P2P Shared Canvas)
* **초고속 동기화:** 점(Dot)이 생기는 문제를 완전히 방지하면서 선을 그리는 궤적 데이터를 실시간 스트리밍하여 지연 없는 캔버스 공유를 지원합니다.
* **다양한 그리기 도구:** 브러시 굵기, 색상, 투명도 조절 및 지우개 기능을 지원합니다.
* **캡처 기능:** 캔버스 이미지를 손쉽게 스크린샷으로 저장할 수 있습니다.
* **검은색 노트 스타일 가독성 보완:** 다크 모드 또는 검정색 계열 배경에서도 줄노트 가이드라인이 또렷하게 보이도록 디자인 시스템을 개선했습니다.

### 2. 실시간 멀티플레이어 미니게임 (Multiplayer Mini-games)
네트워크 레이어에서 방장(Host)과 참여자(Guest) 간의 상태 패킷 동기화를 통해 지연 시간이 최소화된 실시간 게임 환경을 제공합니다.
* **🧩 멀티 스도쿠 (Sudoku):**
  * 난이도 설정 (Easy / Medium / Hard / Expert)
  * 협동 턴제 모드 및 실시간 관전 가능한 스피드 레이스 경쟁 모드
  * 난이도별 자동 제한 시간 부여 (Easy 30초 ~ Expert 120초)
  * 혼자하기(Solo) 모드 지원 (턴 타이머 자동 비활성화)
* **⚫⚪ 오목 (Gomoku):** 실시간 대국 및 관전, 기권/취소 동기화
* **🟢⚫ 오셀로 (Othello):** 돌을 뒤집는 애니메이션 및 규칙 완벽 준수
* **💣 지뢰찾기 (Minesweeper):** 실시간 지뢰 현황판 갱신 및 깃발 동기화

### 3. 고도화된 실시간 네트워킹 (P2P Network Architecture)
* WebRTC 기반의 P2P 데이터 채널 연결 기술을 도입했습니다.
* **mDNS 및 방화벽 극복:** Metered의 Open Relay TURN/STUN 서버군을 내장하여 동일 와이파이망 혹은 서로 다른 사설 IP 대역(NAT) 환경에서도 완벽한 참여하기 및 P2P 연결 성공률을 보장합니다.
* 한글(IME) 입력 시 메시지가 중복 전송되는 버그(`isComposing` 상태 예외 처리)를 원천 차단했습니다.

### 4. 반응형 레이아웃 및 태블릿 최적화 (Tablet-Optimized UI)
* 디바이스 해상도에 맞게 캔버스 및 툴바 컴포넌트가 최적화됩니다.
* 태블릿 및 모바일 기기에서의 터치 탭 순서 오류(Double-toggling)를 방지하기 위해 CSS 터치 디바이스 미디어 쿼리(`pointer: coarse`)를 적용하여 드롭다운 메뉴 및 게임 기능의 오작동을 해결했습니다.
* 모바일 주소창 높이 변화에 맞춤 대응하는 `100dvh` 동적 뷰포트 단위를 전면 도입해 게임창이 중앙에 정확히 배치되고 잘리는 현상을 방지했습니다.

---

## 🛠 기술 스택 (Tech Stack)

* **Frontend:** Vanilla JS (ES6+), HTML5 Canvas, CSS3 Custom Properties (Variables)
* **P2P Networking:** WebRTC (PeerJS Engine), Metered Open Relay STUN/TURN Servers
* **Design Pattern:** Event-Driven Responsive Layout

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

### 2. 멀티플레이 참여 방법
1. 첫 번째 유저가 사이트에 접속하여 고유 닉네임과 색상을 설정한 뒤 **방 생성**을 진행합니다.
2. 생성된 고유의 **방 ID (Peer ID)**를 복사하여 친구에게 전달합니다.
3. 두 번째 유저가 **참여하기** 영역에 해당 방 ID를 붙여넣고 연결하면 실시간 그리기 및 게임을 즐길 수 있습니다.

---

## 📂 프로젝트 구조 (Project Structure)

```text
picchat/
├── index.html       # 메인 애플리케이션 화면 마크업
├── css/
│   └── style.css    # 글래스모피즘 UI 테마 및 디바이스 반응형 CSS 스타일시트
├── js/
│   ├── app.js       # 그리기 브러시 도구, 미니게임 비즈니스 로직 및 이벤트 바인딩
│   └── network.js   # PeerJS 커넥션 관리 및 TURN 서버 연동 P2P 네트워크 레이어
└── README.md        # 프로젝트 설명서
```

---

## 📜 라이선스 (License)

This project is licensed under the MIT License - see the LICENSE file for details.
