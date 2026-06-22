/* ========================================
   PicComm - Main Application Controller
   Wires Canvas + Network + UI together
   ======================================== */

(function () {
    'use strict';

    /* ---------- DOM Elements ---------- */

    // Lobby
    const $lobby = document.getElementById('lobby');
    const $studio = document.getElementById('studio');
    const $nickname = document.getElementById('nickname');
    const $btnCreateRoom = document.getElementById('btnCreateRoom');
    const $btnJoinRoom = document.getElementById('btnJoinRoom');
    const $joinCode = document.getElementById('joinCode');
    const $roomCreated = document.getElementById('roomCreated');
    const $roomCode = document.getElementById('roomCode');
    const $btnCopyCode = document.getElementById('btnCopyCode');
    const $lobbyStatus = document.getElementById('lobbyStatus');
    const $btnEnterSolo = document.getElementById('btnEnterSolo');

    // Studio
    const $mainCanvas = document.getElementById('mainCanvas');
    const $tempCanvas = document.getElementById('tempCanvas');
    const $textInput = document.getElementById('textInput');
    const $canvasContainer = document.getElementById('canvasContainer');
    const $studioRoomCode = document.getElementById('studioRoomCode');
    const $btnCopyCode2 = document.getElementById('btnCopyCode2');
    const $participants = document.getElementById('participants');
    const $btnLeaveRoom = document.getElementById('btnLeaveRoom');
    const $cursors = document.getElementById('cursors');

    // Tools
    const $colorPicker = document.getElementById('colorPicker');
    const $colorPresets = document.getElementById('colorPresets');
    const $bgColorPicker = document.getElementById('bgColorPicker');
    const $bgColorPresets = document.getElementById('bgColorPresets');
    const $sizeSlider = document.getElementById('sizeSlider');
    const $sizeValue = document.getElementById('sizeValue');
    const $sizePreviewDot = document.getElementById('sizePreviewDot');
    const $opacitySlider = document.getElementById('opacitySlider');
    const $opacityValue = document.getElementById('opacityValue');
    const $btnUndo = document.getElementById('btnUndo');
    const $btnRedo = document.getElementById('btnRedo');
    const $btnClear = document.getElementById('btnClear');
    const $btnDownload = document.getElementById('btnDownload');
    const $btnUploadImage = document.getElementById('btnUploadImage');
    const $imageInput = document.getElementById('imageInput');
    const $toast = document.getElementById('toast');

    // Sudoku Elements
    const $sudokuOverlay = document.getElementById('sudokuOverlay');
    const $btnSudokuClose = document.getElementById('btnSudokuClose');
    const $sudokuLobby = document.getElementById('sudokuLobby');
    const $sudokuLobbySetup = document.getElementById('sudokuLobbySetup');
    const $sudokuDifficulty = document.getElementById('sudokuDifficulty');
    const $btnSudokuPropose = document.getElementById('btnSudokuPropose');
    const $sudokuLobbyWaiting = document.getElementById('sudokuLobbyWaiting');
    const $sudokuLobbyWaitingTitle = document.getElementById('sudokuLobbyWaitingTitle');
    const $sudokuProposalList = document.getElementById('sudokuProposalList');
    const $btnSudokuCancel = document.getElementById('btnSudokuCancel');
    const $btnSudokuStart = document.getElementById('btnSudokuStart');
    const $sudokuLobbyInvite = document.getElementById('sudokuLobbyInvite');
    const $sudokuProposerName = document.getElementById('sudokuProposerName');
    const $sudokuProposalDifficulty = document.getElementById('sudokuProposalDifficulty');
    const $btnSudokuDecline = document.getElementById('btnSudokuDecline');
    const $btnSudokuAccept = document.getElementById('btnSudokuAccept');
    const $sudokuGame = document.getElementById('sudokuGame');
    const $sudokuGameDiff = document.getElementById('sudokuGameDiff');
    const $sudokuGameTimer = document.getElementById('sudokuGameTimer');
    const $sudokuHealthBars = document.getElementById('sudokuHealthBars');
    const $sudokuBoard = document.getElementById('piccomm-sudoku-board');
    const $sudokuTurnStatus = document.getElementById('sudokuTurnStatus');
    const $sudokuTurnTimerProgress = document.getElementById('sudokuTurnTimerProgress');
    const $sudokuLeaderboardList = document.getElementById('sudokuLeaderboardList');
    const $btnSudokuUndo = document.getElementById('btnSudokuUndo');
    const $btnSudokuErase = document.getElementById('btnSudokuErase');
    const $btnSudokuNotes = document.getElementById('btnSudokuNotes');
    const $btnSudokuQuit = document.getElementById('btnSudokuQuit');
    const $sudokuResult = document.getElementById('sudokuResult');
    const $sudokuResultKicker = document.getElementById('sudokuResultKicker');
    const $sudokuResultTitle = document.getElementById('sudokuResultTitle');
    const $sudokuResultMsg = document.getElementById('sudokuResultMsg');
    const $sudokuFinalLeaderboardList = document.getElementById('sudokuFinalLeaderboardList');
    const $btnSudokuResultClose = document.getElementById('btnSudokuResultClose');
    const $btnSudoku = document.getElementById('btnSudoku');
    const $btnSudokuSolo = document.getElementById('btnSudokuSolo');

    // Gomoku Elements
    const $gomokuOverlay = document.getElementById('gomokuOverlay');
    const $btnGomokuClose = document.getElementById('btnGomokuClose');
    const $gomokuLobby = document.getElementById('gomokuLobby');
    const $gomokuLobbySetup = document.getElementById('gomokuLobbySetup');
    const $btnGomokuPropose = document.getElementById('btnGomokuPropose');
    const $btnGomokuSolo = document.getElementById('btnGomokuSolo');
    const $gomokuLobbyWaiting = document.getElementById('gomokuLobbyWaiting');
    const $gomokuLobbyWaitingTitle = document.getElementById('gomokuLobbyWaitingTitle');
    const $gomokuProposalList = document.getElementById('gomokuProposalList');
    const $btnGomokuCancel = document.getElementById('btnGomokuCancel');
    const $btnGomokuStart = document.getElementById('btnGomokuStart');
    const $gomokuLobbyInvite = document.getElementById('gomokuLobbyInvite');
    const $gomokuProposerName = document.getElementById('gomokuProposerName');
    const $btnGomokuDecline = document.getElementById('btnGomokuDecline');
    const $btnGomokuAccept = document.getElementById('btnGomokuAccept');
    const $gomokuGame = document.getElementById('gomokuGame');
    const $gomokuGameStatus = document.getElementById('gomokuGameStatus');
    const $gomokuGameTimer = document.getElementById('gomokuGameTimer');
    const $gomokuCurrentTurnIcon = document.getElementById('gomokuCurrentTurnIcon');
    const $gomokuBoard = document.getElementById('piccomm-gomoku-board');
    const $gomokuTurnCard = document.getElementById('gomokuTurnCard');
    const $gomokuTurnStatus = document.getElementById('gomokuTurnStatus');
    const $gomokuTurnTimerProgress = document.getElementById('gomokuTurnTimerProgress');
    const $gomokuPlayersList = document.getElementById('gomokuPlayersList');
    const $btnGomokuUndo = document.getElementById('btnGomokuUndo');
    const $btnGomokuQuit = document.getElementById('btnGomokuQuit');
    const $gomokuResult = document.getElementById('gomokuResult');
    const $gomokuResultKicker = document.getElementById('gomokuResultKicker');
    const $gomokuResultTitle = document.getElementById('gomokuResultTitle');
    const $gomokuResultMsg = document.getElementById('gomokuResultMsg');
    const $gomokuResultStats = document.getElementById('gomokuResultStats');
    const $btnGomokuResultClose = document.getElementById('btnGomokuResultClose');
    const $btnGomoku = document.getElementById('btnGomoku');

    // Othello Elements
    const $othelloOverlay = document.getElementById('othelloOverlay');
    const $btnOthelloClose = document.getElementById('btnOthelloClose');
    const $othelloLobby = document.getElementById('othelloLobby');
    const $othelloLobbySetup = document.getElementById('othelloLobbySetup');
    const $btnOthelloPropose = document.getElementById('btnOthelloPropose');
    const $btnOthelloSolo = document.getElementById('btnOthelloSolo');
    const $othelloLobbyWaiting = document.getElementById('othelloLobbyWaiting');
    const $othelloLobbyWaitingTitle = document.getElementById('othelloLobbyWaitingTitle');
    const $othelloProposalList = document.getElementById('othelloProposalList');
    const $btnOthelloCancel = document.getElementById('btnOthelloCancel');
    const $btnOthelloStart = document.getElementById('btnOthelloStart');
    const $othelloLobbyInvite = document.getElementById('othelloLobbyInvite');
    const $othelloProposerName = document.getElementById('othelloProposerName');
    const $btnOthelloDecline = document.getElementById('btnOthelloDecline');
    const $btnOthelloAccept = document.getElementById('btnOthelloAccept');
    const $othelloGame = document.getElementById('othelloGame');
    const $othelloGameStatus = document.getElementById('othelloGameStatus');
    const $othelloGameTimer = document.getElementById('othelloGameTimer');
    const $othelloCurrentTurnIcon = document.getElementById('othelloCurrentTurnIcon');
    const $othelloBoard = document.getElementById('piccomm-othello-board');
    const $othelloBlackCount = document.getElementById('othelloBlackCount');
    const $othelloWhiteCount = document.getElementById('othelloWhiteCount');
    const $othelloTurnCard = document.getElementById('othelloTurnCard');
    const $othelloTurnStatus = document.getElementById('othelloTurnStatus');
    const $othelloTurnTimerProgress = document.getElementById('othelloTurnTimerProgress');
    const $othelloPlayersList = document.getElementById('othelloPlayersList');
    const $btnOthelloUndo = document.getElementById('btnOthelloUndo');
    const $btnOthelloQuit = document.getElementById('btnOthelloQuit');
    const $othelloResult = document.getElementById('othelloResult');
    const $othelloResultKicker = document.getElementById('othelloResultKicker');
    const $othelloResultTitle = document.getElementById('othelloResultTitle');
    const $othelloResultMsg = document.getElementById('othelloResultMsg');
    const $othelloResultStats = document.getElementById('othelloResultStats');
    const $btnOthelloResultClose = document.getElementById('btnOthelloResultClose');
    const $btnOthello = document.getElementById('btnOthello');

    /* ---------- State ---------- */

    let canvas = null;
    let network = null;
    let cursorThrottle = 0;
    let isSelectingFile = false;
    let downloadTimeout = null;
    const remoteCursors = new Map(); // peerId -> DOM element
    const knownParticipants = new Map(); // peerId -> { nickname, color }

    // Sudoku State
    let sudokuState = {
        status: 'none', // 'none' | 'proposing' | 'playing' | 'finished'
        isSolo: false,
        difficulty: 'medium',
        board: [],
        initialBoard: [],
        solution: [],
        notes: [],
        selectedCell: null,
        mistakes: 0,
        maxMistakes: 3,
        isNotesMode: false,
        selectedNumber: null,
        proposerId: null,
        proposerNickname: null,
        participants: [],
        players: [],
        turnOrder: [],
        currentTurnIndex: 0,
        turnStartTime: 0,
        turnTimerInterval: null,
        turnTimeLimit: 30,
        secondsRemaining: 30,
        gameStartTime: 0,
        gameSecondsElapsed: 0,
        gameTimerInterval: null,
        history: []
    };

    // Gomoku State
    let gomokuState = {
        status: 'none', // 'none' | 'proposing' | 'playing' | 'finished'
        isSolo: false,
        board: [], // 15x15 grid, 0: empty, 1: black, 2: white
        lastMove: null, // { r, c }
        proposerId: null,
        proposerNickname: null,
        participants: [], // { peerId, nickname, color, accepted }
        players: [], // { peerId, nickname, color, role: 'black' | 'white' }
        turnOrder: [], // [peerId1, peerId2]
        currentTurnIndex: 0,
        turnStartTime: 0,
        turnTimerInterval: null,
        turnTimeLimit: 30,
        secondsRemaining: 30,
        gameStartTime: 0,
        gameSecondsElapsed: 0,
        gameTimerInterval: null,
        history: [], // [{ r, c, val, peerId, role }]
        soloTurn: 'black' // 'black' | 'white' (solo mode)
    };

    // Othello State
    let othelloState = {
        status: 'none', // 'none' | 'proposing' | 'playing' | 'finished'
        isSolo: false,
        board: [], // 8x8 grid, 0: empty, 1: black, 2: white
        lastMove: null, // { r, c }
        proposerId: null,
        proposerNickname: null,
        participants: [], // { peerId, nickname, color, accepted }
        players: [], // { peerId, nickname, color, role: 'black' | 'white' }
        turnOrder: [], // [peerId1, peerId2]
        currentTurnIndex: 0,
        turnStartTime: 0,
        turnTimerInterval: null,
        turnTimeLimit: 30,
        secondsRemaining: 30,
        gameStartTime: 0,
        gameSecondsElapsed: 0,
        gameTimerInterval: null,
        history: [], // [{ boardState, turnIndex, soloTurn }] (saving board state snapshots is easiest for reversing flips!)
        soloTurn: 'black'
    };

    /* ---------- Initialize ---------- */

    function init() {
        setupLobbyEvents();
        setupPresenceTracking();
        // Auto-fill nickname from localStorage
        const savedNick = localStorage.getItem('piccomm-nickname');
        if (savedNick) $nickname.value = savedNick;

        // Auto-format join code
        $joinCode.addEventListener('input', (e) => {
            let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (v.length > 3) v = v.slice(0, 3) + '-' + v.slice(3, 6);
            e.target.value = v;
        });

        // Clean disconnect on tab close/reload
        window.addEventListener('beforeunload', () => {
            if (network) {
                network.disconnect();
            }
        });
    }

    /* ---------- Presence Focus/Blur Tracking ---------- */

    function setupPresenceTracking() {
        const $awayOverlay = document.getElementById('awayOverlay');
        const $btnResume = document.getElementById('btnResume');

        window.addEventListener('blur', () => {
            if (isSelectingFile) {
                if (downloadTimeout) {
                    clearTimeout(downloadTimeout);
                    downloadTimeout = null;
                }
                return;
            }
            if (network && network.myPeerId && !$studio.hidden) {
                $awayOverlay.hidden = false;
                network.sendPresence(true);
                const me = knownParticipants.get(network.myPeerId);
                if (me) {
                    me.isAway = true;
                    updateParticipantsUI();
                }
            }
        });

        window.addEventListener('focus', () => {
            // Reset the file selection flag with a short delay to allow blur events to resolve
            setTimeout(() => {
                isSelectingFile = false;
            }, 300);
        });

        // Set the flag when clicking the file input
        $imageInput.addEventListener('click', () => {
            isSelectingFile = true;
        });

        $btnResume.addEventListener('click', () => {
            $awayOverlay.hidden = true;
            if (network && network.myPeerId) {
                network.sendPresence(false);
                const me = knownParticipants.get(network.myPeerId);
                if (me) {
                    me.isAway = false;
                    updateParticipantsUI();
                }
            }
        });
    }

    function showCustomConfirm(message, title = '확인') {
        return new Promise((resolve) => {
            const $modal = document.getElementById('confirmModal');
            const $title = document.getElementById('confirmModalTitle');
            const $msg = document.getElementById('confirmModalMessage');
            const $btnOk = document.getElementById('btnConfirmOk');
            const $btnCancel = document.getElementById('btnConfirmCancel');

            $title.textContent = title;
            $msg.textContent = message;
            $modal.hidden = false;

            const cleanup = (value) => {
                $modal.hidden = true;
                $btnOk.removeEventListener('click', onOk);
                $btnCancel.removeEventListener('click', onCancel);
                resolve(value);
            };

            const onOk = () => cleanup(true);
            const onCancel = () => cleanup(false);

            $btnOk.addEventListener('click', onOk);
            $btnCancel.addEventListener('click', onCancel);
        });
    }

    /* ---------- Lobby Events ---------- */

    function setupLobbyEvents() {
        $btnCreateRoom.addEventListener('click', createRoom);
        $btnJoinRoom.addEventListener('click', joinRoom);
        $nickname.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') $btnCreateRoom.click();
        });
        $joinCode.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') $btnJoinRoom.click();
        });
        $btnEnterSolo.addEventListener('click', () => {
            if (network && network.roomCode) {
                enterStudio(network.roomCode);
            }
        });
    }

    function getNickname() {
        const nick = $nickname.value.trim() || '익명' + Math.floor(Math.random() * 100);
        localStorage.setItem('piccomm-nickname', nick);
        return nick;
    }

    async function createRoom() {
        const nick = getNickname();
        $btnCreateRoom.disabled = true;
        showLobbyStatus('방을 만드는 중...', 'info');

        try {
            setupNetwork(nick);
            const code = await network.createRoom(nick);
            $roomCode.textContent = code;
            $roomCreated.hidden = false;
            $btnCopyCode.addEventListener('click', () => copyRoomCode(code));
            showLobbyStatus('방이 생성되었습니다!', 'success');
        } catch (err) {
            $btnCreateRoom.disabled = false;
            showLobbyStatus('방 생성 실패: ' + err.message, 'error');
        }
    }

    async function joinRoom() {
        const nick = getNickname();
        const code = $joinCode.value.trim().toUpperCase();
        if (!code || code.length < 6) {
            showLobbyStatus('방 코드를 입력해주세요.', 'error');
            return;
        }
        $btnJoinRoom.disabled = true;
        showLobbyStatus('방에 참여하는 중...', 'info');

        try {
            setupNetwork(nick);
            await network.joinRoom(code, nick);
            enterStudio(code);
        } catch (err) {
            $btnJoinRoom.disabled = false;
        }
    }

    function showLobbyStatus(msg, type) {
        $lobbyStatus.textContent = msg;
        $lobbyStatus.className = 'status-message ' + type;
        $lobbyStatus.hidden = false;
    }

    function copyRoomCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('📋 방 코드가 복사되었습니다!');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = code;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('📋 방 코드가 복사되었습니다!');
        });
    }

    /* ---------- Network Setup ---------- */

    function setupNetwork(nickname) {
        network = new NetworkManager({
            onAction: (action) => {
                canvas.replayAction(action);
                updateModificationHandles();
            },
            onUndo: () => {
                canvas.undo();
                updateModificationHandles();
            },
            onRedo: () => {
                canvas.redo();
                updateModificationHandles();
            },
            onClear: () => {
                canvas.clearAll();
                updateModificationHandles();
                showToast('🗑️ 캔버스가 초기화되었습니다');
            },
            onBackground: async (dataUrl) => {
                await canvas.setBackgroundImage(dataUrl);
                showToast('🖼️ 배경 이미지가 변경되었습니다');
            },
            onBgColor: (color) => {
                canvas.setBackgroundColor(color);
                $bgColorPicker.value = color;
                updateActiveBgColorDot(color);
                $canvasContainer.style.backgroundColor = color;
                showToast('🎨 배경색이 변경되었습니다');
            },
            onUpdateAction: (action) => {
                canvas.updateAction(action);
                updateModificationHandles();
            },
            onDeleteAction: (id) => {
                canvas.deleteAction(id);
                updateModificationHandles();
            },
            onStateReceived: async (state) => {
                await canvas.loadState(state);
                const bg = canvas.backgroundColor;
                $bgColorPicker.value = bg;
                updateActiveBgColorDot(bg);
                $canvasContainer.style.backgroundColor = bg;
                updateModificationHandles();
                showToast('📥 캔버스 상태를 동기화했습니다');

                // Sync active Sudoku game if present
                if (state.sudokuState && state.sudokuState.status === 'playing') {
                    syncSudokuStateFromHost(state.sudokuState);
                }
                // Sync active Gomoku game if present
                if (state.gomokuState && state.gomokuState.status === 'playing') {
                    syncGomokuStateFromHost(state.gomokuState);
                }
                // Sync active Othello game if present
                if (state.othelloState && state.othelloState.status === 'playing') {
                    syncOthelloStateFromHost(state.othelloState);
                }
            },
            onPeerJoin: (peerId, peerNickname, color, isAway) => {
                knownParticipants.set(peerId, { nickname: peerNickname, color, isAway: isAway || false });
                updateParticipantsUI();
                showToast(`🟢 ${peerNickname}님이 참여했습니다`);

                // If host and this is the first peer, enter studio
                if (network.isHost && $lobby.classList.contains('active')) {
                    enterStudio(network.roomCode);
                }
            },
            onPresence: (peerId, isAway) => {
                const participant = knownParticipants.get(peerId);
                if (participant) {
                    participant.isAway = isAway;
                    updateParticipantsUI();
                }
            },
            onPeerLeave: (peerId, peerNickname) => {
                knownParticipants.delete(peerId);
                removeRemoteCursor(peerId);
                updateParticipantsUI();
                showToast(`🔴 ${peerNickname}님이 나갔습니다`);
                handleSudokuPeerLeave(peerId);
                handleGomokuPeerLeave(peerId);
                handleOthelloPeerLeave(peerId);
            },
            onCursorMove: (peerId, x, y, peerNickname, color) => {
                updateRemoteCursor(peerId, x, y, peerNickname, color);
            },
            onError: (msg) => {
                showLobbyStatus(msg, 'error');
                $btnCreateRoom.disabled = false;
                $btnJoinRoom.disabled = false;
            },
            onReady: () => {
                console.log('[App] Network ready');
            },
            onSudoku: (fromPeerId, payload) => {
                handleSudokuNetworkMessage(fromPeerId, payload);
            },
            onGomoku: (fromPeerId, payload) => {
                handleGomokuNetworkMessage(fromPeerId, payload);
            },
            onOthello: (fromPeerId, payload) => {
                handleOthelloNetworkMessage(fromPeerId, payload);
            },
            getCanvasState: () => {
                const state = canvas ? canvas.getState() : {};
                state.sudokuState = {
                    status: sudokuState.status,
                    difficulty: sudokuState.difficulty,
                    board: sudokuState.board,
                    initialBoard: sudokuState.initialBoard,
                    solution: sudokuState.solution,
                    mistakes: sudokuState.mistakes,
                    players: sudokuState.players,
                    turnOrder: sudokuState.turnOrder,
                    currentTurnIndex: sudokuState.currentTurnIndex,
                    elapsedSeconds: sudokuState.gameSecondsElapsed
                };
                state.gomokuState = {
                    status: gomokuState.status,
                    board: gomokuState.board,
                    lastMove: gomokuState.lastMove,
                    players: gomokuState.players,
                    turnOrder: gomokuState.turnOrder,
                    currentTurnIndex: gomokuState.currentTurnIndex,
                    elapsedSeconds: gomokuState.gameSecondsElapsed,
                    history: gomokuState.history
                };
                state.othelloState = {
                    status: othelloState.status,
                    board: othelloState.board,
                    lastMove: othelloState.lastMove,
                    players: othelloState.players,
                    turnOrder: othelloState.turnOrder,
                    currentTurnIndex: othelloState.currentTurnIndex,
                    elapsedSeconds: othelloState.gameSecondsElapsed,
                    history: othelloState.history
                };
                return state;
            }
        });
    }

    /* ---------- Enter Studio ---------- */

    function enterStudio(code) {
        // Switch screens
        $lobby.classList.remove('active');
        $lobby.hidden = true;
        $studio.hidden = false;
        $studio.classList.add('active');

        // Setup studio UI
        $studioRoomCode.textContent = code;
        $btnCopyCode2.addEventListener('click', () => copyRoomCode(code));

        // Initialize canvas
        canvas = new DrawingCanvas($mainCanvas, $tempCanvas, {
            textInputEl: $textInput,
            onAction: (action) => {
                network.sendAction(action);
                updateModificationHandles();
            },
            onCursorMove: (x, y) => {
                // Throttle cursor updates to ~30fps
                const now = Date.now();
                if (now - cursorThrottle > 33) {
                    cursorThrottle = now;
                    network.sendCursor(x, y);
                }
            }
        });

        // Resize canvas to fit
        canvas.resize();
        window.addEventListener('resize', () => {
            canvas.resize();
            updateModificationHandles();
        });

        // Setup initial background color UI state
        $canvasContainer.style.backgroundColor = canvas.backgroundColor;
        $bgColorPicker.value = canvas.backgroundColor;
        updateActiveBgColorDot(canvas.backgroundColor);

        // Setup tool events
        setupToolEvents();
        setupKeyboardShortcuts();
        setupClipboardPaste();

        // Add self to participants
        knownParticipants.set(network.myPeerId, {
            nickname: network.nickname + ' (나)',
            color: network.myColor,
            isAway: false
        });
        updateParticipantsUI();

        // Setup Sudoku events
        setupSudokuEvents();
        // Setup Gomoku events
        setupGomokuEvents();
        // Setup Othello events
        setupOthelloEvents();
    }

    /* ---------- Tool Events ---------- */

    function setupToolEvents() {
        // Tool buttons
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                canvas.setTool(btn.dataset.tool);

                // Update cursor style
                if (btn.dataset.tool === 'text') {
                    $tempCanvas.style.cursor = 'text';
                } else if (btn.dataset.tool === 'eraser') {
                    $tempCanvas.style.cursor = 'cell';
                } else {
                    $tempCanvas.style.cursor = 'crosshair';
                }
            });
        });

        // Color picker
        $colorPicker.addEventListener('input', (e) => {
            canvas.setColor(e.target.value);
            updateActiveColorDot(e.target.value);
        });

        // Color presets
        $colorPresets.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const color = dot.dataset.color;
                canvas.setColor(color);
                $colorPicker.value = color;
                updateActiveColorDot(color);
            });
        });

        // Background color picker
        $bgColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            canvas.setBackgroundColor(color);
            updateActiveBgColorDot(color);
            $canvasContainer.style.backgroundColor = color;
            network.sendBgColor(color);
        });

        // Background color presets
        $bgColorPresets.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const color = dot.dataset.color;
                canvas.setBackgroundColor(color);
                $bgColorPicker.value = color;
                updateActiveBgColorDot(color);
                $canvasContainer.style.backgroundColor = color;
                network.sendBgColor(color);
            });
        });

        // Size slider
        $sizeSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            canvas.setSize(size);
            $sizeValue.textContent = size;
            $sizePreviewDot.style.width = Math.min(size, 28) + 'px';
            $sizePreviewDot.style.height = Math.min(size, 28) + 'px';
        });

        // Opacity slider
        $opacitySlider.addEventListener('input', (e) => {
            const opacity = parseInt(e.target.value) / 100;
            canvas.setOpacity(opacity);
            $opacityValue.textContent = e.target.value + '%';
        });

        // Undo/Redo
        $btnUndo.addEventListener('click', () => {
            canvas.undo();
            network.sendUndo();
        });
        $btnRedo.addEventListener('click', () => {
            canvas.redo();
            network.sendRedo();
        });

        // Clear
        $btnClear.addEventListener('click', async () => {
            if (await showCustomConfirm('캔버스를 전체 지우시겠습니까?')) {
                canvas.clearAll();
                network.sendClear();
                showToast('🗑️ 캔버스가 초기화되었습니다');
            }
        });

        // Download
        $btnDownload.addEventListener('click', () => {
            isSelectingFile = true;
            if (downloadTimeout) clearTimeout(downloadTimeout);

            const dataUrl = canvas.exportImage();
            const link = document.createElement('a');
            link.download = `piccomm-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            showToast('💾 이미지가 다운로드되었습니다');

            // Clear flag after 2 seconds as fallback for silent downloads
            downloadTimeout = setTimeout(() => {
                isSelectingFile = false;
                downloadTimeout = null;
            }, 2000);
        });

        // Image Upload
        $btnUploadImage.addEventListener('click', () => $imageInput.click());
        $imageInput.addEventListener('change', handleImageUpload);

        // Leave room
        $btnLeaveRoom.addEventListener('click', async () => {
            if (await showCustomConfirm('방을 나가시겠습니까?')) {
                leaveRoom();
            }
        });
    }

    function updateActiveColorDot(color) {
        $colorPresets.querySelectorAll('.color-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.color === color);
        });
    }

    function updateActiveBgColorDot(color) {
        $bgColorPresets.querySelectorAll('.color-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.color === color);
        });
    }

    /* ---------- Image Upload ---------- */

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('⚠️ 이미지 크기는 5MB 이하만 가능합니다');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const dataUrl = evt.target.result;

            // Resize image if too large
            const resized = await resizeImageDataUrl(dataUrl, 1920, 1080);

            startImagePlacer(resized);
        };
        reader.readAsDataURL(file);
        // Reset input so the same file can be selected again
        e.target.value = '';
    }

    function resizeImageDataUrl(dataUrl, maxW, maxH) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;

                if (w <= maxW && h <= maxH) {
                    resolve(dataUrl);
                    return;
                }

                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);

                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(c.toDataURL('image/jpeg', 0.85));
            };
            img.src = dataUrl;
        });
    }

    /* ---------- Image Placement Layer ---------- */

    function startImagePlacer(dataUrl) {
        // Remove any existing placer
        const existing = document.getElementById('imagePlacer');
        if (existing) existing.remove();

        // Create the placer container
        const $placer = document.createElement('div');
        $placer.id = 'imagePlacer';
        $placer.className = 'image-placer';

        // Add the image
        const $img = document.createElement('img');
        $img.src = dataUrl;
        $img.className = 'placer-img';
        $placer.appendChild($img);

        // Add handles
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(h => {
            const $h = document.createElement('div');
            $h.className = `placer-handle ${h}`;
            $placer.appendChild($h);
        });

        // Add toolbar
        const $toolbar = document.createElement('div');
        $toolbar.className = 'placer-toolbar';
        
        const $btnApply = document.createElement('button');
        $btnApply.className = 'btn-placer btn-placer-apply';
        $btnApply.textContent = '적용';

        const $btnFit = document.createElement('button');
        $btnFit.className = 'btn-placer btn-placer-cancel';
        $btnFit.textContent = '전체화면';
        
        const $btnCancel = document.createElement('button');
        $btnCancel.className = 'btn-placer btn-placer-cancel';
        $btnCancel.textContent = '취소';

        $toolbar.appendChild($btnApply);
        $toolbar.appendChild($btnFit);
        $toolbar.appendChild($btnCancel);
        $placer.appendChild($toolbar);

        // Position it in the center of $canvasContainer
        const containerRect = $canvasContainer.getBoundingClientRect();
        
        // Let's set a default size (say, 400px wide, height proportional)
        $placer.style.width = '400px';
        $placer.style.left = ((containerRect.width - 400) / 2) + 'px';
        $placer.style.top = ((containerRect.height - 300) / 2) + 'px'; // Default guess

        // Once the image is loaded, adjust height to maintain aspect ratio
        $img.onload = () => {
            const aspect = $img.naturalHeight / $img.naturalWidth;
            const h = 400 * aspect;
            $placer.style.height = h + 'px';
            $placer.style.top = ((containerRect.height - h) / 2) + 'px';
        };

        // Append to container
        $canvasContainer.appendChild($placer);

        // Dragging and resizing logic
        let isDragging = false;
        let isResizing = false;
        let activeHandle = null;
        let startX, startY;
        let startWidth, startHeight;
        let startLeft, startTop;
        let imgAspect = 1;

        $img.addEventListener('load', () => {
            imgAspect = $img.naturalHeight / $img.naturalWidth;
        });

        $placer.addEventListener('mousedown', (e) => {
            // Check if clicked handle
            if (e.target.classList.contains('placer-handle')) {
                isResizing = true;
                activeHandle = e.target.classList[1]; // nw, ne, sw, se
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseFloat(getComputedStyle($placer).width);
                startHeight = parseFloat(getComputedStyle($placer).height);
                startLeft = parseFloat(getComputedStyle($placer).left);
                startTop = parseFloat(getComputedStyle($placer).top);
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // Otherwise, dragging to move
            if (e.target === $placer || e.target === $img) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseFloat(getComputedStyle($placer).left);
                startTop = parseFloat(getComputedStyle($placer).top);
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Touch events support for mobile
        $placer.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (e.target.classList.contains('placer-handle')) {
                isResizing = true;
                activeHandle = e.target.classList[1];
                startX = touch.clientX;
                startY = touch.clientY;
                startWidth = parseFloat(getComputedStyle($placer).width);
                startHeight = parseFloat(getComputedStyle($placer).height);
                startLeft = parseFloat(getComputedStyle($placer).left);
                startTop = parseFloat(getComputedStyle($placer).top);
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            if (e.target === $placer || e.target === $img) {
                isDragging = true;
                startX = touch.clientX;
                startY = touch.clientY;
                startLeft = parseFloat(getComputedStyle($placer).left);
                startTop = parseFloat(getComputedStyle($placer).top);
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });

        const onMouseMove = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (!clientX || !clientY) return;

            if (isDragging) {
                const dx = clientX - startX;
                const dy = clientY - startY;
                $placer.style.left = (startLeft + dx) + 'px';
                $placer.style.top = (startTop + dy) + 'px';
            } else if (isResizing) {
                const dx = clientX - startX;
                const dy = clientY - startY;
                
                // Resizing maintaining aspect ratio
                let newWidth = startWidth;
                
                if (activeHandle === 'se') {
                    newWidth = startWidth + dx;
                } else if (activeHandle === 'sw') {
                    newWidth = startWidth - dx;
                    $placer.style.left = (startLeft + dx) + 'px';
                } else if (activeHandle === 'ne') {
                    newWidth = startWidth + dx;
                    const newHeight = newWidth * imgAspect;
                    $placer.style.top = (startTop + (startHeight - newHeight)) + 'px';
                } else if (activeHandle === 'nw') {
                    newWidth = startWidth - dx;
                    const newHeight = newWidth * imgAspect;
                    $placer.style.left = (startLeft + dx) + 'px';
                    $placer.style.top = (startTop + (startHeight - newHeight)) + 'px';
                }

                if (newWidth > 50) { // Min width 50px
                    $placer.style.width = newWidth + 'px';
                    $placer.style.height = (newWidth * imgAspect) + 'px';
                }
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            isResizing = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onMouseMove, { passive: false });
        window.addEventListener('touchend', onMouseUp);

        // Fit / Fullscreen button click
        $btnFit.addEventListener('click', () => {
            const rect = $tempCanvas.getBoundingClientRect();
            const containerRect = $canvasContainer.getBoundingClientRect();
            $placer.style.left = (rect.left - containerRect.left) + 'px';
            $placer.style.top = (rect.top - containerRect.top) + 'px';
            $placer.style.width = rect.width + 'px';
            $placer.style.height = rect.height + 'px';
        });

        // Apply button click
        $btnApply.addEventListener('click', () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);

            const rect = $tempCanvas.getBoundingClientRect(); // Canvas bounding box on screen
            const placerRect = $placer.getBoundingClientRect();

            // Convert to logical canvas coordinates (1920x1080)
            const scaleX = canvas.CANVAS_WIDTH / rect.width;
            const scaleY = canvas.CANVAS_HEIGHT / rect.height;

            const canvasX = (placerRect.left - rect.left) * scaleX;
            const canvasY = (placerRect.top - rect.top) * scaleY;
            const canvasW = placerRect.width * scaleX;
            const canvasH = placerRect.height * scaleY;

            // Create image action
            const action = {
                type: 'image',
                dataUrl: dataUrl,
                x: canvasX,
                y: canvasY,
                width: canvasW,
                height: canvasH
            };

            // Create and add image action via canvas (handles unique ID generation and network sync automatically)
            canvas.addImageAction(dataUrl, canvasX, canvasY, canvasW, canvasH);

            showToast('🖼️ 이미지가 캔버스에 배치되었습니다');
            $placer.remove();
        });

        // Cancel button click
        $btnCancel.addEventListener('click', () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);
            $placer.remove();
        });
    }

    /* ---------- Placed Image Modification Handles & Edit Menu ---------- */

    /* ---------- Placed Image & Text Modification Handles & Edit Menu ---------- */

    let activeEditMenu = null;

    function getTextSize(text, fontSize) {
        if (!canvas || !canvas.mainCtx) return { width: 100, height: 30 };
        const ctx = canvas.mainCtx;
        ctx.save();
        ctx.font = `${fontSize}px 'Inter', sans-serif`;
        ctx.textBaseline = 'top';
        const lines = (text || '').split('\n');
        let maxWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            if (metrics.width > maxWidth) {
                maxWidth = metrics.width;
            }
        });
        const lineHeight = fontSize * 1.3;
        const height = lines.length * lineHeight;
        ctx.restore();
        return { width: maxWidth, height };
    }

    function getContrastBgColor(hexColor) {
        if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
        let hex = hexColor.trim().replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) return '#ffffff';
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq > 128 ? '#1e1e2e' : '#ffffff';
    }

    function updateModificationHandles() {
        // If currently editing an action, do not update handles and do not clear the active edit menu.
        if (activeEditMenu) return;

        // Remove existing handles
        document.querySelectorAll('.image-handle-el').forEach(el => el.remove());

        if (!canvas || !network) return;

        // Loop through all image and text actions
        canvas.actions.forEach(action => {
            if (action.type !== 'image' && action.type !== 'text') return;

            // Compute screen position of top-right corner of action
            const rect = $tempCanvas.getBoundingClientRect();
            const containerRect = $canvasContainer.getBoundingClientRect();

            const scaleX = rect.width / canvas.CANVAS_WIDTH;
            const scaleY = rect.height / canvas.CANVAS_HEIGHT;

            let width, height;
            if (action.type === 'image') {
                width = action.width;
                height = action.height;
            } else {
                const size = getTextSize(action.text, action.fontSize || 24);
                width = size.width;
                height = size.height;
            }

            const right = action.x + width;
            const top = action.y;

            const screenX = right * scaleX + (rect.left - containerRect.left) + 6;
            const screenY = top * scaleY + (rect.top - containerRect.top) - 6;

            // Create handle element
            const $handle = document.createElement('div');
            $handle.className = 'image-handle-el';
            $handle.dataset.actionId = action.id;
            $handle.title = action.type === 'image' 
                ? '드래그: 이동 / 클릭: 크기·삭제 메뉴' 
                : '드래그: 이동 / 클릭: 크기·내용수정·삭제 메뉴';
            $handle.innerHTML = `<span class="image-handle-icon">✥</span>`;

            // Position it
            $handle.style.left = screenX + 'px';
            $handle.style.top = screenY + 'px';

            // Attach drag & click events
            let isDragging = false;
            let startX, startY;
            let startActionX, startActionY;
            let hasMoved = false;

            const handlePointerDown = (clientX, clientY) => {
                isDragging = true;
                hasMoved = false;
                startX = clientX;
                startY = clientY;
                startActionX = action.x;
                startActionY = action.y;

                // Close any open edit menus
                if (activeEditMenu) {
                    activeEditMenu.remove();
                    activeEditMenu = null;
                }

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
                window.addEventListener('touchmove', onMouseMove, { passive: false });
                window.addEventListener('touchend', onMouseUp);
            };

            $handle.addEventListener('mousedown', (e) => {
                handlePointerDown(e.clientX, e.clientY);
                e.preventDefault();
                e.stopPropagation();
            });

            $handle.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                handlePointerDown(touch.clientX, touch.clientY);
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });

            const onMouseMove = (e) => {
                if (!isDragging) return;
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                if (!clientX || !clientY) return;

                const dx = clientX - startX;
                const dy = clientY - startY;

                // If moved more than 3px, treat as drag
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    hasMoved = true;
                }

                if (hasMoved) {
                    // Convert screen movement to logical canvas coordinates
                    action.x = startActionX + (dx / scaleX);
                    action.y = startActionY + (dy / scaleY);

                    // Redraw canvas
                    canvas.redrawAll();

                    // Update handle positions dynamically
                    updateHandlePositions();
                }
            };

            const onMouseUp = () => {
                if (!isDragging) return;
                isDragging = false;

                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
                window.removeEventListener('touchmove', onMouseMove);
                window.removeEventListener('touchend', onMouseUp);

                if (hasMoved) {
                    // Send final position update to network
                    network.sendUpdateAction(action);
                } else {
                    // Click! Open edit menu
                    openEditMenu(action, $handle);
                }
            };

            $cursors.appendChild($handle);
        });
    }

    function updateHandlePositions() {
        if (!canvas) return;
        const rect = $tempCanvas.getBoundingClientRect();
        const containerRect = $canvasContainer.getBoundingClientRect();
        const scaleX = rect.width / canvas.CANVAS_WIDTH;
        const scaleY = rect.height / canvas.CANVAS_HEIGHT;

        document.querySelectorAll('.image-handle-el').forEach($handle => {
            const id = $handle.dataset.actionId;
            const action = canvas.actions.find(a => a.id === id);
            if (action) {
                let width;
                if (action.type === 'image') {
                    width = action.width;
                } else {
                    const size = getTextSize(action.text, action.fontSize || 24);
                    width = size.width;
                }
                const right = action.x + width;
                const top = action.y;
                const screenX = right * scaleX + (rect.left - containerRect.left) + 6;
                const screenY = top * scaleY + (rect.top - containerRect.top) - 6;
                $handle.style.left = screenX + 'px';
                $handle.style.top = screenY + 'px';
            }
        });
    }

    function openEditMenu(action, $handle) {
        // Clear active menu/placer if any
        if (activeEditMenu) activeEditMenu.remove();

        // 1. Hide the original action on canvas by setting canvas.editingActionId
        canvas.editingActionId = action.id;
        canvas.redrawAll();

        // 2. Hide all edit handle icons during editing
        document.querySelectorAll('.image-handle-el').forEach(el => el.style.display = 'none');

        // 3. Create the resizable/draggable editor wrapper
        const $editor = document.createElement('div');
        $editor.id = 'imageEditor';
        $editor.className = 'image-placer'; // Reuse styling of image-placer!

        // Map logical canvas coordinates to screen coordinates relative to container
        const rect = $tempCanvas.getBoundingClientRect();
        const containerRect = $canvasContainer.getBoundingClientRect();

        const scaleX = rect.width / canvas.CANVAS_WIDTH;
        const scaleY = rect.height / canvas.CANVAS_HEIGHT;

        // Calculate dimensions
        let actionWidth, actionHeight;
        let $textDiv = null;

        if (action.type === 'image') {
            actionWidth = action.width;
            actionHeight = action.height;

            // Add the image
            const $img = document.createElement('img');
            $img.src = action.dataUrl;
            $img.className = 'placer-img';
            $editor.appendChild($img);
        } else {
            // Text action
            const startTextSize = getTextSize(action.text, action.fontSize || 24);
            actionWidth = startTextSize.width;
            actionHeight = startTextSize.height;

            $textDiv = document.createElement('div');
            $textDiv.className = 'placer-text-preview';
            $textDiv.textContent = action.text;
            
            // Set styles to match canvas drawing
            $textDiv.style.position = 'absolute';
            $textDiv.style.left = '0';
            $textDiv.style.top = '0';
            $textDiv.style.width = '100%';
            $textDiv.style.height = '100%';
            $textDiv.style.boxSizing = 'border-box';
            $textDiv.style.color = action.color;
            $textDiv.style.fontSize = (action.fontSize || 24) * scaleY + 'px';
            $textDiv.style.fontFamily = "'Inter', sans-serif";
            $textDiv.style.lineHeight = '1.3';
            $textDiv.style.whiteSpace = 'pre-wrap';
            $textDiv.style.wordBreak = 'break-all';
            $textDiv.style.textAlign = 'left';
            $textDiv.style.userSelect = 'none';
            $textDiv.style.pointerEvents = 'none';
            
            $editor.appendChild($textDiv);
        }

        // Add resize handles
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(h => {
            const $h = document.createElement('div');
            $h.className = `placer-handle ${h}`;
            $editor.appendChild($h);
        });

        // Add toolbar with "적용" (Apply), "수정" (Edit Content if Text), "삭제" (Delete), "취소" (Cancel)
        const $toolbar = document.createElement('div');
        $toolbar.className = 'placer-toolbar';
        
        const $btnApply = document.createElement('button');
        $btnApply.className = 'btn-placer btn-placer-apply';
        $btnApply.textContent = '적용';

        let $btnEditText = null;
        if (action.type === 'text') {
            $btnEditText = document.createElement('button');
            $btnEditText.className = 'btn-placer btn-placer-edit';
            $btnEditText.textContent = '수정';
            $btnEditText.style.background = 'linear-gradient(135deg, #00d4ff 0%, #00bc8c 100%)';
            $btnEditText.style.color = '#fff';
            $btnEditText.style.borderRadius = '6px';
            $btnEditText.style.padding = '6px 12px';
            $btnEditText.style.fontSize = '12px';
            $btnEditText.style.fontWeight = '600';
            $btnEditText.style.cursor = 'pointer';
            $btnEditText.style.border = 'none';
        }

        const $btnDelete = document.createElement('button');
        $btnDelete.className = 'btn-placer btn-menu-delete'; // Red styling for delete
        $btnDelete.textContent = '삭제';
        $btnDelete.style.borderRadius = '6px';
        $btnDelete.style.padding = '6px 12px';
        $btnDelete.style.fontSize = '12px';
        $btnDelete.style.fontWeight = '600';
        $btnDelete.style.cursor = 'pointer';
        
        const $btnCancel = document.createElement('button');
        $btnCancel.className = 'btn-placer btn-placer-cancel';
        $btnCancel.textContent = '취소';

        $toolbar.appendChild($btnApply);
        if ($btnEditText) {
            $toolbar.appendChild($btnEditText);
        }
        $toolbar.appendChild($btnDelete);
        $toolbar.appendChild($btnCancel);
        $editor.appendChild($toolbar);

        let startWidth = actionWidth * scaleX;
        let startHeight = actionHeight * scaleY;
        const startLeft = action.x * scaleX + (rect.left - containerRect.left);
        const startTop = action.y * scaleY + (rect.top - containerRect.top);

        $editor.style.width = startWidth + 'px';
        $editor.style.height = startHeight + 'px';
        $editor.style.left = startLeft + 'px';
        $editor.style.top = startTop + 'px';

        $canvasContainer.appendChild($editor);
        activeEditMenu = $editor;

        // Interaction logic (dragging and resizing)
        let isDragging = false;
        let isResizing = false;
        let activeHandle = null;
        let startPointerX, startPointerY;
        let initW, initH, initL, initT;
        let imgAspect = actionHeight / actionWidth;

        const onPointerDown = (clientX, clientY, target) => {
            if (target.classList.contains('placer-handle')) {
                isResizing = true;
                activeHandle = target.classList[1];
                startPointerX = clientX;
                startPointerY = clientY;
                initW = parseFloat(getComputedStyle($editor).width);
                initH = parseFloat(getComputedStyle($editor).height);
                initL = parseFloat(getComputedStyle($editor).left);
                initT = parseFloat(getComputedStyle($editor).top);
                return true;
            }
            if (target === $editor || target === $textDiv || target.classList.contains('placer-img')) {
                isDragging = true;
                startPointerX = clientX;
                startPointerY = clientY;
                initL = parseFloat(getComputedStyle($editor).left);
                initT = parseFloat(getComputedStyle($editor).top);
                return true;
            }
            return false;
        };

        $editor.addEventListener('mousedown', (e) => {
            if (onPointerDown(e.clientX, e.clientY, e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        $editor.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (onPointerDown(touch.clientX, touch.clientY, e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false });

        const onMouseMove = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (!clientX || !clientY) return;

            if (isDragging) {
                const dx = clientX - startPointerX;
                const dy = clientY - startPointerY;
                $editor.style.left = (initL + dx) + 'px';
                $editor.style.top = (initT + dy) + 'px';
            } else if (isResizing) {
                const dx = clientX - startPointerX;
                const dy = clientY - startPointerY;

                let newWidth = initW;

                if (activeHandle === 'se') {
                    newWidth = initW + dx;
                } else if (activeHandle === 'sw') {
                    newWidth = initW - dx;
                    $editor.style.left = (initL + dx) + 'px';
                } else if (activeHandle === 'ne') {
                    newWidth = initW + dx;
                    const newHeight = newWidth * imgAspect;
                    $editor.style.top = (initT + (initH - newHeight)) + 'px';
                } else if (activeHandle === 'nw') {
                    newWidth = initW - dx;
                    const newHeight = newWidth * imgAspect;
                    $editor.style.left = (initL + dx) + 'px';
                    $editor.style.top = (initT + (initH - newHeight)) + 'px';
                }

                if (newWidth > 30) {
                    $editor.style.width = newWidth + 'px';
                    $editor.style.height = (newWidth * imgAspect) + 'px';

                    if (action.type === 'text') {
                        // Calculate new font size
                        const currentScale = newWidth / startWidth;
                        const newFontSize = (action.fontSize || 24) * currentScale;
                        $textDiv.style.fontSize = newFontSize * scaleY + 'px';
                    }
                }
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            isResizing = false;
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onMouseMove, { passive: false });
        window.addEventListener('touchend', onMouseUp);

        // Cleanup function for listeners
        const cleanupListeners = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onMouseMove);
            window.removeEventListener('touchend', onMouseUp);
            document.removeEventListener('mousedown', onOutsideClick);
        };

        // Apply changes function
        const applyChanges = () => {
            cleanupListeners();

            // Convert editor bounds back to logical canvas coordinates
            const currentRect = $tempCanvas.getBoundingClientRect();
            const editorRect = $editor.getBoundingClientRect();

            const cScaleX = canvas.CANVAS_WIDTH / currentRect.width;
            const cScaleY = canvas.CANVAS_HEIGHT / currentRect.height;

            action.x = (editorRect.left - currentRect.left) * cScaleX;
            action.y = (editorRect.top - currentRect.top) * cScaleY;

            if (action.type === 'text') {
                const currentScale = editorRect.width / startWidth;
                action.fontSize = Math.max(10, Math.round((action.fontSize || 24) * currentScale));
            } else {
                action.width = editorRect.width * cScaleX;
                action.height = editorRect.height * cScaleY;
            }

            // Commit change
            canvas.editingActionId = null;
            canvas.redrawAll();

            // Notify peers
            network.sendUpdateAction(action);

            // Re-render handles
            updateModificationHandles();
            $editor.remove();
            activeEditMenu = null;
        };

        // Apply click
        $btnApply.addEventListener('click', applyChanges);

        // Delete click
        $btnDelete.addEventListener('click', async () => {
            const confirmMsg = action.type === 'text' ? '이 텍스트를 삭제하시겠습니까?' : '이 이미지를 삭제하시겠습니까?';
            if (await showCustomConfirm(confirmMsg)) {
                cleanupListeners();
                canvas.editingActionId = null;
                canvas.deleteAction(action.id);
                network.sendDeleteAction(action.id);
                
                updateModificationHandles();
                $editor.remove();
                activeEditMenu = null;
            }
        });

        // Cancel click
        $btnCancel.addEventListener('click', () => {
            cleanupListeners();
            canvas.editingActionId = null;
            canvas.redrawAll();

            updateModificationHandles();
            $editor.remove();
            activeEditMenu = null;
        });

        // Handle clicking outside to apply changes automatically
        const onOutsideClick = (e) => {
            if (!$editor.contains(e.target) && !e.target.closest('.inline-text-editor')) {
                applyChanges();
            }
        };

        setTimeout(() => {
            document.addEventListener('mousedown', onOutsideClick);
        }, 50);

        // Text editing feature
        if ($btnEditText) {
            $btnEditText.addEventListener('click', (e) => {
                e.stopPropagation();
                if ($editor.querySelector('.inline-text-editor')) return;

                const $textarea = document.createElement('textarea');
                $textarea.className = 'inline-text-editor';
                $textarea.value = action.text;
                
                // Style properties
                $textarea.style.position = 'absolute';
                $textarea.style.left = '0';
                $textarea.style.top = '0';
                $textarea.style.width = '100%';
                $textarea.style.height = '100%';
                const contrastBg = getContrastBgColor(action.color);
                $textarea.style.background = contrastBg;
                $textarea.style.color = action.color;
                
                const currentFontSize = parseFloat($textDiv.style.fontSize);
                $textarea.style.fontSize = currentFontSize + 'px';
                $textarea.style.fontFamily = "'Inter', sans-serif";
                $textarea.style.lineHeight = '1.3';
                $textarea.style.border = '2px solid #00d4ff';
                $textarea.style.outline = 'none';
                $textarea.style.resize = 'none';
                $textarea.style.padding = '4px';
                $textarea.style.zIndex = '10';

                $textDiv.style.visibility = 'hidden';
                $editor.appendChild($textarea);
                $textarea.focus();

                $textarea.addEventListener('mousedown', (ev) => ev.stopPropagation());
                $textarea.addEventListener('touchstart', (ev) => ev.stopPropagation());

                $textarea.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter' && !ev.shiftKey) {
                        ev.preventDefault();
                        commitTextEdit();
                    } else if (ev.key === 'Escape') {
                        ev.preventDefault();
                        cancelTextEdit();
                    }
                });

                $textarea.addEventListener('blur', () => {
                    setTimeout(commitTextEdit, 100);
                });

                function commitTextEdit() {
                    if (!$textarea.parentElement) return;
                    const newText = $textarea.value.trim();
                    if (newText) {
                        action.text = newText;
                        $textDiv.textContent = newText;
                        
                        const currentScale = parseFloat($editor.style.width) / startWidth;
                        const currentFontSizeLogical = (action.fontSize || 24) * currentScale;
                        
                        const newSizeLogical = getTextSize(newText, currentFontSizeLogical);
                        
                        actionWidth = newSizeLogical.width;
                        actionHeight = newSizeLogical.height;
                        imgAspect = actionHeight / actionWidth;
                        
                        const rect = $tempCanvas.getBoundingClientRect();
                        const scaleX = rect.width / canvas.CANVAS_WIDTH;
                        const scaleY = rect.height / canvas.CANVAS_HEIGHT;
                        
                        const newW = actionWidth * scaleX;
                        const newH = actionHeight * scaleY;
                        $editor.style.width = newW + 'px';
                        $editor.style.height = newH + 'px';
                        
                        action.fontSize = currentFontSizeLogical;
                        startWidth = newW;
                        
                        $textDiv.style.fontSize = currentFontSizeLogical * scaleY + 'px';
                    }
                    cancelTextEdit();
                }

                function cancelTextEdit() {
                    $textarea.remove();
                    $textDiv.style.visibility = 'visible';
                }
            });
        }
    }

    /* ---------- Keyboard Shortcuts ---------- */

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in text input
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

            // Intercept inputs if active in Sudoku playing view
            if (sudokuState.status === 'playing' && !$sudokuOverlay.hidden) {
                if (e.key >= '1' && e.key <= '9') {
                    e.preventDefault();
                    inputSudokuNumber(parseInt(e.key));
                    return;
                }
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    eraseSudokuCell();
                    return;
                }
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    navigateSudokuArrow(e.key);
                    return;
                }
                if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    undoSudokuMove();
                    return;
                }
                // F / Space / Esc / ` / ~ : 더블클릭과 동일한 자동 채우기
                if (isSudokuAutoFillShortcut(e)) {
                    e.preventDefault();
                    applySudokuShortcutInputToSelectedCell();
                    return;
                }
                // Do not allow canvas shortcuts while playing sudoku
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            canvas.redo();
                            network.sendRedo();
                        } else {
                            canvas.undo();
                            network.sendUndo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        canvas.redo();
                        network.sendRedo();
                        break;
                    case 's':
                        e.preventDefault();
                        $btnDownload.click();
                        break;
                }
                return;
            }

            // Tool shortcuts (single key)
            const toolMap = {
                'p': 'pen', 'b': 'brush', 'e': 'eraser',
                'l': 'line', 'r': 'rectangle', 'c': 'circle',
                'a': 'arrow', 't': 'text', 'i': 'upload'
            };
            const tool = toolMap[e.key.toLowerCase()];
            if (tool === 'upload') {
                $imageInput.click();
            } else if (tool) {
                const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
                if (btn) btn.click();
            }
        });
    }

    /* ---------- Clipboard Paste (Ctrl+V) ---------- */

    function setupClipboardPaste() {
        document.addEventListener('paste', async (e) => {
            if (!canvas || !network) return;
            // Don't intercept paste in text inputs
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    if (!blob) continue;

                    const reader = new FileReader();
                    reader.onload = async (evt) => {
                        const dataUrl = evt.target.result;
                        const resized = await resizeImageDataUrl(dataUrl, 1920, 1080);
                        startImagePlacer(resized);
                    };
                    reader.readAsDataURL(blob);
                    break; // Only handle the first image
                }
            }
        });
    }

    /* ---------- Participants UI ---------- */

    function updateParticipantsUI() {
        $participants.innerHTML = '';
        knownParticipants.forEach((info, peerId) => {
            const tag = document.createElement('div');
            tag.className = 'participant-tag' + (info.isAway ? ' away' : '');
            let nicknameDisplay = escapeHtml(info.nickname);
            if (info.isAway) {
                nicknameDisplay += ' (자리비움)';
            }
            tag.innerHTML = `
                <span class="participant-dot" style="background:${info.isAway ? '#777' : info.color}"></span>
                <span>${nicknameDisplay}</span>
            `;
            $participants.appendChild(tag);
        });
    }

    /* ---------- Remote Cursors ---------- */

    function updateRemoteCursor(peerId, canvasX, canvasY, nickname, color) {
        if (!canvas) return;

        // Convert canvas coords to screen coords relative to container
        const rect = $tempCanvas.getBoundingClientRect();
        const containerRect = $canvasContainer.getBoundingClientRect();

        const screenX = canvasX * (rect.width / canvas.CANVAS_WIDTH) + (rect.left - containerRect.left);
        const screenY = canvasY * (rect.height / canvas.CANVAS_HEIGHT) + (rect.top - containerRect.top);

        let el = remoteCursors.get(peerId);
        if (!el) {
            el = document.createElement('div');
            el.className = 'remote-cursor';
            el.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${color}" stroke="rgba(0,0,0,0.5)" stroke-width="1">
                    <path d="M5 3l14 8-6 2-3 7z"/>
                </svg>
                <span class="cursor-label" style="background:${color}">${escapeHtml(nickname)}</span>
            `;
            $cursors.appendChild(el);
            remoteCursors.set(peerId, el);
        }

        el.style.left = screenX + 'px';
        el.style.top = screenY + 'px';
    }

    function removeRemoteCursor(peerId) {
        const el = remoteCursors.get(peerId);
        if (el) {
            el.remove();
            remoteCursors.delete(peerId);
        }
    }

    /* ---------- Leave Room ---------- */

    function leaveRoom() {
        resetSudoku();
        resetGomoku();
        resetOthello();
        if (network) {
            network.disconnect();
            network = null;
        }
        canvas = null;

        // Hide away overlay if active
        document.getElementById('awayOverlay').hidden = true;

        // Clear state
        knownParticipants.clear();
        remoteCursors.forEach(el => el.remove());
        remoteCursors.clear();
        document.querySelectorAll('.image-handle-el').forEach(el => el.remove());
        if (activeEditMenu) {
            activeEditMenu.remove();
            activeEditMenu = null;
        }

        // Switch to lobby
        $studio.classList.remove('active');
        $studio.hidden = true;
        $lobby.hidden = false;
        $lobby.classList.add('active');

        // Reset lobby
        $roomCreated.hidden = true;
        $lobbyStatus.hidden = true;
        $btnCreateRoom.disabled = false;
        $btnJoinRoom.disabled = false;
        $joinCode.value = '';
    }

    /* ---------- Toast ---------- */

    let toastTimeout;
    function showToast(msg) {
        clearTimeout(toastTimeout);
        $toast.textContent = msg;
        $toast.hidden = false;
        $toast.classList.remove('toast-out');
        toastTimeout = setTimeout(() => {
            $toast.classList.add('toast-out');
            setTimeout(() => {
                $toast.hidden = true;
                $toast.classList.remove('toast-out');
            }, 300);
        }, 2500);
    }

    /* ---------- Utility ---------- */

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ==========================================================================
       🧩 SUDOKU GAME MULTIPLAYER MANAGER & ENGINE
       ========================================================================== */

    const SudokuEngine = {
        DIFFICULTY_SETTINGS: {
            easy: { cluesTarget: 51, maxAttempts: 25, fallbackTargets: [51, 52, 53] },
            medium: { cluesTarget: 41, maxAttempts: 35, fallbackTargets: [41, 42, 43] },
            hard: { cluesTarget: 31, maxAttempts: 45, fallbackTargets: [31, 32, 33] },
            expert: { cluesTarget: 27, maxAttempts: 60, fallbackTargets: [27, 28, 29, 30] }
        },

        generate(difficulty) {
            const settings = this.DIFFICULTY_SETTINGS[difficulty] || this.DIFFICULTY_SETTINGS.medium;
            for (const cluesTarget of settings.fallbackTargets) {
                const generated = this.tryGeneratePuzzle(cluesTarget, settings.maxAttempts);
                if (generated) return generated;
            }
            const safestTarget = settings.fallbackTargets[settings.fallbackTargets.length - 1];
            let generated = null;
            while (!generated) {
                generated = this.tryGeneratePuzzle(safestTarget, settings.maxAttempts);
            }
            return generated;
        },

        tryGeneratePuzzle(cluesTarget, maxAttempts) {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const sol = Array(9).fill(null).map(() => Array(9).fill(0));
                this.fillDiagonal(sol);
                this.solveSudoku(sol);

                const puzzle = JSON.parse(JSON.stringify(sol));
                const positions = this.shuffleArray([...Array(81).keys()]);
                let cluesLeft = 81;

                for (const pos of positions) {
                    if (cluesLeft <= cluesTarget) break;
                    const r = Math.floor(pos / 9);
                    const c = pos % 9;
                    if (puzzle[r][c] === 0) continue;

                    const backup = puzzle[r][c];
                    puzzle[r][c] = 0;

                    if (this.countSolutions(puzzle) === 1) {
                        cluesLeft--;
                    } else {
                        puzzle[r][c] = backup;
                    }
                }

                if (cluesLeft !== cluesTarget) continue;
                if (!this.isLogicallySolvable(puzzle)) continue;

                return { solution: sol, puzzle };
            }
            return null;
        },

        shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
            return arr;
        },

        countSolutions(mat) {
            const copy = mat.map(r => [...r]);
            let count = 0;
            const self = this;
            function solve() {
                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        if (copy[r][c] === 0) {
                            for (let v = 1; v <= 9; v++) {
                                if (self.isSafeBoard(copy, r, c, v)) {
                                    copy[r][c] = v;
                                    solve();
                                    copy[r][c] = 0;
                                    if (count >= 2) return;
                                }
                            }
                            return;
                        }
                    }
                }
                count++;
            }
            solve();
            return count;
        },

        isLogicallySolvable(puzzle) {
            const grid = puzzle.map(r => [...r]);
            const candidates = Array.from({ length: 9 }, (_, r) =>
                Array.from({ length: 9 }, (__, c) => {
                    if (grid[r][c] !== 0) return new Set();
                    const possible = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let k = 0; k < 9; k++) if (grid[r][k]) possible.delete(grid[r][k]);
                    for (let k = 0; k < 9; k++) if (grid[k][c]) possible.delete(grid[k][c]);
                    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
                    for (let dr = 0; dr < 3; dr++)
                        for (let dc = 0; dc < 3; dc++)
                            if (grid[br + dr][bc + dc]) possible.delete(grid[br + dr][bc + dc]);
                    return possible;
                })
            );

            const units = this.getUnits();
            let progress = true;
            while (progress) {
                progress = false;

                for (let r = 0; r < 9; r++) {
                    for (let c = 0; c < 9; c++) {
                        if (grid[r][c] !== 0) continue;
                        if (candidates[r][c].size === 1) {
                            const val = [...candidates[r][c]][0];
                            grid[r][c] = val;
                            this.eliminateFromPeers(candidates, grid, r, c, val);
                            progress = true;
                        } else if (candidates[r][c].size === 0) {
                            return false;
                        }
                    }
                }

                for (const unit of units) {
                    for (let val = 1; val <= 9; val++) {
                        const possibleCells = unit.filter(([r, c]) => candidates[r][c].has(val));
                        if (possibleCells.length === 1) {
                            const [r, c] = possibleCells[0];
                            if (grid[r][c] === 0) {
                                grid[r][c] = val;
                                candidates[r][c] = new Set();
                                this.eliminateFromPeers(candidates, grid, r, c, val);
                                progress = true;
                            }
                        } else if (possibleCells.length === 0) {
                            const alreadyPlaced = unit.some(([r, c]) => grid[r][c] === val);
                            if (!alreadyPlaced) return false;
                        }
                    }
                }

                for (const unit of units) {
                    const emptyCells = unit.filter(([r, c]) => grid[r][c] === 0);
                    for (let i = 0; i < emptyCells.length; i++) {
                        const [r1, c1] = emptyCells[i];
                        if (candidates[r1][c1].size !== 2) continue;
                        for (let j = i + 1; j < emptyCells.length; j++) {
                            const [r2, c2] = emptyCells[j];
                            if (candidates[r2][c2].size !== 2) continue;
                            const s1 = [...candidates[r1][c1]].sort().join(',');
                            const s2 = [...candidates[r2][c2]].sort().join(',');
                            if (s1 === s2) {
                                const pairVals = candidates[r1][c1];
                                for (const [r3, c3] of emptyCells) {
                                    if ((r3 === r1 && c3 === c1) || (r3 === r2 && c3 === c2)) continue;
                                    for (const pv of pairVals) {
                                        if (candidates[r3][c3].delete(pv)) progress = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return grid.every(row => row.every(v => v !== 0));
        },

        eliminateFromPeers(candidates, grid, r, c, val) {
            for (let k = 0; k < 9; k++) candidates[r][k].delete(val);
            for (let k = 0; k < 9; k++) candidates[k][c].delete(val);
            const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
            for (let dr = 0; dr < 3; dr++)
                for (let dc = 0; dc < 3; dc++)
                    candidates[br + dr][bc + dc].delete(val);
        },

        getUnits() {
            const units = [];
            for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => [r, c]));
            for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => [r, c]));
            for (let br = 0; br < 3; br++)
                for (let bc = 0; bc < 3; bc++) {
                    const box = [];
                    for (let dr = 0; dr < 3; dr++)
                        for (let dc = 0; dc < 3; dc++)
                            box.push([br * 3 + dr, bc * 3 + dc]);
                    units.push(box);
                }
            return units;
        },

        fillDiagonal(mat) {
            for (let i = 0; i < 9; i += 3) this.fillBox(mat, i, i);
        },

        fillBox(mat, rowStart, colStart) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let num;
                    do { num = Math.floor(Math.random() * 9) + 1; }
                    while (!this.isSafeInBox(mat, rowStart, colStart, num));
                    mat[rowStart + i][colStart + j] = num;
                }
            }
        },

        isSafeInBox(mat, rowStart, colStart, num) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (mat[rowStart + i][colStart + j] === num) return false;
                }
            }
            return true;
        },

        isSafeBoard(mat, i, j, num) {
            for (let k = 0; k < 9; k++) if (mat[i][k] === num) return false;
            for (let k = 0; k < 9; k++) if (mat[k][j] === num) return false;
            const rStart = i - i % 3;
            const cStart = j - j % 3;
            return this.isSafeInBox(mat, rStart, cStart, num);
        },

        solveSudoku(mat) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (mat[i][j] === 0) {
                        for (let val = 1; val <= 9; val++) {
                            if (this.isSafeBoard(mat, i, j, val)) {
                                mat[i][j] = val;
                                if (this.solveSudoku(mat)) return true;
                                mat[i][j] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        }
    };

    function getPeerColor(peerId) {
        if (network) {
            if (peerId === network.myPeerId) return network.myColor;
            const conn = network.connections.get(peerId);
            if (conn) return conn.color;
        }
        return '#7c5cff';
    }

    function setupSudokuEvents() {
        // Toolbar icon trigger
        $btnSudoku.addEventListener('click', () => {
            if (sudokuState.status === 'none') {
                $sudokuOverlay.hidden = false;
                showSudokuSubView('lobby');
                $sudokuLobbySetup.hidden = false;
                $sudokuLobbyWaiting.hidden = true;
                $sudokuLobbyInvite.hidden = true;
            } else {
                $sudokuOverlay.hidden = false;
            }
        });

        // Close button
        $btnSudokuClose.addEventListener('click', () => {
            $sudokuOverlay.hidden = true;
        });

        // Propose button click
        $btnSudokuPropose.addEventListener('click', () => {
            const diff = $sudokuDifficulty.value;
            proposeSudoku(diff);
        });

        // Solo button click
        $btnSudokuSolo.addEventListener('click', () => {
            const diff = $sudokuDifficulty.value;
            startSudokuSolo(diff);
        });

        // Cancel proposal click
        $btnSudokuCancel.addEventListener('click', () => {
            cancelSudokuProposal();
        });

        // Host starts game
        $btnSudokuStart.addEventListener('click', () => {
            if (network.isHost) {
                hostStartSudoku();
            }
        });

        // Accept invite
        $btnSudokuAccept.addEventListener('click', () => {
            guestRespondSudoku(true);
        });

        // Decline invite
        $btnSudokuDecline.addEventListener('click', () => {
            guestRespondSudoku(false);
        });

        // Exit / Quit button
        $btnSudokuQuit.addEventListener('click', async () => {
            if (await showCustomConfirm('스도쿠 대결을 종료하시겠습니까? (참여자 전체의 게임이 취소됩니다)')) {
                cancelSudokuProposal();
            }
        });

        // Close results screen
        $btnSudokuResultClose.addEventListener('click', () => {
            resetSudoku();
            $sudokuOverlay.hidden = true;
        });

        // Setup numpad selectors
        document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('completed') || btn.classList.contains('disabled')) return;
                const val = parseInt(btn.getAttribute('data-val'));
                if (sudokuState.isNotesMode) {
                    inputSudokuNote(val);
                } else {
                    inputSudokuNumber(val);
                }
            });
        });

        // Action panel triggers
        $btnSudokuUndo.addEventListener('click', () => {
            undoSudokuMove();
        });

        $btnSudokuErase.addEventListener('click', () => {
            eraseSudokuCell();
        });

        $btnSudokuNotes.addEventListener('click', () => {
            sudokuState.isNotesMode = !sudokuState.isNotesMode;
            $btnSudokuNotes.classList.toggle('notes-active', sudokuState.isNotesMode);
        });

        // Keydown keyboard shortcut event listener
        document.addEventListener('keydown', (e) => {
            if ($sudokuOverlay.hidden) return;
            if (sudokuState.status !== 'playing') return;

            const isSpectator = !sudokuState.turnOrder.includes(network.myPeerId);
            if (isSpectator) return;

            // Arrow navigation is allowed regardless of turn
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                navigateSudokuArrow(e.key);
                return;
            }

            // Input actions require the active player's turn
            const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
            const isMyTurn = activePeerId === network.myPeerId;

            if (e.key >= '1' && e.key <= '9') {
                if (!isMyTurn) {
                    showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
                    return;
                }
                const val = parseInt(e.key);
                setSelectedSudokuNumber(val);
                if (sudokuState.isNotesMode) {
                    inputSudokuNote(val);
                } else {
                    inputSudokuNumber(val);
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                if (!isMyTurn) {
                    showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
                    return;
                }
                eraseSudokuCell();
            } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
                if (!isMyTurn) {
                    showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
                    return;
                }
                undoSudokuMove();
            } else if (isSudokuAutoFillShortcut(e)) {
                e.preventDefault();
                if (!isMyTurn) {
                    showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
                    return;
                }
                applySudokuShortcutInputToSelectedCell();
            }
        });
    }

    function proposeSudoku(difficulty) {
        // sendSudoku의 로컬 에코로 handleSudokuNetworkMessage가 호출되어 상태 및 UI가 설정됨
        network.sendSudoku({
            action: 'propose',
            difficulty: difficulty,
            proposerId: network.myPeerId,
            proposerNickname: network.nickname,
            proposerColor: network.myColor
        });
    }

    function startSudokuSolo(difficulty) {
        const puzzleData = SudokuEngine.generate(difficulty);
        if (!puzzleData) {
            showToast('⚠️ 스도쿠 퍼즐 생성에 실패했습니다.');
            return;
        }

        sudokuState.status = 'playing';
        sudokuState.isSolo = true;
        sudokuState.difficulty = difficulty;
        sudokuState.board = puzzleData.puzzle;
        sudokuState.initialBoard = puzzleData.puzzle;
        sudokuState.solution = puzzleData.solution;
        sudokuState.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
        sudokuState.selectedCell = null;
        sudokuState.mistakes = 0;
        sudokuState.history = [];

        sudokuState.participants = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                accepted: true,
                totalTime: 0,
                correctCount: 0
            }
        ];

        sudokuState.players = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                totalTime: 0,
                correctCount: 0,
                active: true
            }
        ];

        sudokuState.turnOrder = [network.myPeerId];
        sudokuState.currentTurnIndex = 0;

        $sudokuOverlay.hidden = false;
        showSudokuSubView('game');
        $sudokuGameDiff.textContent = difficulty.toUpperCase();
        
        buildSudokuBoardDOM();
        updateSudokuMistakesDisplay();
        updateSudokuNumpadState();

        resetSudokuTimers();
        startSudokuGameTimer();
        startSudokuTurn();
    }

    function guestRespondSudoku(accepted) {
        network.sendSudoku({
            action: 'join-response',
            peerId: network.myPeerId,
            nickname: network.nickname,
            color: network.myColor,
            accepted: accepted
        });

        if (accepted) {
            $sudokuLobbyInvite.hidden = true;
            $sudokuLobbyWaiting.hidden = false;
            $sudokuLobbyWaitingTitle.textContent = '방장이 게임을 시작하기를 기다리는 중...';
            $btnSudokuStart.hidden = true;
            $btnSudokuCancel.hidden = true;
        } else {
            resetSudoku();
            $sudokuOverlay.hidden = true;
        }
    }

    function handleSudokuNetworkMessage(fromPeerId, payload) {
        console.log('[Sudoku Network]', fromPeerId, payload);
        const action = payload.action;

        if (action === 'propose') {
            sudokuState.status = 'proposing';
            sudokuState.difficulty = payload.difficulty;
            sudokuState.proposerId = payload.proposerId;
            sudokuState.proposerNickname = payload.proposerNickname;
            sudokuState.participants = [
                {
                    peerId: payload.proposerId,
                    nickname: payload.proposerNickname,
                    color: payload.proposerColor || getPeerColor(payload.proposerId),
                    accepted: true
                }
            ];

            $sudokuOverlay.hidden = false;
            
            if (payload.proposerId === network.myPeerId) {
                showSudokuSubView('lobby');
                $sudokuLobbySetup.hidden = true;
                $sudokuLobbyWaiting.hidden = false;
                $sudokuLobbyInvite.hidden = true;
                $sudokuLobbyWaitingTitle.textContent = '스도쿠 참가 대기 중';
                $btnSudokuStart.hidden = !network.isHost;
                $btnSudokuStart.disabled = true;
                updateSudokuProposalListUI();
            } else {
                showSudokuSubView('lobby');
                $sudokuLobbySetup.hidden = true;
                $sudokuLobbyWaiting.hidden = true;
                $sudokuLobbyInvite.hidden = false;
                $sudokuProposerName.textContent = payload.proposerNickname;
                $sudokuProposalDifficulty.textContent = payload.difficulty.toUpperCase();
            }

            // 호스트는 propose를 다른 피어에게 릴레이
            if (network.isHost && fromPeerId !== network.myPeerId) {
                // 게스트가 보낸 propose를 다른 게스트에게 전파 (자동 브로드캐스트 없으므로)
                network._broadcast({ type: 'sudoku', payload }, fromPeerId);
            }
        }
        else if (action === 'join-response') {
            // 호스트가 join-response를 받으면 participants를 업데이트하고 proposal-sync로 전체 동기화
            if (network.isHost) {
                let p = sudokuState.participants.find(x => x.peerId === payload.peerId);
                if (p) {
                    p.accepted = payload.accepted;
                } else {
                    sudokuState.participants.push({
                        peerId: payload.peerId,
                        nickname: payload.nickname,
                        color: payload.color,
                        accepted: payload.accepted
                    });
                }
                // proposal-sync를 보내면 로컬 에코로 호스트 자신도 UI가 갱신됨
                network.sendSudoku({
                    action: 'proposal-sync',
                    difficulty: sudokuState.difficulty,
                    proposerId: sudokuState.proposerId,
                    proposerNickname: sudokuState.proposerNickname,
                    participants: sudokuState.participants
                });
            }
        }
        else if (action === 'proposal-sync') {
            sudokuState.difficulty = payload.difficulty;
            sudokuState.proposerId = payload.proposerId;
            sudokuState.proposerNickname = payload.proposerNickname;
            sudokuState.participants = payload.participants;

            updateSudokuProposalListUI();
        }
        else if (action === 'start') {
            sudokuState.status = 'playing';
            sudokuState.isSolo = false;
            sudokuState.difficulty = payload.difficulty;

            sudokuState.participants.forEach(p => {
                p.totalTime = 0;
                p.correctCount = 0;
            });
            sudokuState.board = payload.puzzle;
            sudokuState.initialBoard = payload.initialBoard;
            sudokuState.solution = payload.solution;
            sudokuState.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
            sudokuState.selectedCell = null;
            sudokuState.mistakes = 0;
            sudokuState.history = [];

            sudokuState.players = payload.players.map(p => ({
                peerId: p.peerId,
                nickname: p.nickname,
                color: p.color,
                totalTime: 0,
                correctCount: 0,
                active: true
            }));

            sudokuState.turnOrder = payload.players.map(p => p.peerId);
            sudokuState.currentTurnIndex = 0;

            showSudokuSubView('game');
            $sudokuGameDiff.textContent = payload.difficulty.toUpperCase();
            
            buildSudokuBoardDOM();
            updateSudokuMistakesDisplay();
            updateSudokuNumpadState();

            resetSudokuTimers();
            startSudokuGameTimer();
            startSudokuTurn();
        }
        else if (action === 'move') {
            applySudokuMove(payload.peerId, payload.r, payload.c, payload.val, payload.isCorrect, payload.elapsedSecs);
            // 호스트는 move를 다른 피어에게 릴레이
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'sudoku', payload }, fromPeerId);
            }
        }
        else if (action === 'skip-turn') {
            applySudokuSkipTurn(payload.peerId, payload.elapsedSecs);
            // 호스트는 skip-turn을 다른 피어에게 릴레이
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'sudoku', payload }, fromPeerId);
            }
        }
        else if (action === 'cancel') {
            showToast('🛑 스도쿠 게임이 취소되었습니다.');
            resetSudoku();
            $sudokuOverlay.hidden = true;

            // 호스트는 cancel을 다른 피어에게 릴레이
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'sudoku', payload }, fromPeerId);
            }
        }
    }

    function cancelSudokuProposal() {
        if (sudokuState.isSolo) {
            resetSudoku();
            $sudokuOverlay.hidden = true;
            return;
        }

        // sendSudoku의 로컬 에코로 cancel 핸들러가 호출되어 상태 및 UI가 처리됨
        network.sendSudoku({
            action: 'cancel'
        });
    }

    function hostStartSudoku() {
        if (!network.isHost) return;

        const puzzleData = SudokuEngine.generate(sudokuState.difficulty);
        if (!puzzleData) {
            showToast('⚠️ 스도쿠 퍼즐 생성에 실패했습니다.');
            return;
        }

        const players = [];
        const proposer = sudokuState.participants.find(p => p.peerId === sudokuState.proposerId);
        if (proposer) {
            players.push({
                peerId: proposer.peerId,
                nickname: proposer.nickname,
                color: proposer.color
            });
        }

        sudokuState.participants.forEach(p => {
            if (p.peerId !== sudokuState.proposerId && p.accepted === true) {
                players.push({
                    peerId: p.peerId,
                    nickname: p.nickname,
                    color: p.color
                });
            }
        });

        // sendSudoku의 로컬 에코로 호스트 자신도 start 핸들러가 호출됨
        network.sendSudoku({
            action: 'start',
            difficulty: sudokuState.difficulty,
            puzzle: puzzleData.puzzle,
            solution: puzzleData.solution,
            initialBoard: puzzleData.puzzle,
            players: players
        });
    }

    function updateSudokuProposalListUI() {
        $sudokuProposalList.innerHTML = '';
        sudokuState.participants.forEach(p => {
            const li = document.createElement('li');
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            
            const dot = document.createElement('span');
            dot.className = 'status-dot';
            dot.style.background = p.color;
            nameSpan.appendChild(dot);
            
            const nameText = document.createTextNode(p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname);
            nameSpan.appendChild(nameText);
            
            li.appendChild(nameSpan);

            const statusSpan = document.createElement('span');
            statusSpan.className = 'status-text';

            if (p.accepted === true) {
                statusSpan.textContent = '수락';
                statusSpan.style.color = '#10b981';
            } else if (p.accepted === false) {
                statusSpan.textContent = '거절';
                statusSpan.style.color = '#ef4444';
            } else {
                statusSpan.textContent = '대기 중';
                statusSpan.style.color = '#ffd32a';
            }
            li.appendChild(statusSpan);

            $sudokuProposalList.appendChild(li);
        });

        if (network.isHost) {
            const acceptedCount = sudokuState.participants.filter(p => p.peerId !== sudokuState.proposerId && p.accepted === true).length;
            $btnSudokuStart.disabled = (acceptedCount === 0 && sudokuState.proposerId !== network.myPeerId);
        }
    }

    function buildSudokuBoardDOM() {
        $sudokuBoard.innerHTML = '';
        const isSpectator = !sudokuState.turnOrder.includes(network.myPeerId);

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const val = sudokuState.board[r][c];
                if (val !== 0) {
                    cell.textContent = val;
                    if (sudokuState.initialBoard[r][c] === 0) {
                        cell.classList.add('user-input');
                    }
                }

                cell.addEventListener('click', () => {
                    selectSudokuCell(r, c);
                });

                cell.addEventListener('dblclick', () => {
                    if (isSpectator) return;
                    
                    const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
                    const isMyTurn = activePeerId === network.myPeerId;
                    if (!isMyTurn) return;

                    if (sudokuState.board[r][c] !== 0) return;
                    if (sudokuState.initialBoard[r][c] !== 0) return;
                    applySudokuShortcutInputToCell(r, c);
                });

                $sudokuBoard.appendChild(cell);
            }
        }
    }

    function getSudokuCellElement(r, c) {
        return $sudokuBoard.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
    }

    function selectSudokuCell(r, c) {
        if (sudokuState.status !== 'playing') return;

        // 다른 사람 턴일 때는 클릭 반응 없음
        const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
        const isMyTurn = activePeerId === network.myPeerId;
        if (!isMyTurn) return;

        sudokuState.selectedCell = { r, c };

        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted', 'same-number');
        });

        const targetCell = getSudokuCellElement(r, c);
        if (targetCell) targetCell.classList.add('selected');

        const cellValue = sudokuState.board[r][c];

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cellEl = getSudokuCellElement(i, j);
                if (!cellEl) continue;

                const isSameBlock = Math.floor(i / 3) === Math.floor(r / 3) && Math.floor(j / 3) === Math.floor(c / 3);
                if (i === r || j === c || isSameBlock) {
                    if (i !== r || j !== c) cellEl.classList.add('highlighted');
                }

                if (cellValue !== 0 && sudokuState.board[i][j] === cellValue) {
                    cellEl.classList.add('same-number');
                }
            }
        }

        if (cellValue !== 0) {
            setSelectedSudokuNumber(cellValue);
        } else {
            syncSudokuSelectedNumberForCell(r, c);
        }
    }

    function inputSudokuNumber(val) {
        if (sudokuState.status !== 'playing') return;
        if (!sudokuState.selectedCell) return;

        const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
        const isMyTurn = activePeerId === network.myPeerId;
        if (!isMyTurn) {
            showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
            return;
        }

        const { r, c } = sudokuState.selectedCell;
        if (sudokuState.initialBoard[r][c] !== 0) return;

        if (sudokuState.isNotesMode) {
            inputSudokuNote(val);
            return;
        }

        if (sudokuState.board[r][c] === val) {
            eraseSudokuCell();
            return;
        }

        const elapsed = (performance.now() - sudokuState.turnStartTime) / 1000;
        const isCorrect = sudokuState.solution[r][c] === val;

        if (sudokuState.isSolo) {
            applySudokuMove(network.myPeerId, r, c, val, isCorrect, elapsed);
            return;
        }

        network.sendSudoku({
            action: 'move',
            peerId: network.myPeerId,
            r, c, val,
            isCorrect,
            elapsedSecs: elapsed
        });

        // 게스트는 로컬 에코가 없으므로 수동으로 적용
        if (!network.isHost) {
            applySudokuMove(network.myPeerId, r, c, val, isCorrect, elapsed);
        }
    }

    function applySudokuMove(peerId, r, c, val, isCorrect, elapsed) {
        clearInterval(sudokuState.turnTimerInterval);

        const player = sudokuState.participants.find(p => p.peerId === peerId);
        if (player) {
            player.totalTime += elapsed;
            if (isCorrect) player.correctCount++;
        }

        const cellEl = getSudokuCellElement(r, c);
        if (isCorrect) {
            sudokuState.board[r][c] = val;
            sudokuState.notes[r][c].clear();
            removeSudokuNoteFromRelatedCells(r, c, val);
            
            if (cellEl) {
                cellEl.textContent = val;
                cellEl.classList.add('user-input');
                cellEl.classList.remove('error-animation');
                
                cellEl.style.animation = 'none';
                void cellEl.offsetWidth;
                cellEl.style.animation = 'scaleIn 0.2s ease-out';
            }

            updateSudokuNumpadState();
            selectSudokuCell(r, c);
            checkSudokuWin();
        } else {
            sudokuState.mistakes++;
            updateSudokuMistakesDisplay();

            if (cellEl) {
                cellEl.classList.add('error-animation');
                cellEl.textContent = val;
                setTimeout(() => {
                    cellEl.classList.remove('error-animation');
                    cellEl.textContent = sudokuState.board[r][c] !== 0 ? sudokuState.board[r][c] : '';
                    if (sudokuState.board[r][c] === 0) {
                        renderSudokuCellNotes(r, c);
                    }
                }, 500);
            }

            if (sudokuState.mistakes >= sudokuState.maxMistakes) {
                endSudokuGame(false);
                return;
            }
        }

        sudokuState.history = [];

        if (sudokuState.status === 'playing') {
            advanceSudokuTurn();
        }
    }

    function getSudokuCellCandidates(r, c) {
        if (sudokuState.board[r][c] !== 0 || sudokuState.initialBoard[r][c] !== 0) return [];
        const candidates = [];
        for (let val = 1; val <= 9; val++) {
            if (SudokuEngine.isSafeBoard(sudokuState.board, r, c, val)) {
                candidates.push(val);
            }
        }
        return candidates;
    }

    function getSudokuUnitMissingValue(cells) {
        let emptyCount = 0;
        const used = new Set();
        for (const [row, col] of cells) {
            const val = sudokuState.board[row][col];
            if (val === 0) {
                emptyCount++;
                continue;
            }
            used.add(val);
        }
        if (emptyCount !== 1) return null;
        for (let val = 1; val <= 9; val++) {
            if (!used.has(val)) return val;
        }
        return null;
    }

    function getSudokuLastUnitCompletionNumber(r, c) {
        if (sudokuState.board[r][c] !== 0 || sudokuState.initialBoard[r][c] !== 0) return null;

        const rowCells = Array.from({ length: 9 }, (_, col) => [r, col]);
        const colCells = Array.from({ length: 9 }, (_, row) => [row, c]);
        const boxCells = [];
        const boxRowStart = Math.floor(r / 3) * 3;
        const boxColStart = Math.floor(c / 3) * 3;

        for (let row = boxRowStart; row < boxRowStart + 3; row++) {
            for (let col = boxColStart; col < boxColStart + 3; col++) {
                boxCells.push([row, col]);
            }
        }

        const missingValues = [
            getSudokuUnitMissingValue(rowCells),
            getSudokuUnitMissingValue(colCells),
            getSudokuUnitMissingValue(boxCells)
        ].filter(val => val !== null);

        if (missingValues.length === 0) return null;
        return missingValues.every(val => val === missingValues[0]) ? missingValues[0] : null;
    }

    function getSudokuOnlyRemainingNumber() {
        const counts = Array(10).fill(0);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (sudokuState.board[r][c] !== 0) counts[sudokuState.board[r][c]]++;
            }
        }
        const remaining = [];
        for (let val = 1; val <= 9; val++) {
            if (counts[val] < 9) remaining.push(val);
        }
        return remaining.length === 1 ? remaining[0] : null;
    }

    function getSudokuAutoFillNumber(r, c) {
        if (sudokuState.board[r][c] !== 0 || sudokuState.initialBoard[r][c] !== 0) return null;
        const unitCompletionVal = getSudokuLastUnitCompletionNumber(r, c);
        if (unitCompletionVal !== null) return unitCompletionVal;
        const candidates = getSudokuCellCandidates(r, c);
        if (candidates.length === 1) return candidates[0];
        return getSudokuOnlyRemainingNumber();
    }

    function setSelectedSudokuNumber(val) {
        sudokuState.selectedNumber = val;
        sudokuState.selectedNumberSource = val !== null ? 'user' : null;
        document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
            const v = parseInt(btn.getAttribute('data-val'));
            btn.classList.toggle('num-selected', v === val);
        });
    }

    function clearSudokuSelectedNumber(onlyAuto = false) {
        if (onlyAuto && sudokuState.selectedNumberSource !== 'auto') return;
        sudokuState.selectedNumber = null;
        sudokuState.selectedNumberSource = null;
        document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
            btn.classList.remove('num-selected');
        });
    }

    function syncSudokuSelectedNumberForCell(r, c) {
        if (sudokuState.isNotesMode) {
            clearSudokuSelectedNumber(true);
            return;
        }
        const autoVal = getSudokuAutoFillNumber(r, c);
        if (autoVal !== null) {
            if (sudokuState.selectedNumberSource !== 'user') {
                sudokuState.selectedNumber = autoVal;
                sudokuState.selectedNumberSource = 'auto';
                document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
                    const v = parseInt(btn.getAttribute('data-val'));
                    btn.classList.toggle('num-selected', v === autoVal);
                });
            }
            return;
        }
        clearSudokuSelectedNumber(true);
    }

    function isSudokuAutoFillShortcut(event) {
        return event.key.toLowerCase() === 'f'
            || event.key === '`'
            || event.key === '~'
            || event.key === 'Escape'
            || event.code === 'Space';
    }

    function applySudokuShortcutInputToCell(r, c) {
        if (sudokuState.board[r][c] !== 0 || sudokuState.initialBoard[r][c] !== 0) return false;

        selectSudokuCell(r, c);

        if (sudokuState.isNotesMode) {
            if (sudokuState.selectedNumberSource !== 'user' || sudokuState.selectedNumber === null) return false;
            inputSudokuNote(sudokuState.selectedNumber);
            return true;
        }

        const autoVal = getSudokuAutoFillNumber(r, c);
        if (autoVal !== null) {
            inputSudokuNumber(autoVal);
            setSelectedSudokuNumber(autoVal);
            return true;
        }

        if (sudokuState.selectedNumber === null) return false;
        inputSudokuNumber(sudokuState.selectedNumber);
        return true;
    }

    function applySudokuShortcutInputToSelectedCell() {
        if (!sudokuState.selectedCell) return false;
        const { r, c } = sudokuState.selectedCell;
        return applySudokuShortcutInputToCell(r, c);
    }

    function updateSudokuNumpadState() {
        const counts = Array(10).fill(0);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (sudokuState.board[r][c] !== 0) {
                    counts[sudokuState.board[r][c]]++;
                }
            }
        }

        document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
            const val = parseInt(btn.getAttribute('data-val'));
            if (counts[val] >= 9) {
                btn.classList.add('completed');
                btn.classList.remove('disabled');
            } else {
                btn.classList.remove('completed');
                btn.classList.remove('disabled');
            }
        });
    }

    function inputSudokuNote(val) {
        if (!sudokuState.selectedCell) return;
        const { r, c } = sudokuState.selectedCell;
        if (sudokuState.initialBoard[r][c] !== 0) return;
        if (sudokuState.board[r][c] !== 0) return;

        const noteSet = sudokuState.notes[r][c];
        if (noteSet.has(val)) {
            noteSet.delete(val);
        } else {
            noteSet.add(val);
        }
        renderSudokuCellNotes(r, c);
    }

    function renderSudokuCellNotes(r, c) {
        const cellEl = getSudokuCellElement(r, c);
        if (!cellEl) return;
        cellEl.innerHTML = '';
        cellEl.textContent = '';

        const noteSet = sudokuState.notes[r][c];
        if (!noteSet || noteSet.size === 0) return;

        const grid = document.createElement('div');
        grid.className = 'sudoku-cell-notes-grid';
        for (let n = 1; n <= 9; n++) {
            const span = document.createElement('span');
            span.className = 'sudoku-cell-note-num';
            span.textContent = noteSet.has(n) ? n : '';
            grid.appendChild(span);
        }
        cellEl.appendChild(grid);
    }

    function removeSudokuNoteFromRelatedCells(r, c, val) {
        const boxRowStart = Math.floor(r / 3) * 3;
        const boxColStart = Math.floor(c / 3) * 3;

        for (let i = 0; i < 9; i++) {
            if (sudokuState.notes[r][i].has(val)) {
                sudokuState.notes[r][i].delete(val);
                renderSudokuCellNotes(r, i);
            }
            if (sudokuState.notes[i][c].has(val)) {
                sudokuState.notes[i][c].delete(val);
                renderSudokuCellNotes(i, c);
            }
        }
        for (let br = boxRowStart; br < boxRowStart + 3; br++) {
            for (let bc = boxColStart; bc < boxColStart + 3; bc++) {
                if (sudokuState.notes[br][bc].has(val)) {
                    sudokuState.notes[br][bc].delete(val);
                    renderSudokuCellNotes(br, bc);
                }
            }
        }
    }

    function eraseSudokuCell() {
        if (!sudokuState.selectedCell) return;
        
        const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
        const isMyTurn = activePeerId === network.myPeerId;
        if (!isMyTurn) {
            showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
            return;
        }

        const { r, c } = sudokuState.selectedCell;
        if (sudokuState.initialBoard[r][c] !== 0) return;

        if (sudokuState.board[r][c] !== 0) {
            sudokuState.history.push({ r, c, val: sudokuState.board[r][c], wasNote: false });
            sudokuState.board[r][c] = 0;
            const cellEl = getSudokuCellElement(r, c);
            if (cellEl) cellEl.textContent = '';
        }

        if (sudokuState.notes[r][c].size > 0) {
            sudokuState.history.push({ r, c, val: new Set(sudokuState.notes[r][c]), wasNote: true });
            sudokuState.notes[r][c].clear();
            renderSudokuCellNotes(r, c);
        }

        selectSudokuCell(r, c);
        updateSudokuNumpadState();
    }

    function undoSudokuMove() {
        if (sudokuState.history.length === 0) return;
        const lastAction = sudokuState.history.pop();
        const { r, c, val, wasNote } = lastAction;

        if (wasNote) {
            sudokuState.notes[r][c] = val;
            renderSudokuCellNotes(r, c);
        } else {
            sudokuState.board[r][c] = val;
            const cellEl = getSudokuCellElement(r, c);
            if (cellEl) {
                cellEl.textContent = val !== 0 ? val : '';
                if (val !== 0) cellEl.classList.add('user-input');
                else cellEl.classList.remove('user-input');
            }
        }
        selectSudokuCell(r, c);
        updateSudokuNumpadState();
    }

    function checkSudokuWin() {
        let win = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (sudokuState.board[r][c] !== sudokuState.solution[r][c]) {
                    win = false;
                    break;
                }
            }
        }
        if (win) {
            endSudokuGame(true);
        }
    }

    function endSudokuGame(isWin) {
        clearInterval(sudokuState.turnTimerInterval);
        clearInterval(sudokuState.gameTimerInterval);

        sudokuState.status = 'finished';

        showSudokuSubView('result');

        if (isWin) {
            $sudokuResultTitle.textContent = '🏆 완벽한 마무리! 🏆';
            $sudokuResultTitle.className = '';
            $sudokuResultMsg.textContent = `축하합니다! 공동 실수 ${sudokuState.mistakes}회로 스도쿠 해결에 성공했습니다!`;
        } else {
            $sudokuResultTitle.textContent = '💀 도전 실패 💀';
            $sudokuResultTitle.className = 'error-title';
            $sudokuResultMsg.textContent = `실수 3회를 모두 기록하여 도전에 실패했습니다.`;
        }

        renderSudokuFinalLeaderboard();
    }

    function updateSudokuMistakesDisplay() {
        const bars = $sudokuHealthBars.querySelectorAll('.sudoku-health-bar');
        bars.forEach((bar, index) => {
            if (index < sudokuState.mistakes) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    function startSudokuGameTimer() {
        sudokuState.gameStartTime = Date.now();
        sudokuState.gameSecondsElapsed = 0;
        $sudokuGameTimer.textContent = '00:00';

        sudokuState.gameTimerInterval = setInterval(() => {
            sudokuState.gameSecondsElapsed++;
            $sudokuGameTimer.textContent = formatSudokuTime(sudokuState.gameSecondsElapsed);
        }, 1000);
    }

    function startSudokuTurn() {
        if (sudokuState.status !== 'playing') return;

        sudokuState.turnStartTime = performance.now();
        sudokuState.secondsRemaining = sudokuState.turnTimeLimit;

        const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
        const isMyTurn = activePeerId === network.myPeerId;
        const activePlayer = sudokuState.players.find(p => p.peerId === activePeerId);
        const nameText = activePlayer ? activePlayer.nickname : '알 수 없음';

        const $boardWrapper = $sudokuBoard.parentElement;
        if ($boardWrapper) {
            if (isMyTurn) {
                $boardWrapper.classList.add('my-turn');
                $boardWrapper.classList.remove('other-turn');
            } else {
                $boardWrapper.classList.add('other-turn');
                $boardWrapper.classList.remove('my-turn');
            }
        }

        if (isMyTurn) {
            $sudokuTurnStatus.innerHTML = `👑 <span style="color:#00d4ff; font-weight:bold;">내 차례입니다!</span> (남은 시간: <span id="sudokuTurnTimerSecs">${sudokuState.secondsRemaining}</span>초)`;
        } else {
            $sudokuTurnStatus.innerHTML = `⏳ <b>${escapeHtml(nameText)}</b> 님의 턴 (남은 시간: <span id="sudokuTurnTimerSecs">${sudokuState.secondsRemaining}</span>초)`;
        }

        updateSudokuLeaderboardUI();

        $sudokuTurnTimerProgress.style.width = '100%';
        $sudokuTurnTimerProgress.className = 'sudoku-progress-fill';

        sudokuState.turnTimerInterval = setInterval(() => {
            sudokuState.secondsRemaining--;
            
            const timerEl = document.getElementById('sudokuTurnTimerSecs');
            if (timerEl) timerEl.textContent = sudokuState.secondsRemaining;

            const pct = (sudokuState.secondsRemaining / sudokuState.turnTimeLimit) * 100;
            $sudokuTurnTimerProgress.style.width = `${pct}%`;

            if (pct <= 25) {
                $sudokuTurnTimerProgress.className = 'sudoku-progress-fill danger';
            } else if (pct <= 50) {
                $sudokuTurnTimerProgress.className = 'sudoku-progress-fill warning';
            }

            if (sudokuState.secondsRemaining <= 0) {
                clearInterval(sudokuState.turnTimerInterval);
                
                if (isMyTurn) {
                    if (sudokuState.isSolo) {
                        applySudokuSkipTurn(network.myPeerId, sudokuState.turnTimeLimit);
                        return;
                    }

                    network.sendSudoku({
                        action: 'skip-turn',
                        peerId: network.myPeerId,
                        elapsedSecs: sudokuState.turnTimeLimit
                    });
                    // 게스트는 로컬 에코가 없으므로 수동으로 적용
                    if (!network.isHost) {
                        applySudokuSkipTurn(network.myPeerId, sudokuState.turnTimeLimit);
                    }
                }
            }
        }, 1000);
    }

    function applySudokuSkipTurn(peerId, elapsed) {
        clearInterval(sudokuState.turnTimerInterval);

        const player = sudokuState.participants.find(p => p.peerId === peerId);
        if (player) {
            player.totalTime += elapsed;
        }

        showToast(`⏰ 시간 초과! 다음 턴으로 넘어갑니다.`);

        if (sudokuState.status === 'playing') {
            advanceSudokuTurn();
        }
    }

    function advanceSudokuTurn() {
        if (sudokuState.turnOrder.length === 0) return;
        sudokuState.currentTurnIndex = (sudokuState.currentTurnIndex + 1) % sudokuState.turnOrder.length;
        startSudokuTurn();
    }

    function updateSudokuLeaderboardUI() {
        $sudokuLeaderboardList.innerHTML = '';

        const sorted = [...sudokuState.players].map(p => {
            const match = sudokuState.participants.find(x => x.peerId === p.peerId);
            const totalTime = match ? match.totalTime : 0;
            const correctCount = match ? match.correctCount : 0;
            const avg = correctCount > 0 ? (totalTime / correctCount) : Infinity;
            return {
                ...p,
                totalTime,
                correctCount,
                avg
            };
        }).sort((a, b) => a.avg - b.avg);

        sorted.forEach((p, idx) => {
            const item = document.createElement('div');
            item.className = 'sudoku-leaderboard-item';
            
            const activePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];
            if (p.peerId === activePeerId) {
                item.classList.add('active');
            }

            const pName = document.createElement('span');
            pName.className = 'player-name';
            
            const dot = document.createElement('span');
            dot.className = 'player-color-dot';
            dot.style.background = p.color;
            pName.appendChild(dot);
            
            const nameTxt = document.createTextNode(`${idx + 1}. ${p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname}`);
            pName.appendChild(nameTxt);
            item.appendChild(pName);

            const score = document.createElement('span');
            score.className = 'player-score';
            if (p.avg === Infinity) {
                score.textContent = `- (0회)`;
            } else {
                score.textContent = `${p.avg.toFixed(1)}초 (${p.correctCount}회)`;
            }
            item.appendChild(score);

            $sudokuLeaderboardList.appendChild(item);
        });
    }

    function renderSudokuFinalLeaderboard() {
        $sudokuFinalLeaderboardList.innerHTML = '';

        const sorted = [...sudokuState.players].map(p => {
            const match = sudokuState.participants.find(x => x.peerId === p.peerId);
            const totalTime = match ? match.totalTime : 0;
            const correctCount = match ? match.correctCount : 0;
            const avg = correctCount > 0 ? (totalTime / correctCount) : Infinity;
            return {
                ...p,
                totalTime,
                correctCount,
                avg
            };
        }).sort((a, b) => a.avg - b.avg);

        sorted.forEach((p, idx) => {
            const item = document.createElement('div');
            item.className = 'sudoku-leaderboard-item';

            const pName = document.createElement('span');
            pName.className = 'player-name';
            
            const dot = document.createElement('span');
            dot.className = 'player-color-dot';
            dot.style.background = p.color;
            pName.appendChild(dot);

            const medal = idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : '';
            const nameTxt = document.createTextNode(`${medal}${idx + 1}위. ${p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname}`);
            pName.appendChild(nameTxt);
            item.appendChild(pName);

            const score = document.createElement('span');
            score.className = 'player-score';
            if (p.avg === Infinity) {
                score.textContent = `- (0회 맞춤)`;
            } else {
                score.textContent = `${p.avg.toFixed(1)}초 (성공 ${p.correctCount}회)`;
            }
            item.appendChild(score);

            $sudokuFinalLeaderboardList.appendChild(item);
        });
    }

    function handleSudokuPeerLeave(peerId) {
        if (sudokuState.status === 'proposing') {
            if (peerId === sudokuState.proposerId) {
                showToast('🛑 스도쿠 제안자가 퇴장하여 제안이 취소되었습니다.');
                resetSudoku();
                $sudokuOverlay.hidden = true;
            } else {
                sudokuState.participants = sudokuState.participants.filter(p => p.peerId !== peerId);
                updateSudokuProposalListUI();
            }
        } else if (sudokuState.status === 'playing') {
            const hostId = network.getHostPeerId();
            if (peerId === hostId) {
                showToast('⚠️ 방장이 퇴장하여 스도쿠 게임을 종료합니다.');
                resetSudoku();
                $sudokuOverlay.hidden = true;
                return;
            }

            if (sudokuState.turnOrder.includes(peerId)) {
                showToast(`🔴 참가자 ${escapeHtml(getPeerNickname(peerId))}님이 퇴장했습니다.`);

                const currentActivePeerId = sudokuState.turnOrder[sudokuState.currentTurnIndex];

                sudokuState.players = sudokuState.players.filter(p => p.peerId !== peerId);
                sudokuState.turnOrder = sudokuState.turnOrder.filter(id => id !== peerId);

                if (sudokuState.turnOrder.length === 0) {
                    showToast('⚠️ 모든 참가자가 퇴장하여 스도쿠 게임을 종료합니다.');
                    resetSudoku();
                    $sudokuOverlay.hidden = true;
                    return;
                }

                if (currentActivePeerId === peerId) {
                    clearInterval(sudokuState.turnTimerInterval);
                    sudokuState.currentTurnIndex = sudokuState.currentTurnIndex % sudokuState.turnOrder.length;
                    startSudokuTurn();
                } else {
                    const newIndex = sudokuState.turnOrder.indexOf(currentActivePeerId);
                    if (newIndex !== -1) {
                        sudokuState.currentTurnIndex = newIndex;
                    } else {
                        sudokuState.currentTurnIndex = sudokuState.currentTurnIndex % sudokuState.turnOrder.length;
                    }
                    updateSudokuLeaderboardUI();
                }
            }
        }
    }

    function getPeerNickname(peerId) {
        const participant = knownParticipants.get(peerId);
        return participant ? participant.nickname : '알 수 없음';
    }

    function navigateSudokuArrow(key) {
        if (!sudokuState.selectedCell) {
            selectSudokuCell(0, 0);
            return;
        }
        let { r, c } = sudokuState.selectedCell;
        if (key === 'ArrowUp') r = Math.max(0, r - 1);
        else if (key === 'ArrowDown') r = Math.min(8, r + 1);
        else if (key === 'ArrowLeft') c = Math.max(0, c - 1);
        else if (key === 'ArrowRight') c = Math.min(8, c + 1);
        selectSudokuCell(r, c);
    }

    function syncSudokuStateFromHost(hostState) {
        sudokuState.status = 'playing';
        sudokuState.difficulty = hostState.difficulty;
        sudokuState.board = hostState.board;
        sudokuState.initialBoard = hostState.initialBoard;
        sudokuState.solution = hostState.solution;
        sudokuState.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));
        sudokuState.selectedCell = null;
        sudokuState.mistakes = hostState.mistakes;
        sudokuState.history = [];
        sudokuState.players = hostState.players.map(p => ({
            ...p,
            active: true
        }));
        sudokuState.turnOrder = hostState.turnOrder;
        sudokuState.currentTurnIndex = hostState.currentTurnIndex;

        $sudokuOverlay.hidden = false;
        showSudokuSubView('game');
        $sudokuGameDiff.textContent = hostState.difficulty.toUpperCase();

        buildSudokuBoardDOM();
        updateSudokuMistakesDisplay();
        updateSudokuNumpadState();

        resetSudokuTimers();
        
        sudokuState.gameSecondsElapsed = hostState.elapsedSeconds;
        $sudokuGameTimer.textContent = formatSudokuTime(sudokuState.gameSecondsElapsed);
        sudokuState.gameTimerInterval = setInterval(() => {
            sudokuState.gameSecondsElapsed++;
            $sudokuGameTimer.textContent = formatSudokuTime(sudokuState.gameSecondsElapsed);
        }, 1000);

        startSudokuTurn();
    }

    function formatSudokuTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function resetSudokuTimers() {
        clearInterval(sudokuState.turnTimerInterval);
        clearInterval(sudokuState.gameTimerInterval);
    }

    function resetSudoku() {
        resetSudokuTimers();

        sudokuState = {
            status: 'none',
            isSolo: false,
            difficulty: 'medium',
            board: [],
            initialBoard: [],
            solution: [],
            notes: [],
            selectedCell: null,
            mistakes: 0,
            maxMistakes: 3,
            isNotesMode: false,
            selectedNumber: null,
            proposerId: null,
            proposerNickname: null,
            participants: [],
            players: [],
            turnOrder: [],
            currentTurnIndex: 0,
            turnStartTime: 0,
            turnTimerInterval: null,
            turnTimeLimit: 30,
            secondsRemaining: 30,
            gameStartTime: 0,
            gameSecondsElapsed: 0,
            gameTimerInterval: null,
            history: []
        };

        $btnSudokuNotes.classList.remove('notes-active');

        const $boardWrapper = $sudokuBoard.parentElement;
        if ($boardWrapper) {
            $boardWrapper.classList.remove('my-turn', 'other-turn');
        }

        $sudokuLobby.hidden = true;
        $sudokuGame.hidden = true;
        $sudokuResult.hidden = true;
    }

    function showSudokuSubView(view) {
        $sudokuLobby.hidden = (view !== 'lobby');
        $sudokuGame.hidden = (view !== 'game');
        $sudokuResult.hidden = (view !== 'result');
    }

    /* ==========================================================================
       ⚫⚪ GOMOKU GAME MULTIPLAYER MANAGER & ENGINE
       ========================================================================== */

    function setupGomokuEvents() {
        // Toolbar icon trigger
        $btnGomoku.addEventListener('click', () => {
            if (gomokuState.status === 'none') {
                $gomokuOverlay.hidden = false;
                showGomokuSubView('lobby');
                $gomokuLobbySetup.hidden = false;
                $gomokuLobbyWaiting.hidden = true;
                $gomokuLobbyInvite.hidden = true;
            } else {
                $gomokuOverlay.hidden = false;
            }
        });

        // Close button
        $btnGomokuClose.addEventListener('click', () => {
            $gomokuOverlay.hidden = true;
        });

        // Propose button click
        $btnGomokuPropose.addEventListener('click', () => {
            proposeGomoku();
        });

        // Solo button click
        $btnGomokuSolo.addEventListener('click', () => {
            startGomokuSolo();
        });

        // Cancel proposal click
        $btnGomokuCancel.addEventListener('click', () => {
            cancelGomokuProposal();
        });

        // Host starts game
        $btnGomokuStart.addEventListener('click', () => {
            if (network.isHost) {
                hostStartGomoku();
            }
        });

        // Accept invite
        $btnGomokuAccept.addEventListener('click', () => {
            guestRespondGomoku(true);
        });

        // Decline invite
        $btnGomokuDecline.addEventListener('click', () => {
            guestRespondGomoku(false);
        });

        // Exit / Quit button
        $btnGomokuQuit.addEventListener('click', async () => {
            const msg = gomokuState.isSolo 
                ? '오목 게임을 종료하시겠습니까?' 
                : '오목 대결을 종료하시겠습니까? (참여자 전체의 게임이 취소됩니다)';
            if (await showCustomConfirm(msg)) {
                quitGomokuGame();
            }
        });

        // Close results screen
        $btnGomokuResultClose.addEventListener('click', () => {
            resetGomoku();
            $gomokuOverlay.hidden = true;
        });

        // Action panel triggers
        $btnGomokuUndo.addEventListener('click', () => {
            undoGomokuMove();
        });
    }

    function proposeGomoku() {
        network.sendGomoku({
            action: 'propose',
            proposerId: network.myPeerId,
            proposerNickname: network.nickname,
            proposerColor: network.myColor
        });
    }

    function startGomokuSolo() {
        gomokuState.status = 'playing';
        gomokuState.isSolo = true;
        gomokuState.board = Array(15).fill(null).map(() => Array(15).fill(0));
        gomokuState.lastMove = null;
        gomokuState.history = [];
        gomokuState.soloTurn = 'black';

        gomokuState.participants = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                accepted: true,
                totalTime: 0,
                correctCount: 0
            }
        ];

        gomokuState.players = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                role: 'black'
            }
        ];

        gomokuState.turnOrder = [network.myPeerId];
        gomokuState.currentTurnIndex = 0;

        $gomokuOverlay.hidden = false;
        showGomokuSubView('game');
        
        buildGomokuBoardDOM();
        
        resetGomokuTimers();
        startGomokuGameTimer();
        startGomokuTurn();
    }

    function guestRespondGomoku(accepted) {
        network.sendGomoku({
            action: 'join-response',
            peerId: network.myPeerId,
            nickname: network.nickname,
            color: network.myColor,
            accepted: accepted
        });

        if (accepted) {
            $gomokuLobbyInvite.hidden = true;
            $gomokuLobbyWaiting.hidden = false;
            $gomokuLobbyWaitingTitle.textContent = '방장이 게임을 시작하기를 기다리는 중...';
            $btnGomokuStart.hidden = true;
            $btnGomokuCancel.hidden = true;
        } else {
            resetGomoku();
            $gomokuOverlay.hidden = true;
        }
    }

    function handleGomokuNetworkMessage(fromPeerId, payload) {
        console.log('[Gomoku Network]', fromPeerId, payload);
        const action = payload.action;

        if (action === 'propose') {
            gomokuState.status = 'proposing';
            gomokuState.proposerId = payload.proposerId;
            gomokuState.proposerNickname = payload.proposerNickname;
            gomokuState.participants = [
                {
                    peerId: payload.proposerId,
                    nickname: payload.proposerNickname,
                    color: payload.proposerColor || getPeerColor(payload.proposerId),
                    accepted: true
                }
            ];

            $gomokuOverlay.hidden = false;
            
            if (payload.proposerId === network.myPeerId) {
                showGomokuSubView('lobby');
                $gomokuLobbySetup.hidden = true;
                $gomokuLobbyWaiting.hidden = false;
                $gomokuLobbyInvite.hidden = true;
                $gomokuLobbyWaitingTitle.textContent = '오목 참가 대기 중';
                $btnGomokuStart.hidden = !network.isHost;
                $btnGomokuStart.disabled = true;
                updateGomokuProposalListUI();
            } else {
                showGomokuSubView('lobby');
                $gomokuLobbySetup.hidden = true;
                $gomokuLobbyWaiting.hidden = true;
                $gomokuLobbyInvite.hidden = false;
                $gomokuProposerName.textContent = payload.proposerNickname;
            }

            // Relay if host
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'gomoku', payload }, fromPeerId);
            }
        }
        else if (action === 'join-response') {
            if (network.isHost) {
                let p = gomokuState.participants.find(x => x.peerId === payload.peerId);
                if (p) {
                    p.accepted = payload.accepted;
                } else {
                    gomokuState.participants.push({
                        peerId: payload.peerId,
                        nickname: payload.nickname,
                        color: payload.color,
                        accepted: payload.accepted
                    });
                }
                network.sendGomoku({
                    action: 'proposal-sync',
                    proposerId: gomokuState.proposerId,
                    proposerNickname: gomokuState.proposerNickname,
                    participants: gomokuState.participants
                });
            }
        }
        else if (action === 'proposal-sync') {
            gomokuState.proposerId = payload.proposerId;
            gomokuState.proposerNickname = payload.proposerNickname;
            gomokuState.participants = payload.participants;

            updateGomokuProposalListUI();
        }
        else if (action === 'start') {
            gomokuState.status = 'playing';
            gomokuState.isSolo = false;
            gomokuState.board = payload.board;
            gomokuState.lastMove = null;
            gomokuState.history = [];

            gomokuState.participants.forEach(p => {
                p.totalTime = 0;
                p.correctCount = 0; // count of placements
            });

            gomokuState.players = payload.players.map(p => ({
                peerId: p.peerId,
                nickname: p.nickname,
                color: p.color,
                role: p.role // 'black' or 'white'
            }));

            gomokuState.turnOrder = payload.turnOrder;
            gomokuState.currentTurnIndex = 0;

            showGomokuSubView('game');
            buildGomokuBoardDOM();

            resetGomokuTimers();
            startGomokuGameTimer();
            startGomokuTurn();
        }
        else if (action === 'move') {
            applyGomokuMove(payload.peerId, payload.r, payload.c, payload.role, payload.elapsedSecs);
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'gomoku', payload }, fromPeerId);
            }
        }
        else if (action === 'undo') {
            applyGomokuUndo();
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'gomoku', payload }, fromPeerId);
            }
        }
        else if (action === 'skip-turn') {
            applyGomokuSkipTurn(payload.peerId, payload.elapsedSecs);
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'gomoku', payload }, fromPeerId);
            }
        }
        else if (action === 'quit') {
            applyGomokuQuit(payload.peerId);
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'gomoku', payload }, fromPeerId);
            }
        }
        else if (action === 'cancel') {
            showToast('🛑 오목 대결이 취소되었습니다.');
            resetGomoku();
            $gomokuOverlay.hidden = true;

            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'gomoku', payload }, fromPeerId);
            }
        }
    }

    function cancelGomokuProposal() {
        if (gomokuState.isSolo) {
            resetGomoku();
            $gomokuOverlay.hidden = true;
            return;
        }
        network.sendGomoku({
            action: 'cancel'
        });
    }

    function hostStartGomoku() {
        if (!network.isHost) return;

        const proposer = gomokuState.participants.find(p => p.peerId === gomokuState.proposerId);
        const acceptor = gomokuState.participants.find(p => p.peerId !== gomokuState.proposerId && p.accepted === true);

        if (!proposer || !acceptor) {
            showToast('⚠️ 대국을 시작할 대국자가 부족합니다.');
            return;
        }

        // Randomly assign black/white (50% chance)
        const isProposerBlack = Math.random() < 0.5;
        const players = [
            {
                peerId: proposer.peerId,
                nickname: proposer.nickname,
                color: proposer.color,
                role: isProposerBlack ? 'black' : 'white'
            },
            {
                peerId: acceptor.peerId,
                nickname: acceptor.nickname,
                color: acceptor.color,
                role: isProposerBlack ? 'white' : 'black'
            }
        ];

        // Black plays first
        const blackPlayer = players.find(p => p.role === 'black');
        const whitePlayer = players.find(p => p.role === 'white');
        const turnOrder = [blackPlayer.peerId, whitePlayer.peerId];

        network.sendGomoku({
            action: 'start',
            board: Array(15).fill(null).map(() => Array(15).fill(0)),
            players: players,
            turnOrder: turnOrder
        });
    }

    function updateGomokuProposalListUI() {
        $gomokuProposalList.innerHTML = '';
        gomokuState.participants.forEach(p => {
            const li = document.createElement('li');
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            
            const dot = document.createElement('span');
            dot.className = 'status-dot';
            dot.style.background = p.color;
            nameSpan.appendChild(dot);
            
            const nameText = document.createTextNode(p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname);
            nameSpan.appendChild(nameText);
            
            li.appendChild(nameSpan);

            const statusSpan = document.createElement('span');
            statusSpan.className = 'status-text';

            if (p.accepted === true) {
                statusSpan.textContent = '수락';
                statusSpan.style.color = '#10b981';
            } else if (p.accepted === false) {
                statusSpan.textContent = '거절';
                statusSpan.style.color = '#ef4444';
            } else {
                statusSpan.textContent = '대기 중';
                statusSpan.style.color = '#ffd32a';
            }
            li.appendChild(statusSpan);

            $gomokuProposalList.appendChild(li);
        });

        if (network.isHost) {
            const acceptedCount = gomokuState.participants.filter(p => p.peerId !== gomokuState.proposerId && p.accepted === true).length;
            $btnGomokuStart.disabled = (acceptedCount === 0 && gomokuState.proposerId !== network.myPeerId);
        }
    }

    function buildGomokuBoardDOM() {
        $gomokuBoard.innerHTML = '';
        const isSpectator = !gomokuState.turnOrder.includes(network.myPeerId);

        const starPoints = [
            [3, 3], [3, 7], [3, 11],
            [7, 3], [7, 7], [7, 11],
            [11, 3], [11, 7], [11, 11]
        ];

        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                const cell = document.createElement('div');
                cell.className = 'gomoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Render Star points
                const isStar = starPoints.some(([sr, sc]) => sr === r && sc === c);
                if (isStar) {
                    const star = document.createElement('div');
                    star.className = 'gomoku-cell-star';
                    cell.appendChild(star);
                }

                // Render Stones
                const val = gomokuState.board[r][c];
                if (val !== 0) {
                    const stone = document.createElement('div');
                    stone.className = `gomoku-stone ${val === 1 ? 'black' : 'white'}`;
                    if (gomokuState.lastMove && gomokuState.lastMove.r === r && gomokuState.lastMove.c === c) {
                        stone.classList.add('last-move');
                    }
                    cell.appendChild(stone);
                }

                cell.addEventListener('click', () => {
                    if (isSpectator) return;
                    placeGomokuStone(r, c);
                });

                $gomokuBoard.appendChild(cell);
            }
        }
    }

    function getGomokuCellElement(r, c) {
        return $gomokuBoard.querySelector(`.gomoku-cell[data-row="${r}"][data-col="${c}"]`);
    }

    function placeGomokuStone(r, c) {
        if (gomokuState.status !== 'playing') return;
        if (gomokuState.board[r][c] !== 0) return; // Cell is already occupied

        let isMyTurn = false;
        let role = 'black';
        let peerId = network.myPeerId;

        if (gomokuState.isSolo) {
            isMyTurn = true;
            role = gomokuState.soloTurn;
        } else {
            const activePeerId = gomokuState.turnOrder[gomokuState.currentTurnIndex];
            isMyTurn = activePeerId === network.myPeerId;
            if (!isMyTurn) {
                showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
                return;
            }
            const me = gomokuState.players.find(p => p.peerId === network.myPeerId);
            if (me) {
                role = me.role;
            }
        }

        if (!isMyTurn) return;

        const elapsed = (performance.now() - gomokuState.turnStartTime) / 1000;

        if (gomokuState.isSolo) {
            applyGomokuMove(peerId, r, c, role, elapsed);
        } else {
            network.sendGomoku({
                action: 'move',
                peerId: network.myPeerId,
                r, c, role,
                elapsedSecs: elapsed
            });
            if (!network.isHost) {
                applyGomokuMove(network.myPeerId, r, c, role, elapsed);
            }
        }
    }

    function applyGomokuMove(peerId, r, c, role, elapsed) {
        clearInterval(gomokuState.turnTimerInterval);

        const roleVal = role === 'black' ? 1 : 2;
        gomokuState.board[r][c] = roleVal;
        
        // Update lastMove visual feedback
        if (gomokuState.lastMove) {
            const prevEl = getGomokuCellElement(gomokuState.lastMove.r, gomokuState.lastMove.c);
            if (prevEl) {
                const stoneEl = prevEl.querySelector('.gomoku-stone');
                if (stoneEl) stoneEl.classList.remove('last-move');
            }
        }
        gomokuState.lastMove = { r, c };

        // Save move history for Undo function
        gomokuState.history.push({ r, c, val: roleVal, peerId, role });

        // Update player stats
        const pState = gomokuState.participants.find(p => p.peerId === peerId);
        if (pState) {
            pState.totalTime += elapsed;
            pState.correctCount++; 
        }

        // Render the stone in the board DOM
        const cellEl = getGomokuCellElement(r, c);
        if (cellEl) {
            const stone = document.createElement('div');
            stone.className = `gomoku-stone ${role} last-move`;
            cellEl.appendChild(stone);
        }

        // Win check
        if (checkGomokuWin(r, c, roleVal)) {
            endGomokuGame(peerId, role);
            return;
        }

        // Check for Board Full (Draw)
        let isFull = true;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (gomokuState.board[i][j] === 0) {
                    isFull = false;
                    break;
                }
            }
        }
        if (isFull) {
            endGomokuGame(null, 'draw');
            return;
        }

        // Advance to next turn
        if (gomokuState.isSolo) {
            gomokuState.soloTurn = gomokuState.soloTurn === 'black' ? 'white' : 'black';
            advanceGomokuTurn();
        } else {
            advanceGomokuTurn();
        }
    }

    function checkGomokuWin(r, c, roleVal) {
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]], // Diagonal Down-Right
            [[1, -1], [-1, 1]]  // Diagonal Up-Right
        ];

        for (const dir of directions) {
            let count = 1; 
            for (const [dr, dc] of dir) {
                let nr = r + dr;
                let nc = c + dc;
                while (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && gomokuState.board[nr][nc] === roleVal) {
                    count++;
                    nr += dr;
                    nc += dc;
                }
            }
            if (count >= 5) {
                return true; 
            }
        }
        return false;
    }

    function undoGomokuMove() {
        if (gomokuState.status !== 'playing') return;
        if (gomokuState.history.length === 0) return;

        if (gomokuState.isSolo) {
            applyGomokuUndo();
        } else {
            // Check if active player's turn to send undo request, or just allow direct network sync for simplicity
            network.sendGomoku({
                action: 'undo'
            });
            if (!network.isHost) {
                applyGomokuUndo();
            }
        }
    }

    function applyGomokuUndo() {
        if (gomokuState.history.length === 0) return;
        clearInterval(gomokuState.turnTimerInterval);

        const lastAction = gomokuState.history.pop();
        const { r, c, val, peerId, role } = lastAction;

        gomokuState.board[r][c] = 0;

        // Remove stone from DOM
        const cellEl = getGomokuCellElement(r, c);
        if (cellEl) {
            const stoneEl = cellEl.querySelector('.gomoku-stone');
            if (stoneEl) stoneEl.remove();
        }

        // Restore lastMove pointer
        if (gomokuState.lastMove && gomokuState.lastMove.r === r && gomokuState.lastMove.c === c) {
            if (gomokuState.history.length > 0) {
                const prevAction = gomokuState.history[gomokuState.history.length - 1];
                gomokuState.lastMove = { r: prevAction.r, c: prevAction.c };
                const prevEl = getGomokuCellElement(prevAction.r, prevAction.c);
                if (prevEl) {
                    const prevStone = prevEl.querySelector('.gomoku-stone');
                    if (prevStone) prevStone.classList.add('last-move');
                }
            } else {
                gomokuState.lastMove = null;
            }
        }

        // Revert stats
        const pState = gomokuState.participants.find(p => p.peerId === peerId);
        if (pState) {
            pState.correctCount = Math.max(0, pState.correctCount - 1);
        }

        // Revert active turn
        if (gomokuState.isSolo) {
            gomokuState.soloTurn = role;
        } else {
            const idx = gomokuState.turnOrder.indexOf(peerId);
            if (idx !== -1) {
                gomokuState.currentTurnIndex = idx;
            }
        }

        showToast(`↩️ 한 수를 물렀습니다.`);
        startGomokuTurn();
    }

    function quitGomokuGame() {
        if (gomokuState.isSolo) {
            resetGomoku();
            $gomokuOverlay.hidden = true;
            return;
        }

        network.sendGomoku({
            action: 'quit',
            peerId: network.myPeerId
        });
        if (!network.isHost) {
            applyGomokuQuit(network.myPeerId);
        }
    }

    function applyGomokuQuit(quitterId) {
        clearInterval(gomokuState.turnTimerInterval);
        clearInterval(gomokuState.gameTimerInterval);

        gomokuState.status = 'finished';
        showGomokuSubView('result');

        const isMe = quitterId === network.myPeerId;
        if (isMe) {
            $gomokuResultTitle.textContent = '💀 기권 패배 💀';
            $gomokuResultTitle.className = 'error-title';
            $gomokuResultMsg.textContent = '대국을 기권하여 패배하였습니다.';
        } else {
            $gomokuResultTitle.textContent = '🏆 기권 승리! 🏆';
            $gomokuResultTitle.className = '';
            $gomokuResultMsg.textContent = '상대방이 기권하여 승리하였습니다!';
        }

        renderGomokuFinalResult();
    }

    function endGomokuGame(winnerPeerId, winnerRole) {
        clearInterval(gomokuState.turnTimerInterval);
        clearInterval(gomokuState.gameTimerInterval);

        gomokuState.status = 'finished';
        showGomokuSubView('result');

        if (winnerPeerId === null) {
            $gomokuResultTitle.textContent = '🤝 무승부 🤝';
            $gomokuResultTitle.className = '';
            $gomokuResultMsg.textContent = '바둑판이 가득 차 승패를 가리지 못했습니다.';
        } else {
            const isMe = winnerPeerId === network.myPeerId;
            const name = getPeerNickname(winnerPeerId);
            const roleKorean = winnerRole === 'black' ? '흑돌' : '백돌';

            if (isMe) {
                $gomokuResultTitle.textContent = '🏆 대국 승리! 🏆';
                $gomokuResultTitle.className = '';
                $gomokuResultMsg.textContent = `축하합니다! ${roleKorean}로 5목을 먼저 완성하여 승리하셨습니다.`;
            } else {
                $gomokuResultTitle.textContent = '💀 대국 패배 💀';
                $gomokuResultTitle.className = 'error-title';
                $gomokuResultMsg.textContent = `${escapeHtml(name)}님이 ${roleKorean}로 5목을 먼저 완성하여 승리하셨습니다.`;
            }
        }

        renderGomokuFinalResult();
    }

    function startGomokuGameTimer() {
        gomokuState.gameStartTime = Date.now();
        gomokuState.gameSecondsElapsed = 0;
        $gomokuGameTimer.textContent = '00:00';

        gomokuState.gameTimerInterval = setInterval(() => {
            gomokuState.gameSecondsElapsed++;
            $gomokuGameTimer.textContent = formatSudokuTime(gomokuState.gameSecondsElapsed);
        }, 1000);
    }

    function startGomokuTurn() {
        if (gomokuState.status !== 'playing') return;

        gomokuState.turnStartTime = performance.now();
        gomokuState.secondsRemaining = gomokuState.turnTimeLimit;

        let isMyTurn = false;
        let activeName = '';
        let activePeerId = '';
        let activeRole = 'black';

        if (gomokuState.isSolo) {
            isMyTurn = true;
            activePeerId = network.myPeerId;
            activeName = network.nickname;
            activeRole = gomokuState.soloTurn;
        } else {
            activePeerId = gomokuState.turnOrder[gomokuState.currentTurnIndex];
            isMyTurn = activePeerId === network.myPeerId;
            const activePlayer = gomokuState.players.find(p => p.peerId === activePeerId);
            activeName = activePlayer ? activePlayer.nickname : '알 수 없음';
            activeRole = activePlayer ? activePlayer.role : 'black';
        }

        const roleText = activeRole === 'black' ? '⚫ 흑돌' : '⚪ 백돌';
        $gomokuCurrentTurnIcon.textContent = roleText;

        const $boardWrapper = $gomokuBoard.parentElement;
        if ($boardWrapper) {
            if (isMyTurn) {
                $boardWrapper.classList.add('my-turn');
                $boardWrapper.classList.remove('other-turn');
            } else {
                $boardWrapper.classList.add('other-turn');
                $boardWrapper.classList.remove('my-turn');
            }
        }

        if (isMyTurn) {
            if (gomokuState.isSolo) {
                $gomokuTurnStatus.innerHTML = `👑 <span style="color:#00d4ff; font-weight:bold;">차례: ${roleText}</span> (남은 시간: <span id="gomokuTurnTimerSecs">${gomokuState.secondsRemaining}</span>초)`;
            } else {
                $gomokuTurnStatus.innerHTML = `👑 <span style="color:#00d4ff; font-weight:bold;">내 차례입니다! (${roleText})</span> (남은 시간: <span id="gomokuTurnTimerSecs">${gomokuState.secondsRemaining}</span>초)`;
            }
        } else {
            $gomokuTurnStatus.innerHTML = `⏳ <b>${escapeHtml(activeName)}</b> 님의 턴 (${roleText}) (남은 시간: <span id="gomokuTurnTimerSecs">${gomokuState.secondsRemaining}</span>초)`;
        }

        updateGomokuPlayersListUI();

        $gomokuTurnTimerProgress.style.width = '100%';
        $gomokuTurnTimerProgress.className = 'sudoku-progress-fill';

        gomokuState.turnTimerInterval = setInterval(() => {
            gomokuState.secondsRemaining--;
            
            const timerEl = document.getElementById('gomokuTurnTimerSecs');
            if (timerEl) timerEl.textContent = gomokuState.secondsRemaining;

            const pct = (gomokuState.secondsRemaining / gomokuState.turnTimeLimit) * 100;
            $gomokuTurnTimerProgress.style.width = `${pct}%`;

            if (pct <= 25) {
                $gomokuTurnTimerProgress.className = 'sudoku-progress-fill danger';
            } else if (pct <= 50) {
                $gomokuTurnTimerProgress.className = 'sudoku-progress-fill warning';
            }

            if (gomokuState.secondsRemaining <= 0) {
                clearInterval(gomokuState.turnTimerInterval);
                
                if (isMyTurn) {
                    if (gomokuState.isSolo) {
                        applyGomokuSkipTurn(network.myPeerId, gomokuState.turnTimeLimit);
                        return;
                    }

                    network.sendGomoku({
                        action: 'skip-turn',
                        peerId: network.myPeerId,
                        elapsedSecs: gomokuState.turnTimeLimit
                    });
                    if (!network.isHost) {
                        applyGomokuSkipTurn(network.myPeerId, gomokuState.turnTimeLimit);
                    }
                }
            }
        }, 1000);
    }

    function applyGomokuSkipTurn(peerId, elapsed) {
        clearInterval(gomokuState.turnTimerInterval);

        const player = gomokuState.participants.find(p => p.peerId === peerId);
        if (player) {
            player.totalTime += elapsed;
        }

        showToast(`⏰ 시간 초과! 차례가 넘어갑니다.`);

        if (gomokuState.status === 'playing') {
            if (gomokuState.isSolo) {
                gomokuState.soloTurn = gomokuState.soloTurn === 'black' ? 'white' : 'black';
            }
            advanceGomokuTurn();
        }
    }

    function advanceGomokuTurn() {
        if (gomokuState.turnOrder.length === 0) return;
        gomokuState.currentTurnIndex = (gomokuState.currentTurnIndex + 1) % gomokuState.turnOrder.length;
        startGomokuTurn();
    }

    function updateGomokuPlayersListUI() {
        $gomokuPlayersList.innerHTML = '';

        if (gomokuState.isSolo) {
            const item = document.createElement('div');
            item.className = 'sudoku-leaderboard-item active';
            
            const pName = document.createElement('span');
            pName.className = 'player-name';
            pName.innerHTML = `<span class="player-color-dot" style="background:${network.myColor}"></span> 흑/백 교대 대국 (나)`;
            item.appendChild(pName);

            const score = document.createElement('span');
            score.className = 'player-score';
            score.textContent = `총 착수 ${gomokuState.history.length}회`;
            item.appendChild(score);

            $gomokuPlayersList.appendChild(item);
            return;
        }

        gomokuState.players.forEach(p => {
            const item = document.createElement('div');
            item.className = 'sudoku-leaderboard-item';
            
            const activePeerId = gomokuState.turnOrder[gomokuState.currentTurnIndex];
            if (p.peerId === activePeerId) {
                item.classList.add('active');
            }

            const pName = document.createElement('span');
            pName.className = 'player-name';
            
            const dot = document.createElement('span');
            dot.className = 'player-color-dot';
            dot.style.background = p.color;
            pName.appendChild(dot);
            
            const roleTxt = p.role === 'black' ? '⚫ 흑돌' : '⚪ 백돌';
            const nameTxt = document.createTextNode(`${p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname} (${roleTxt})`);
            pName.appendChild(nameTxt);
            item.appendChild(pName);

            const match = gomokuState.participants.find(x => x.peerId === p.peerId);
            const totalTime = match ? match.totalTime : 0;
            const placements = match ? match.correctCount : 0;

            const score = document.createElement('span');
            score.className = 'player-score';
            score.textContent = `${placements}수 둠 (${Math.round(totalTime)}초)`;
            item.appendChild(score);

            $gomokuPlayersList.appendChild(item);
        });
    }

    function renderGomokuFinalResult() {
        $gomokuResultStats.innerHTML = '';

        if (gomokuState.isSolo) {
            const statText = document.createElement('p');
            statText.innerHTML = `총 대국 시간: <b>${formatSudokuTime(gomokuState.gameSecondsElapsed)}</b><br>총 착수 수: <b>${gomokuState.history.length}수</b>`;
            $gomokuResultStats.appendChild(statText);
            return;
        }

        gomokuState.players.forEach(p => {
            const match = gomokuState.participants.find(x => x.peerId === p.peerId);
            const totalTime = match ? match.totalTime : 0;
            const placements = match ? match.correctCount : 0;
            const roleTxt = p.role === 'black' ? '흑돌' : '백돌';

            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justify = 'space-between';
            div.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
            div.style.paddingBottom = '4px';

            div.innerHTML = `
                <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${p.color}; margin-right:6px;"></span>${escapeHtml(p.nickname)} (${roleTxt})</span>
                <span><b>${placements}수</b> 둠 (평균 착수 시간: ${placements > 0 ? (totalTime / placements).toFixed(1) : 0}초)</span>
            `;
            $gomokuResultStats.appendChild(div);
        });
    }

    function handleGomokuPeerLeave(peerId) {
        if (gomokuState.status === 'proposing') {
            if (peerId === gomokuState.proposerId) {
                showToast('🛑 오목 제안자가 퇴장하여 제안이 취소되었습니다.');
                resetGomoku();
                $gomokuOverlay.hidden = true;
            } else {
                gomokuState.participants = gomokuState.participants.filter(p => p.peerId !== peerId);
                updateGomokuProposalListUI();
            }
        } else if (gomokuState.status === 'playing') {
            const hostId = network.getHostPeerId();
            if (peerId === hostId) {
                showToast('⚠️ 방장이 퇴장하여 오목 게임을 종료합니다.');
                resetGomoku();
                $gomokuOverlay.hidden = true;
                return;
            }

            if (gomokuState.turnOrder.includes(peerId)) {
                showToast(`🔴 참가자 ${escapeHtml(getPeerNickname(peerId))}님이 퇴장하여 대국이 중단됩니다.`);
                resetGomoku();
                $gomokuOverlay.hidden = true;
            }
        }
    }

    function syncGomokuStateFromHost(hostState) {
        gomokuState.status = 'playing';
        gomokuState.isSolo = false;
        gomokuState.board = hostState.board;
        gomokuState.lastMove = hostState.lastMove;
        gomokuState.players = hostState.players;
        gomokuState.turnOrder = hostState.turnOrder;
        gomokuState.currentTurnIndex = hostState.currentTurnIndex;
        gomokuState.history = hostState.history;

        gomokuState.participants = hostState.players.map(p => {
            const existing = gomokuState.participants.find(x => x.peerId === p.peerId);
            return {
                peerId: p.peerId,
                nickname: p.nickname,
                color: p.color,
                accepted: true,
                totalTime: existing ? existing.totalTime : 0,
                correctCount: existing ? existing.correctCount : 0
            };
        });

        $gomokuOverlay.hidden = false;
        showGomokuSubView('game');

        buildGomokuBoardDOM();

        resetGomokuTimers();
        
        gomokuState.gameSecondsElapsed = hostState.elapsedSeconds;
        $gomokuGameTimer.textContent = formatSudokuTime(gomokuState.gameSecondsElapsed);
        gomokuState.gameTimerInterval = setInterval(() => {
            gomokuState.gameSecondsElapsed++;
            $gomokuGameTimer.textContent = formatSudokuTime(gomokuState.gameSecondsElapsed);
        }, 1000);

        startGomokuTurn();
    }

    function resetGomokuTimers() {
        clearInterval(gomokuState.turnTimerInterval);
        clearInterval(gomokuState.gameTimerInterval);
    }

    function resetGomoku() {
        resetGomokuTimers();

        gomokuState = {
            status: 'none',
            isSolo: false,
            board: [],
            lastMove: null,
            proposerId: null,
            proposerNickname: null,
            participants: [],
            players: [],
            turnOrder: [],
            currentTurnIndex: 0,
            turnStartTime: 0,
            turnTimerInterval: null,
            turnTimeLimit: 30,
            secondsRemaining: 30,
            gameStartTime: 0,
            gameSecondsElapsed: 0,
            gameTimerInterval: null,
            history: [],
            soloTurn: 'black'
        };

        const $boardWrapper = $gomokuBoard.parentElement;
        if ($boardWrapper) {
            $boardWrapper.classList.remove('my-turn', 'other-turn');
        }

        $gomokuLobby.hidden = true;
        $gomokuGame.hidden = true;
        $gomokuResult.hidden = true;
    }

    function showGomokuSubView(view) {
        $gomokuLobby.hidden = (view !== 'lobby');
        $gomokuGame.hidden = (view !== 'game');
        $gomokuResult.hidden = (view !== 'result');
    }

    /* ==========================================================================
       🌗 OTHELLO GAME MULTIPLAYER MANAGER & ENGINE
       ========================================================================== */

    function setupOthelloEvents() {
        // Toolbar icon trigger
        $btnOthello.addEventListener('click', () => {
            if (othelloState.status === 'none') {
                $othelloOverlay.hidden = false;
                showOthelloSubView('lobby');
                $othelloLobbySetup.hidden = false;
                $othelloLobbyWaiting.hidden = true;
                $othelloLobbyInvite.hidden = true;
            } else {
                $othelloOverlay.hidden = false;
            }
        });

        // Close button
        $btnOthelloClose.addEventListener('click', () => {
            $othelloOverlay.hidden = true;
        });

        // Propose button click
        $btnOthelloPropose.addEventListener('click', () => {
            proposeOthello();
        });

        // Solo button click
        $btnOthelloSolo.addEventListener('click', () => {
            startOthelloSolo();
        });

        // Cancel proposal click
        $btnOthelloCancel.addEventListener('click', () => {
            cancelOthelloProposal();
        });

        // Host starts game
        $btnOthelloStart.addEventListener('click', () => {
            if (network.isHost) {
                hostStartOthello();
            }
        });

        // Accept invite
        $btnOthelloAccept.addEventListener('click', () => {
            guestRespondOthello(true);
        });

        // Decline invite
        $btnOthelloDecline.addEventListener('click', () => {
            guestRespondOthello(false);
        });

        // Exit / Quit button
        $btnOthelloQuit.addEventListener('click', async () => {
            const msg = othelloState.isSolo 
                ? '오셀로 게임을 종료하시겠습니까?' 
                : '오셀로 대결을 종료하시겠습니까? (참여자 전체의 게임이 취소됩니다)';
            if (await showCustomConfirm(msg)) {
                quitOthelloGame();
            }
        });

        // Close results screen
        $btnOthelloResultClose.addEventListener('click', () => {
            resetOthello();
            $othelloOverlay.hidden = true;
        });

        // Action panel triggers
        $btnOthelloUndo.addEventListener('click', () => {
            undoOthelloMove();
        });
    }

    function proposeOthello() {
        network.sendOthello({
            action: 'propose',
            proposerId: network.myPeerId,
            proposerNickname: network.nickname,
            proposerColor: network.myColor
        });
    }

    function startOthelloSolo() {
        othelloState.status = 'playing';
        othelloState.isSolo = true;
        othelloState.board = Array(8).fill(null).map(() => Array(8).fill(0));
        initOthelloBoard(othelloState.board);
        othelloState.lastMove = null;
        othelloState.history = [];
        othelloState.soloTurn = 'black';

        othelloState.participants = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                accepted: true,
                totalTime: 0,
                correctCount: 0
            }
        ];

        othelloState.players = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                role: 'black'
            }
        ];

        othelloState.turnOrder = [network.myPeerId];
        othelloState.currentTurnIndex = 0;

        $othelloOverlay.hidden = false;
        showOthelloSubView('game');
        
        buildOthelloBoardDOM();
        
        resetOthelloTimers();
        startOthelloGameTimer();
        startOthelloTurn();
    }

    function guestRespondOthello(accepted) {
        network.sendOthello({
            action: 'join-response',
            peerId: network.myPeerId,
            nickname: network.nickname,
            color: network.myColor,
            accepted: accepted
        });

        if (accepted) {
            $othelloLobbyInvite.hidden = true;
            $othelloLobbyWaiting.hidden = false;
            $othelloLobbyWaitingTitle.textContent = '방장이 게임을 시작하기를 기다리는 중...';
            $btnOthelloStart.hidden = true;
            $btnOthelloCancel.hidden = true;
        } else {
            resetOthello();
            $othelloOverlay.hidden = true;
        }
    }

    function handleOthelloNetworkMessage(fromPeerId, payload) {
        console.log('[Othello Network]', fromPeerId, payload);
        const action = payload.action;

        if (action === 'propose') {
            othelloState.status = 'proposing';
            othelloState.proposerId = payload.proposerId;
            othelloState.proposerNickname = payload.proposerNickname;
            othelloState.participants = [
                {
                    peerId: payload.proposerId,
                    nickname: payload.proposerNickname,
                    color: payload.proposerColor || getPeerColor(payload.proposerId),
                    accepted: true
                }
            ];

            $othelloOverlay.hidden = false;
            
            if (payload.proposerId === network.myPeerId) {
                showOthelloSubView('lobby');
                $othelloLobbySetup.hidden = true;
                $othelloLobbyWaiting.hidden = false;
                $othelloLobbyInvite.hidden = true;
                $othelloLobbyWaitingTitle.textContent = '오셀로 참가 대기 중';
                $btnOthelloStart.hidden = !network.isHost;
                $btnOthelloStart.disabled = true;
                updateOthelloProposalListUI();
            } else {
                showOthelloSubView('lobby');
                $othelloLobbySetup.hidden = true;
                $othelloLobbyWaiting.hidden = true;
                $othelloLobbyInvite.hidden = false;
                $othelloProposerName.textContent = payload.proposerNickname;
            }

            // Relay if host
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'othello', payload }, fromPeerId);
            }
        }
        else if (action === 'join-response') {
            if (network.isHost) {
                let p = othelloState.participants.find(x => x.peerId === payload.peerId);
                if (p) {
                    p.accepted = payload.accepted;
                } else {
                    othelloState.participants.push({
                        peerId: payload.peerId,
                        nickname: payload.nickname,
                        color: payload.color,
                        accepted: payload.accepted
                    });
                }
                network.sendOthello({
                    action: 'proposal-sync',
                    proposerId: othelloState.proposerId,
                    proposerNickname: othelloState.proposerNickname,
                    participants: othelloState.participants
                });
            }
        }
        else if (action === 'proposal-sync') {
            othelloState.proposerId = payload.proposerId;
            othelloState.proposerNickname = payload.proposerNickname;
            othelloState.participants = payload.participants;

            updateOthelloProposalListUI();
        }
        else if (action === 'start') {
            othelloState.status = 'playing';
            othelloState.isSolo = false;
            othelloState.board = payload.board;
            othelloState.lastMove = null;
            othelloState.history = [];

            othelloState.participants.forEach(p => {
                p.totalTime = 0;
                p.correctCount = 0;
            });

            othelloState.players = payload.players.map(p => ({
                peerId: p.peerId,
                nickname: p.nickname,
                color: p.color,
                role: p.role // 'black' or 'white'
            }));

            othelloState.turnOrder = payload.turnOrder;
            othelloState.currentTurnIndex = 0;

            showOthelloSubView('game');
            buildOthelloBoardDOM();

            resetOthelloTimers();
            startOthelloGameTimer();
            startOthelloTurn();
        }
        else if (action === 'move') {
            applyOthelloMove(payload.peerId, payload.r, payload.c, payload.role, payload.elapsedSecs);
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'othello', payload }, fromPeerId);
            }
        }
        else if (action === 'undo') {
            applyOthelloUndo();
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'othello', payload }, fromPeerId);
            }
        }
        else if (action === 'skip-turn') {
            applyOthelloSkipTurn(payload.peerId, payload.elapsedSecs);
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'othello', payload }, fromPeerId);
            }
        }
        else if (action === 'quit') {
            applyOthelloQuit(payload.peerId);
            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'othello', payload }, fromPeerId);
            }
        }
        else if (action === 'cancel') {
            showToast('🛑 오셀로 대결이 취소되었습니다.');
            resetOthello();
            $othelloOverlay.hidden = true;

            if (network.isHost && fromPeerId !== network.myPeerId) {
                network._broadcast({ type: 'othello', payload }, fromPeerId);
            }
        }
    }

    function cancelOthelloProposal() {
        if (othelloState.isSolo) {
            resetOthello();
            $othelloOverlay.hidden = true;
            return;
        }
        network.sendOthello({
            action: 'cancel'
        });
    }

    function hostStartOthello() {
        if (!network.isHost) return;

        const proposer = othelloState.participants.find(p => p.peerId === othelloState.proposerId);
        const acceptor = othelloState.participants.find(p => p.peerId !== othelloState.proposerId && p.accepted === true);

        if (!proposer || !acceptor) {
            showToast('⚠️ 대국을 시작할 대국자가 부족합니다.');
            return;
        }

        const isProposerBlack = Math.random() < 0.5;
        const players = [
            {
                peerId: proposer.peerId,
                nickname: proposer.nickname,
                color: proposer.color,
                role: isProposerBlack ? 'black' : 'white'
            },
            {
                peerId: acceptor.peerId,
                nickname: acceptor.nickname,
                color: acceptor.color,
                role: isProposerBlack ? 'white' : 'black'
            }
        ];

        const blackPlayer = players.find(p => p.role === 'black');
        const whitePlayer = players.find(p => p.role === 'white');
        const turnOrder = [blackPlayer.peerId, whitePlayer.peerId];

        const initialBoard = Array(8).fill(null).map(() => Array(8).fill(0));
        initOthelloBoard(initialBoard);

        network.sendOthello({
            action: 'start',
            board: initialBoard,
            players: players,
            turnOrder: turnOrder
        });
    }

    function updateOthelloProposalListUI() {
        $othelloProposalList.innerHTML = '';
        othelloState.participants.forEach(p => {
            const li = document.createElement('li');
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            
            const dot = document.createElement('span');
            dot.className = 'status-dot';
            dot.style.background = p.color;
            nameSpan.appendChild(dot);
            
            const nameText = document.createTextNode(p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname);
            nameSpan.appendChild(nameText);
            
            li.appendChild(nameSpan);

            const statusSpan = document.createElement('span');
            statusSpan.className = 'status-text';

            if (p.accepted === true) {
                statusSpan.textContent = '수락';
                statusSpan.style.color = '#10b981';
            } else if (p.accepted === false) {
                statusSpan.textContent = '거절';
                statusSpan.style.color = '#ef4444';
            } else {
                statusSpan.textContent = '대기 중';
                statusSpan.style.color = '#ffd32a';
            }
            li.appendChild(statusSpan);

            $othelloProposalList.appendChild(li);
        });

        if (network.isHost) {
            const acceptedCount = othelloState.participants.filter(p => p.peerId !== othelloState.proposerId && p.accepted === true).length;
            $btnOthelloStart.disabled = (acceptedCount === 0 && othelloState.proposerId !== network.myPeerId);
        }
    }

    function initOthelloBoard(board) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                board[r][c] = 0;
            }
        }
        board[3][3] = 2; // White
        board[4][4] = 2; // White
        board[3][4] = 1; // Black
        board[4][3] = 1; // Black
    }

    function isValidOthelloMove(board, r, c, roleVal) {
        if (board[r][c] !== 0) return false;
        const opponentVal = roleVal === 1 ? 2 : 1;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            let foundOpponent = false;

            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                if (board[nr][nc] === opponentVal) {
                    foundOpponent = true;
                } else if (board[nr][nc] === roleVal) {
                    if (foundOpponent) {
                        return true; 
                    }
                    break;
                } else {
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }
        return false;
    }

    function getValidOthelloMoves(board, roleVal) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (isValidOthelloMove(board, r, c, roleVal)) {
                    moves.push({ r, c });
                }
            }
        }
        return moves;
    }

    function flipOthelloStones(board, r, c, roleVal) {
        const opponentVal = roleVal === 1 ? 2 : 1;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        let flipped = [];

        board[r][c] = roleVal;

        for (const [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            let tempFlipped = [];

            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                if (board[nr][nc] === opponentVal) {
                    tempFlipped.push({ r: nr, c: nc });
                } else if (board[nr][nc] === roleVal) {
                    if (tempFlipped.length > 0) {
                        for (const cell of tempFlipped) {
                            board[cell.r][cell.c] = roleVal;
                            flipped.push(cell);
                        }
                    }
                    break;
                } else {
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }
        return flipped;
    }

    function getOthelloStoneCounts() {
        let black = 0;
        let white = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (othelloState.board[r][c] === 1) black++;
                else if (othelloState.board[r][c] === 2) white++;
            }
        }
        return { black, white };
    }

    function updateOthelloScoreDisplay() {
        const score = getOthelloStoneCounts();
        $othelloBlackCount.textContent = score.black;
        $othelloWhiteCount.textContent = score.white;
    }

    function buildOthelloBoardDOM() {
        $othelloBoard.innerHTML = '';
        
        let activeRoleVal = 1;
        if (othelloState.isSolo) {
            activeRoleVal = othelloState.soloTurn === 'black' ? 1 : 2;
        } else {
            const activePeerId = othelloState.turnOrder[othelloState.currentTurnIndex];
            const activePlayer = othelloState.players.find(p => p.peerId === activePeerId);
            if (activePlayer) activeRoleVal = activePlayer.role === 'black' ? 1 : 2;
        }

        const hints = getValidOthelloMoves(othelloState.board, activeRoleVal);
        const isSpectator = !othelloState.turnOrder.includes(network.myPeerId);
        
        let showHints = false;
        if (othelloState.isSolo) {
            showHints = true;
        } else {
            const activePeerId = othelloState.turnOrder[othelloState.currentTurnIndex];
            showHints = (activePeerId === network.myPeerId);
        }

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'othello-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Render Hints
                if (showHints && !isSpectator && hints.some(h => h.r === r && h.c === c)) {
                    const hintDot = document.createElement('div');
                    hintDot.className = 'othello-cell-hint';
                    cell.appendChild(hintDot);
                }

                // Render Stones
                const val = othelloState.board[r][c];
                if (val !== 0) {
                    const stone = document.createElement('div');
                    stone.className = `othello-stone ${val === 1 ? 'black' : 'white'}`;
                    if (othelloState.lastMove && othelloState.lastMove.r === r && othelloState.lastMove.c === c) {
                        stone.classList.add('last-move');
                    }
                    cell.appendChild(stone);
                }

                cell.addEventListener('click', () => {
                    if (isSpectator) return;
                    placeOthelloStone(r, c);
                });

                $othelloBoard.appendChild(cell);
            }
        }
        updateOthelloScoreDisplay();
    }

    function getOthelloCellElement(r, c) {
        return $othelloBoard.querySelector(`.othello-cell[data-row="${r}"][data-col="${c}"]`);
    }

    function placeOthelloStone(r, c) {
        if (othelloState.status !== 'playing') return;

        let isMyTurn = false;
        let role = 'black';
        let peerId = network.myPeerId;

        if (othelloState.isSolo) {
            isMyTurn = true;
            role = othelloState.soloTurn;
        } else {
            const activePeerId = othelloState.turnOrder[othelloState.currentTurnIndex];
            isMyTurn = activePeerId === network.myPeerId;
            if (!isMyTurn) {
                showToast('⚠️ 지금은 자신의 턴이 아닙니다!');
                return;
            }
            const me = othelloState.players.find(p => p.peerId === network.myPeerId);
            if (me) {
                role = me.role;
            }
        }

        if (!isMyTurn) return;

        // Verify valid reversi move
        const roleVal = role === 'black' ? 1 : 2;
        if (!isValidOthelloMove(othelloState.board, r, c, roleVal)) {
            showToast('⚠️ 여기에 돌을 둘 수 없습니다! 상대방 돌을 가둘 수 있는 자리를 선택하세요.');
            return;
        }

        const elapsed = (performance.now() - othelloState.turnStartTime) / 1000;

        if (othelloState.isSolo) {
            applyOthelloMove(peerId, r, c, role, elapsed);
        } else {
            network.sendOthello({
                action: 'move',
                peerId: network.myPeerId,
                r, c, role,
                elapsedSecs: elapsed
            });
            if (!network.isHost) {
                applyOthelloMove(network.myPeerId, r, c, role, elapsed);
            }
        }
    }

    function applyOthelloMove(peerId, r, c, role, elapsed) {
        clearInterval(othelloState.turnTimerInterval);

        // Save board state snapshot *before* making the move so undo can restore it perfectly
        const boardSnapshot = othelloState.board.map(row => [...row]);
        othelloState.history.push({
            boardState: boardSnapshot,
            turnIndex: othelloState.currentTurnIndex,
            soloTurn: othelloState.soloTurn,
            lastMove: othelloState.lastMove ? { ...othelloState.lastMove } : null
        });

        const roleVal = role === 'black' ? 1 : 2;
        
        // Place stone and flip standard reversi cells
        const flippedCells = flipOthelloStones(othelloState.board, r, c, roleVal);

        // Update lastMove pointers
        if (othelloState.lastMove) {
            const prevEl = getOthelloCellElement(othelloState.lastMove.r, othelloState.lastMove.c);
            if (prevEl) {
                const stoneEl = prevEl.querySelector('.othello-stone');
                if (stoneEl) stoneEl.classList.remove('last-move');
            }
        }
        othelloState.lastMove = { r, c };

        // Update stats
        const pState = othelloState.participants.find(p => p.peerId === peerId);
        if (pState) {
            pState.totalTime += elapsed;
            pState.correctCount++;
        }

        // Render the newly placed stone
        const cellEl = getOthelloCellElement(r, c);
        if (cellEl) {
            const stone = document.createElement('div');
            stone.className = `othello-stone ${role} last-move`;
            cellEl.appendChild(stone);
        }

        // Apply flip animations (Wait 10ms for DOM insertion to trigger transition nicely)
        setTimeout(() => {
            flippedCells.forEach(cell => {
                const cEl = getOthelloCellElement(cell.r, cell.c);
                if (cEl) {
                    const st = cEl.querySelector('.othello-stone');
                    if (st) {
                        st.className = `othello-stone ${role}`;
                        st.style.transform = 'scale(1.2) rotateY(180deg)';
                        setTimeout(() => {
                            st.style.transform = 'scale(1) rotateY(0deg)';
                        }, 250);
                    }
                }
            });
        }, 10);

        updateOthelloScoreDisplay();

        // Check if game has ended
        const counts = getOthelloStoneCounts();
        if (counts.black === 0 || counts.white === 0 || (counts.black + counts.white === 64)) {
            setTimeout(() => {
                if (counts.black > counts.white) {
                    const bp = othelloState.players.find(x => x.role === 'black');
                    endOthelloGame(bp ? bp.peerId : null, 'black');
                } else if (counts.white > counts.black) {
                    const wp = othelloState.players.find(x => x.role === 'white');
                    endOthelloGame(wp ? wp.peerId : null, 'white');
                } else {
                    endOthelloGame(null, 'draw');
                }
            }, 600);
            return;
        }

        // Advance turn (with Pass logic inside)
        if (othelloState.isSolo) {
            othelloState.soloTurn = othelloState.soloTurn === 'black' ? 'white' : 'black';
            advanceOthelloTurn();
        } else {
            advanceOthelloTurn();
        }
    }

    function undoOthelloMove() {
        if (othelloState.status !== 'playing') return;
        if (othelloState.history.length === 0) return;

        if (othelloState.isSolo) {
            applyOthelloUndo();
        } else {
            network.sendOthello({
                action: 'undo'
            });
            if (!network.isHost) {
                applyOthelloUndo();
            }
        }
    }

    function applyOthelloUndo() {
        if (othelloState.history.length === 0) return;
        clearInterval(othelloState.turnTimerInterval);

        const lastSnapshot = othelloState.history.pop();
        const { boardState, turnIndex, soloTurn, lastMove } = lastSnapshot;

        // Restore state
        othelloState.board = boardState;
        othelloState.currentTurnIndex = turnIndex;
        othelloState.soloTurn = soloTurn;
        othelloState.lastMove = lastMove;

        // Re-render board DOM to reflect previous snapshot
        buildOthelloBoardDOM();

        showToast(`↩️ 한 수를 물렀습니다.`);
        startOthelloTurn();
    }

    function quitOthelloGame() {
        if (othelloState.isSolo) {
            resetOthello();
            $othelloOverlay.hidden = true;
            return;
        }

        network.sendOthello({
            action: 'quit',
            peerId: network.myPeerId
        });
        if (!network.isHost) {
            applyOthelloQuit(network.myPeerId);
        }
    }

    function applyOthelloQuit(quitterId) {
        clearInterval(othelloState.turnTimerInterval);
        clearInterval(othelloState.gameTimerInterval);

        othelloState.status = 'finished';
        showOthelloSubView('result');

        const isMe = quitterId === network.myPeerId;
        if (isMe) {
            $othelloResultTitle.textContent = '💀 기권 패배 💀';
            $othelloResultTitle.className = 'error-title';
            $othelloResultMsg.textContent = '대국을 기권하여 패배하였습니다.';
        } else {
            $othelloResultTitle.textContent = '🏆 기권 승리! 🏆';
            $othelloResultTitle.className = '';
            $othelloResultMsg.textContent = '상대방이 기권하여 승리하였습니다!';
        }

        renderOthelloFinalResult();
    }

    function endOthelloGame(winnerPeerId, winnerRole) {
        clearInterval(othelloState.turnTimerInterval);
        clearInterval(othelloState.gameTimerInterval);

        othelloState.status = 'finished';
        showOthelloSubView('result');

        const score = getOthelloStoneCounts();

        if (winnerPeerId === null && winnerRole === 'draw') {
            $othelloResultTitle.textContent = '🤝 무승부 🤝';
            $othelloResultTitle.className = '';
            $othelloResultMsg.textContent = `양쪽 모두 ${score.black}개로 무승부를 기록하였습니다.`;
        } else {
            const isMe = winnerPeerId === network.myPeerId;
            const name = getPeerNickname(winnerPeerId);
            const roleKorean = winnerRole === 'black' ? '흑돌' : '백돌';

            if (isMe) {
                $othelloResultTitle.textContent = '🏆 대국 승리! 🏆';
                $othelloResultTitle.className = '';
                $othelloResultMsg.textContent = `축하합니다! ${roleKorean}로 더 많은 돌(${roleKorean === '흑돌' ? score.black : score.white}개)을 차지하여 승리하셨습니다.`;
            } else {
                $othelloResultTitle.textContent = '💀 대국 패배 💀';
                $othelloResultTitle.className = 'error-title';
                $othelloResultMsg.textContent = `${escapeHtml(name)}님이 ${roleKorean}로 더 많은 돌(${roleKorean === '흑돌' ? score.black : score.white}개)을 차지하여 승리하셨습니다.`;
            }
        }

        renderOthelloFinalResult();
    }

    function startOthelloGameTimer() {
        othelloState.gameStartTime = Date.now();
        othelloState.gameSecondsElapsed = 0;
        $othelloGameTimer.textContent = '00:00';

        othelloState.gameTimerInterval = setInterval(() => {
            othelloState.gameSecondsElapsed++;
            $othelloGameTimer.textContent = formatSudokuTime(othelloState.gameSecondsElapsed);
        }, 1000);
    }

    function startOthelloTurn() {
        if (othelloState.status !== 'playing') return;

        othelloState.turnStartTime = performance.now();
        othelloState.secondsRemaining = othelloState.turnTimeLimit;

        let isMyTurn = false;
        let activeName = '';
        let activePeerId = '';
        let activeRole = 'black';

        if (othelloState.isSolo) {
            isMyTurn = true;
            activePeerId = network.myPeerId;
            activeName = network.nickname;
            activeRole = othelloState.soloTurn;
        } else {
            activePeerId = othelloState.turnOrder[othelloState.currentTurnIndex];
            isMyTurn = activePeerId === network.myPeerId;
            const activePlayer = othelloState.players.find(p => p.peerId === activePeerId);
            activeName = activePlayer ? activePlayer.nickname : '알 수 없음';
            activeRole = activePlayer ? activePlayer.role : 'black';
        }

        const roleText = activeRole === 'black' ? '⚫ 흑돌' : '⚪ 백돌';
        $othelloCurrentTurnIcon.textContent = roleText;

        const $boardWrapper = $othelloBoard.parentElement;
        if ($boardWrapper) {
            if (isMyTurn) {
                $boardWrapper.classList.add('my-turn');
                $boardWrapper.classList.remove('other-turn');
            } else {
                $boardWrapper.classList.add('other-turn');
                $boardWrapper.classList.remove('my-turn');
            }
        }

        if (isMyTurn) {
            if (othelloState.isSolo) {
                $othelloTurnStatus.innerHTML = `👑 <span style="color:#00d4ff; font-weight:bold;">차례: ${roleText}</span> (남은 시간: <span id="othelloTurnTimerSecs">${othelloState.secondsRemaining}</span>초)`;
            } else {
                $othelloTurnStatus.innerHTML = `👑 <span style="color:#00d4ff; font-weight:bold;">내 차례입니다! (${roleText})</span> (남은 시간: <span id="othelloTurnTimerSecs">${othelloState.secondsRemaining}</span>초)`;
            }
        } else {
            $othelloTurnStatus.innerHTML = `⏳ <b>${escapeHtml(activeName)}</b> 님의 턴 (${roleText}) (남은 시간: <span id="othelloTurnTimerSecs">${othelloState.secondsRemaining}</span>초)`;
        }

        // Build grid with new hints and listeners
        buildOthelloBoardDOM();
        updateOthelloPlayersListUI();

        $othelloTurnTimerProgress.style.width = '100%';
        $othelloTurnTimerProgress.className = 'sudoku-progress-fill';

        othelloState.turnTimerInterval = setInterval(() => {
            othelloState.secondsRemaining--;
            
            const timerEl = document.getElementById('othelloTurnTimerSecs');
            if (timerEl) timerEl.textContent = othelloState.secondsRemaining;

            const pct = (othelloState.secondsRemaining / othelloState.turnTimeLimit) * 100;
            $othelloTurnTimerProgress.style.width = `${pct}%`;

            if (pct <= 25) {
                $othelloTurnTimerProgress.className = 'sudoku-progress-fill danger';
            } else if (pct <= 50) {
                $othelloTurnTimerProgress.className = 'sudoku-progress-fill warning';
            }

            if (othelloState.secondsRemaining <= 0) {
                clearInterval(othelloState.turnTimerInterval);
                
                if (isMyTurn) {
                    if (othelloState.isSolo) {
                        applyOthelloSkipTurn(network.myPeerId, othelloState.turnTimeLimit);
                        return;
                    }

                    network.sendOthello({
                        action: 'skip-turn',
                        peerId: network.myPeerId,
                        elapsedSecs: othelloState.turnTimeLimit
                    });
                    if (!network.isHost) {
                        applyOthelloSkipTurn(network.myPeerId, othelloState.turnTimeLimit);
                    }
                }
            }
        }, 1000);
    }

    function applyOthelloSkipTurn(peerId, elapsed) {
        clearInterval(othelloState.turnTimerInterval);

        const player = othelloState.participants.find(p => p.peerId === peerId);
        if (player) {
            player.totalTime += elapsed;
        }

        showToast(`⏰ 시간 초과! 차례가 넘어갑니다.`);

        if (othelloState.status === 'playing') {
            if (othelloState.isSolo) {
                othelloState.soloTurn = othelloState.soloTurn === 'black' ? 'white' : 'black';
            }
            advanceOthelloTurn();
        }
    }

    function advanceOthelloTurn() {
        if (othelloState.turnOrder.length === 0) return;

        const nextTurnIndex = (othelloState.currentTurnIndex + 1) % othelloState.turnOrder.length;
        let nextPeerId = '';
        let nextRole = 'black';

        if (othelloState.isSolo) {
            nextPeerId = network.myPeerId;
            nextRole = othelloState.soloTurn;
        } else {
            nextPeerId = othelloState.turnOrder[nextTurnIndex];
            const nextPlayer = othelloState.players.find(p => p.peerId === nextPeerId);
            if (nextPlayer) nextRole = nextPlayer.role;
        }

        const nextRoleVal = nextRole === 'black' ? 1 : 2;
        const nextMoves = getValidOthelloMoves(othelloState.board, nextRoleVal);

        if (nextMoves.length > 0) {
            othelloState.currentTurnIndex = nextTurnIndex;
            startOthelloTurn();
        } else {
            const currentPeerId = othelloState.isSolo ? network.myPeerId : othelloState.turnOrder[othelloState.currentTurnIndex];
            let currentRole = 'black';
            if (othelloState.isSolo) {
                currentRole = othelloState.soloTurn === 'black' ? 'white' : 'black'; 
            } else {
                const curPlayer = othelloState.players.find(p => p.peerId === currentPeerId);
                if (curPlayer) currentRole = curPlayer.role;
            }
            
            const currentRoleVal = currentRole === 'black' ? 1 : 2;
            const currentMoves = getValidOthelloMoves(othelloState.board, currentRoleVal);

            if (currentMoves.length > 0) {
                showToast(`⚠️ ${nextRole === 'black' ? '흑돌' : '백돌'} 둘 자리가 없어 턴이 넘어갑니다 (Pass)`);
                if (othelloState.isSolo) {
                    othelloState.soloTurn = currentRole; 
                }
                startOthelloTurn();
            } else {
                showToast('🏁 양쪽 모두 둘 수 있는 자리가 없어 대국을 종료합니다.');
                const score = getOthelloStoneCounts();
                setTimeout(() => {
                    if (score.black > score.white) {
                        const bp = othelloState.players.find(x => x.role === 'black');
                        endOthelloGame(bp ? bp.peerId : null, 'black');
                    } else if (score.white > score.black) {
                        const wp = othelloState.players.find(x => x.role === 'white');
                        endOthelloGame(wp ? wp.peerId : null, 'white');
                    } else {
                        endOthelloGame(null, 'draw');
                    }
                }, 600);
            }
        }
    }

    function updateOthelloPlayersListUI() {
        $othelloPlayersList.innerHTML = '';

        if (othelloState.isSolo) {
            const item = document.createElement('div');
            item.className = 'sudoku-leaderboard-item active';
            
            const pName = document.createElement('span');
            pName.className = 'player-name';
            pName.innerHTML = `<span class="player-color-dot" style="background:${network.myColor}"></span> 흑/백 교대 대국 (나)`;
            item.appendChild(pName);

            const score = document.createElement('span');
            score.className = 'player-score';
            score.textContent = `총 착수 ${othelloState.history.length}회`;
            item.appendChild(score);

            $othelloPlayersList.appendChild(item);
            return;
        }

        othelloState.players.forEach(p => {
            const item = document.createElement('div');
            item.className = 'sudoku-leaderboard-item';
            
            const activePeerId = othelloState.turnOrder[othelloState.currentTurnIndex];
            if (p.peerId === activePeerId) {
                item.classList.add('active');
            }

            const pName = document.createElement('span');
            pName.className = 'player-name';
            
            const dot = document.createElement('span');
            dot.className = 'player-color-dot';
            dot.style.background = p.color;
            pName.appendChild(dot);
            
            const roleTxt = p.role === 'black' ? '⚫ 흑돌' : '⚪ 백돌';
            const nameTxt = document.createTextNode(`${p.peerId === network.myPeerId ? `${p.nickname} (나)` : p.nickname} (${roleTxt})`);
            pName.appendChild(nameTxt);
            item.appendChild(pName);

            const match = othelloState.participants.find(x => x.peerId === p.peerId);
            const totalTime = match ? match.totalTime : 0;
            const placements = match ? match.correctCount : 0;

            const score = document.createElement('span');
            score.className = 'player-score';
            score.textContent = `${placements}수 둠 (${Math.round(totalTime)}초)`;
            item.appendChild(score);

            $othelloPlayersList.appendChild(item);
        });
    }

    function renderOthelloFinalResult() {
        $othelloResultStats.innerHTML = '';
        const score = getOthelloStoneCounts();

        const titleText = document.createElement('h4');
        titleText.style.margin = '0 0 8px 0';
        titleText.style.color = '#1e293b';
        titleText.textContent = `최종 스코어 - 흑돌: ${score.black}개 vs 백돌: ${score.white}개`;
        $othelloResultStats.appendChild(titleText);

        if (othelloState.isSolo) {
            const statText = document.createElement('p');
            statText.innerHTML = `총 대국 시간: <b>${formatSudokuTime(othelloState.gameSecondsElapsed)}</b><br>총 착수 수: <b>${othelloState.history.length}수</b>`;
            $othelloResultStats.appendChild(statText);
            return;
        }

        othelloState.players.forEach(p => {
            const match = othelloState.participants.find(x => x.peerId === p.peerId);
            const totalTime = match ? match.totalTime : 0;
            const placements = match ? match.correctCount : 0;
            const roleTxt = p.role === 'black' ? '흑돌' : '백돌';
            const finalStones = p.role === 'black' ? score.black : score.white;

            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
            div.style.paddingBottom = '4px';

            div.innerHTML = `
                <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${p.color}; margin-right:6px;"></span>${escapeHtml(p.nickname)} (${roleTxt})</span>
                <span><b>${finalStones}개 차지</b> (${placements}수 둠, 평균 ${placements > 0 ? (totalTime / placements).toFixed(1) : 0}초)</span>
            `;
            $othelloResultStats.appendChild(div);
        });
    }

    function handleOthelloPeerLeave(peerId) {
        if (othelloState.status === 'proposing') {
            if (peerId === othelloState.proposerId) {
                showToast('🛑 오셀로 제안자가 퇴장하여 제안이 취소되었습니다.');
                resetOthello();
                $othelloOverlay.hidden = true;
            } else {
                othelloState.participants = othelloState.participants.filter(p => p.peerId !== peerId);
                updateOthelloProposalListUI();
            }
        } else if (othelloState.status === 'playing') {
            const hostId = network.getHostPeerId();
            if (peerId === hostId) {
                showToast('⚠️ 방장이 퇴장하여 오셀로 게임을 종료합니다.');
                resetOthello();
                $othelloOverlay.hidden = true;
                return;
            }

            if (othelloState.turnOrder.includes(peerId)) {
                showToast(`🔴 참가자 ${escapeHtml(getPeerNickname(peerId))}님이 퇴장하여 대국이 중단됩니다.`);
                resetOthello();
                $othelloOverlay.hidden = true;
            }
        }
    }

    function syncOthelloStateFromHost(hostState) {
        othelloState.status = 'playing';
        othelloState.isSolo = false;
        othelloState.board = hostState.board;
        othelloState.lastMove = hostState.lastMove;
        othelloState.players = hostState.players;
        othelloState.turnOrder = hostState.turnOrder;
        othelloState.currentTurnIndex = hostState.currentTurnIndex;
        othelloState.history = hostState.history;

        othelloState.participants = hostState.players.map(p => {
            const existing = othelloState.participants.find(x => x.peerId === p.peerId);
            return {
                peerId: p.peerId,
                nickname: p.nickname,
                color: p.color,
                accepted: true,
                totalTime: existing ? existing.totalTime : 0,
                correctCount: existing ? existing.correctCount : 0
            };
        });

        $othelloOverlay.hidden = false;
        showOthelloSubView('game');

        buildOthelloBoardDOM();

        resetOthelloTimers();
        
        othelloState.gameSecondsElapsed = hostState.elapsedSeconds;
        $othelloGameTimer.textContent = formatSudokuTime(othelloState.gameSecondsElapsed);
        othelloState.gameTimerInterval = setInterval(() => {
            othelloState.gameSecondsElapsed++;
            $othelloGameTimer.textContent = formatSudokuTime(othelloState.gameSecondsElapsed);
        }, 1000);

        startOthelloTurn();
    }

    function resetOthelloTimers() {
        clearInterval(othelloState.turnTimerInterval);
        clearInterval(othelloState.gameTimerInterval);
    }

    function resetOthello() {
        resetOthelloTimers();

        othelloState = {
            status: 'none',
            isSolo: false,
            board: [],
            lastMove: null,
            proposerId: null,
            proposerNickname: null,
            participants: [],
            players: [],
            turnOrder: [],
            currentTurnIndex: 0,
            turnStartTime: 0,
            turnTimerInterval: null,
            turnTimeLimit: 30,
            secondsRemaining: 30,
            gameStartTime: 0,
            gameSecondsElapsed: 0,
            gameTimerInterval: null,
            history: [],
            soloTurn: 'black'
        };

        const $boardWrapper = $othelloBoard.parentElement;
        if ($boardWrapper) {
            $boardWrapper.classList.remove('my-turn', 'other-turn');
        }

        $othelloLobby.hidden = true;
        $othelloGame.hidden = true;
        $othelloResult.hidden = true;
    }

    function showOthelloSubView(view) {
        $othelloLobby.hidden = (view !== 'lobby');
        $othelloGame.hidden = (view !== 'game');
        $othelloResult.hidden = (view !== 'result');
    }

    function showGomokuSubView(view) {
        $gomokuLobby.hidden = (view !== 'lobby');
        $gomokuGame.hidden = (view !== 'game');
        $gomokuResult.hidden = (view !== 'result');
    }

    /* ---------- Start ---------- */

    init();
})();
