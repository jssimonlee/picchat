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

            const screenX = right * scaleX + (rect.left - containerRect.left) + 8;
            const screenY = top * scaleY + (rect.top - containerRect.top) - 8;

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
                const screenX = right * scaleX + (rect.left - containerRect.left) + 8;
                const screenY = top * scaleY + (rect.top - containerRect.top) - 8;
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
        $btnDelete.addEventListener('click', () => {
            const confirmMsg = action.type === 'text' ? '이 텍스트를 삭제하시겠습니까?' : '이 이미지를 삭제하시겠습니까?';
            if (confirm(confirmMsg)) {
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
                $textarea.style.boxSizing = 'border-box';
                $textarea.style.background = 'rgba(30, 30, 46, 0.95)';
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

    /* ---------- Start ---------- */

    init();
})();
