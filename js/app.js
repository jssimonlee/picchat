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

    /* ---------- State ---------- */

    let canvas = null;
    let network = null;
    let cursorThrottle = 0;
    let isSelectingFile = false;
    const remoteCursors = new Map(); // peerId -> DOM element
    const knownParticipants = new Map(); // peerId -> { nickname, color }

    // Sudoku State
    let sudokuState = {
        status: 'none', // 'none' | 'proposing' | 'playing' | 'finished'
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
            if (isSelectingFile) return;
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
            const dataUrl = canvas.exportImage();
            const link = document.createElement('a');
            link.download = `piccomm-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            showToast('💾 이미지가 다운로드되었습니다');

            // Clear flag after 2 seconds as fallback for silent downloads
            setTimeout(() => {
                isSelectingFile = false;
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
        // Remove existing handles
        document.querySelectorAll('.image-handle-el').forEach(el => el.remove());
        if (activeEditMenu) {
            activeEditMenu.remove();
            activeEditMenu = null;
        }

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
    }

    function proposeSudoku(difficulty) {
        sudokuState.status = 'proposing';
        sudokuState.difficulty = difficulty;
        sudokuState.proposerId = network.myPeerId;
        sudokuState.proposerNickname = network.nickname;

        sudokuState.participants = [
            {
                peerId: network.myPeerId,
                nickname: network.nickname,
                color: network.myColor,
                accepted: true
            }
        ];

        network.sendSudoku({
            action: 'propose',
            difficulty: difficulty,
            proposerId: network.myPeerId,
            proposerNickname: network.nickname
        });

        $sudokuLobbySetup.hidden = true;
        $sudokuLobbyWaiting.hidden = false;
        $sudokuLobbyInvite.hidden = true;
        $sudokuLobbyWaitingTitle.textContent = '스도쿠 참가 대기 중';
        
        $btnSudokuStart.hidden = !network.isHost;
        $btnSudokuStart.disabled = true;

        updateSudokuProposalListUI();
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
                    color: getPeerColor(payload.proposerId),
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
        }
        else if (action === 'join-response') {
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
                network.sendSudoku({
                    action: 'proposal-sync',
                    difficulty: sudokuState.difficulty,
                    proposerId: sudokuState.proposerId,
                    proposerNickname: sudokuState.proposerNickname,
                    participants: sudokuState.participants
                });

                updateSudokuProposalListUI();
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
            sudokuState.difficulty = payload.difficulty;
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
        }
        else if (action === 'skip-turn') {
            applySudokuSkipTurn(payload.peerId, payload.elapsedSecs);
        }
        else if (action === 'cancel') {
            showToast('🛑 스도쿠 게임이 취소되었습니다.');
            resetSudoku();
            $sudokuOverlay.hidden = true;
        }
    }

    function cancelSudokuProposal() {
        network.sendSudoku({
            action: 'cancel'
        });
        resetSudoku();
        $sudokuOverlay.hidden = true;
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

        // Broadcast starting state
        network.sendSudoku({
            action: 'start',
            difficulty: sudokuState.difficulty,
            puzzle: puzzleData.puzzle,
            solution: puzzleData.solution,
            initialBoard: puzzleData.puzzle,
            players: players
        });

        handleSudokuNetworkMessage(network.myPeerId, {
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
                    if (sudokuState.board[r][c] !== 0) return;
                    if (sudokuState.initialBoard[r][c] !== 0) return;
                    
                    const autoVal = getSudokuAutoFillNumber(r, c);
                    if (autoVal !== null) {
                        inputSudokuNumber(autoVal);
                    }
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
            setSelectedSudokuNumber(null);
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

        network.sendSudoku({
            action: 'move',
            peerId: network.myPeerId,
            r, c, val,
            isCorrect,
            elapsedSecs: elapsed
        });

        applySudokuMove(network.myPeerId, r, c, val, isCorrect, elapsed);
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
        document.querySelectorAll('.sudoku-num-btn').forEach(btn => {
            const v = parseInt(btn.getAttribute('data-val'));
            btn.classList.toggle('num-selected', v === val);
        });
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
                    network.sendSudoku({
                        action: 'skip-turn',
                        peerId: network.myPeerId,
                        elapsedSecs: sudokuState.turnTimeLimit
                    });
                    applySudokuSkipTurn(network.myPeerId, sudokuState.turnTimeLimit);
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
            sudokuState.participants = sudokuState.participants.filter(p => p.peerId !== peerId);
            updateSudokuProposalListUI();
        } else if (sudokuState.status === 'playing') {
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

        $sudokuLobby.hidden = true;
        $sudokuGame.hidden = true;
        $sudokuResult.hidden = true;
    }

    function showSudokuSubView(view) {
        $sudokuLobby.hidden = (view !== 'lobby');
        $sudokuGame.hidden = (view !== 'game');
        $sudokuResult.hidden = (view !== 'result');
    }

    /* ---------- Start ---------- */

    init();
})();
