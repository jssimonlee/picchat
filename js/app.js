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

    /* ---------- State ---------- */

    let canvas = null;
    let network = null;
    let cursorThrottle = 0;
    const remoteCursors = new Map(); // peerId -> DOM element
    const knownParticipants = new Map(); // peerId -> { nickname, color }

    /* ---------- Initialize ---------- */

    function init() {
        setupLobbyEvents();
        // Auto-fill nickname from localStorage
        const savedNick = localStorage.getItem('piccomm-nickname');
        if (savedNick) $nickname.value = savedNick;

        // Auto-format join code
        $joinCode.addEventListener('input', (e) => {
            let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (v.length > 3) v = v.slice(0, 3) + '-' + v.slice(3, 6);
            e.target.value = v;
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
            },
            onUndo: () => {
                canvas.undo();
            },
            onRedo: () => {
                canvas.redo();
            },
            onClear: () => {
                canvas.clearAll();
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
            onStateReceived: async (state) => {
                await canvas.loadState(state);
                const bg = canvas.backgroundColor;
                $bgColorPicker.value = bg;
                updateActiveBgColorDot(bg);
                $canvasContainer.style.backgroundColor = bg;
                showToast('📥 캔버스 상태를 동기화했습니다');
            },
            onPeerJoin: (peerId, peerNickname, color) => {
                knownParticipants.set(peerId, { nickname: peerNickname, color });
                updateParticipantsUI();
                showToast(`🟢 ${peerNickname}님이 참여했습니다`);

                // If host and this is the first peer, enter studio
                if (network.isHost && $lobby.classList.contains('active')) {
                    enterStudio(network.roomCode);
                }
            },
            onPeerLeave: (peerId, peerNickname) => {
                knownParticipants.delete(peerId);
                removeRemoteCursor(peerId);
                updateParticipantsUI();
                showToast(`🔴 ${peerNickname}님이 나갔습니다`);
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
            getCanvasState: () => {
                return canvas ? canvas.getState() : {};
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
        window.addEventListener('resize', () => canvas.resize());

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
            color: network.myColor
        });
        updateParticipantsUI();
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
        $btnClear.addEventListener('click', () => {
            if (confirm('캔버스를 전체 지우시겠습니까?')) {
                canvas.clearAll();
                network.sendClear();
                showToast('🗑️ 캔버스가 초기화되었습니다');
            }
        });

        // Download
        $btnDownload.addEventListener('click', () => {
            const dataUrl = canvas.exportImage();
            const link = document.createElement('a');
            link.download = `piccomm-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            showToast('💾 이미지가 다운로드되었습니다');
        });

        // Image Upload
        $btnUploadImage.addEventListener('click', () => $imageInput.click());
        $imageInput.addEventListener('change', handleImageUpload);

        // Leave room
        $btnLeaveRoom.addEventListener('click', () => {
            if (confirm('방을 나가시겠습니까?')) {
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

            await canvas.setBackgroundImage(resized);
            network.sendBackground(resized);
            showToast('🖼️ 배경 이미지가 설정되었습니다');
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

    /* ---------- Keyboard Shortcuts ---------- */

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in text input
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

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
                        await canvas.setBackgroundImage(resized);
                        network.sendBackground(resized);
                        showToast('📋 클립보드 이미지가 붙여넣기 되었습니다');
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
            tag.className = 'participant-tag';
            tag.innerHTML = `
                <span class="participant-dot" style="background:${info.color}"></span>
                <span>${escapeHtml(info.nickname)}</span>
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
        if (network) {
            network.disconnect();
            network = null;
        }
        canvas = null;

        // Clear state
        knownParticipants.clear();
        remoteCursors.forEach(el => el.remove());
        remoteCursors.clear();

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

    /* ---------- Start ---------- */

    init();
})();
