/* ========================================
   PicChat - Network Manager (PeerJS)
   Handles P2P connections via WebRTC
   Star topology: host relays all messages
   ======================================== */

const CLOUDFLARE_WORKER_URL = 'https://picchat-turn.jssimonlee.workers.dev';


class NetworkManager {
    constructor(callbacks = {}) {
        this.onAction = callbacks.onAction || (() => {});
        this.onUndo = callbacks.onUndo || (() => {});
        this.onRedo = callbacks.onRedo || (() => {});
        this.onClear = callbacks.onClear || (() => {});
        this.onBackground = callbacks.onBackground || (() => {});
        this.onBgColor = callbacks.onBgColor || (() => {});
        this.onUpdateAction = callbacks.onUpdateAction || (() => {});
        this.onDeleteAction = callbacks.onDeleteAction || (() => {});
        this.onStateReceived = callbacks.onStateReceived || (() => {});
        this.onPeerJoin = callbacks.onPeerJoin || (() => {});
        this.onPeerLeave = callbacks.onPeerLeave || (() => {});
        this.onCursorMove = callbacks.onCursorMove || (() => {});
        this.onPresence = callbacks.onPresence || (() => {});
        this.onError = callbacks.onError || (() => {});
        this.onReady = callbacks.onReady || (() => {});
        this.onSudoku = callbacks.onSudoku || (() => {});
        this.onGomoku = callbacks.onGomoku || (() => {});
        this.onOthello = callbacks.onOthello || (() => {});
        this.onMinesweeper = callbacks.onMinesweeper || (() => {});
        this.onChat = callbacks.onChat || (() => {});
        this.onFileReceived = callbacks.onFileReceived || (() => {});
        this.onEmoji = callbacks.onEmoji || (() => {});
        this.onLaser = callbacks.onLaser || (() => {});
        this.onDrawStart = callbacks.onDrawStart || (() => {});
        this.onDrawMove = callbacks.onDrawMove || (() => {});
        this.onDrawEnd = callbacks.onDrawEnd || (() => {});

        // State needed for state sync
        this.getCanvasState = callbacks.getCanvasState || (() => ({}));

        this.peer = null;
        this.connections = new Map(); // peerId -> { conn, nickname, color }
        this.isHost = false;
        this.roomCode = '';
        this.nickname = '';
        this.myColor = '';
        this.myPeerId = '';

        this._peerColors = [
            '#ff4757', '#2ed573', '#1e90ff', '#ffd32a',
            '#a855f7', '#ff6b9d', '#00d4ff', '#ff7f50'
        ];
        this._colorIndex = 0;
    }

    /* ---------- Room Code Generation ---------- */

    _generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        // Format as XXX-XXX
        return code.slice(0, 3) + '-' + code.slice(3);
    }

    _roomCodeToPeerId(code) {
        return 'picchat-' + code.replace('-', '').toLowerCase();
    }

    _nextColor() {
        const color = this._peerColors[this._colorIndex % this._peerColors.length];
        this._colorIndex++;
        return color;
    }

    async _getPeerConfig() {
        let iceServers = [
            { urls: 'stun:stun.relay.metered.ca:80' },
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            {
                urls: 'turn:global.relay.metered.ca:80',
                username: '65330acb4241246eee68ae02',
                credential: 'S1pwGwv5ODO3UyIY'
            },
            {
                urls: 'turn:global.relay.metered.ca:80?transport=tcp',
                username: '65330acb4241246eee68ae02',
                credential: 'S1pwGwv5ODO3UyIY'
            },
            {
                urls: 'turn:global.relay.metered.ca:443',
                username: '65330acb4241246eee68ae02',
                credential: 'S1pwGwv5ODO3UyIY'
            },
            {
                urls: 'turns:global.relay.metered.ca:443?transport=tcp',
                username: '65330acb4241246eee68ae02',
                credential: 'S1pwGwv5ODO3UyIY'
            }
        ];

        try {
            const response = await fetch(CLOUDFLARE_WORKER_URL);
            if (response.ok) {
                const dynamicServers = await response.json();
                if (Array.isArray(dynamicServers) && dynamicServers.length > 0) {
                    iceServers = dynamicServers;
                }
            }
        } catch (e) {
            console.warn('[Network] Failed to fetch dynamic TURN credentials from Cloudflare Worker, using static fallbacks', e);
        }

        return {
            debug: 0,
            config: { iceServers }
        };
    }


    /* ---------- Create Room (Host) ---------- */

    createRoom(nickname, customCode = null) {
        return new Promise(async (resolve, reject) => {
            this.isHost = true;
            this.nickname = nickname;
            this.myColor = this._nextColor();
            
            if (customCode) {
                // Formatting as XXX-XXX
                this.roomCode = customCode.slice(0, 3) + '-' + customCode.slice(3);
                this.hasCustomCode = true;
            } else {
                this.roomCode = this._generateRoomCode();
                this.hasCustomCode = false;
            }
            
            const peerId = this._roomCodeToPeerId(this.roomCode);

            const peerConfig = await this._getPeerConfig();
            this.peer = new Peer(peerId, peerConfig);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                console.log('[Network] Room created:', this.roomCode, 'PeerId:', id);
                this.onReady();

                // Host listens for incoming connections
                this.peer.on('connection', (conn) => {
                    this._handleIncomingConnection(conn);
                });

                resolve(this.roomCode);
            });

            this.peer.on('error', (err) => {
                console.error('[Network] Error:', err);
                if (err.type === 'unavailable-id') {
                    if (this.hasCustomCode) {
                        this.peer.destroy();
                        reject(new Error('unavailable-id'));
                    } else {
                        // Room code collision, try again
                        this.roomCode = this._generateRoomCode();
                        this.peer.destroy();
                        this.createRoom(nickname).then(resolve).catch(reject);
                    }
                } else {
                    this.onError(err.type === 'peer-unavailable'
                        ? '방을 찾을 수 없습니다. 코드를 확인해주세요.'
                        : '연결 오류: ' + err.message);
                    reject(err);
                }
            });

            this.peer.on('disconnected', () => {
                console.log('[Network] Disconnected, attempting reconnect...');
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });
        });
    }

    /* ---------- Join Room (Client) ---------- */

    joinRoom(roomCode, nickname) {
        return new Promise(async (resolve, reject) => {
            this.isHost = false;
            this.nickname = nickname;
            this.myColor = this._nextColor();
            this.roomCode = roomCode.toUpperCase();

            const hostPeerId = this._roomCodeToPeerId(this.roomCode);
            const myPeerId = hostPeerId + '-' + Math.random().toString(36).substr(2, 6);

            const peerConfig = await this._getPeerConfig();
            this.peer = new Peer(myPeerId, peerConfig);

            this.peer.on('open', (id) => {
                this.myPeerId = id;
                console.log('[Network] My PeerId:', id, '→ connecting to host:', hostPeerId);

                const conn = this.peer.connect(hostPeerId, {
                    reliable: true,
                    metadata: { nickname: this.nickname, color: this.myColor }
                });

                conn.on('open', () => {
                    console.log('[Network] Connected to host');
                    this.connections.set(hostPeerId, {
                        conn,
                        nickname: 'Host',
                        color: '#ffffff'
                    });

                    this._setupDataHandler(conn, hostPeerId);

                    // Send join info to host
                    conn.send({
                        type: 'join',
                        nickname: this.nickname,
                        color: this.myColor,
                        peerId: this.myPeerId
                    });

                    // Request full state
                    conn.send({ type: 'state-request' });

                    this.onReady();
                    resolve();
                });

                conn.on('error', (err) => {
                    console.error('[Network] Connection error:', err);
                    this.onError('연결 실패: ' + err.message);
                    reject(err);
                });
            });

            this.peer.on('error', (err) => {
                console.error('[Network] Peer error:', err);
                this.onError(err.type === 'peer-unavailable'
                    ? '방을 찾을 수 없습니다. 코드를 확인해주세요.'
                    : '연결 오류가 발생했습니다.');
                reject(err);
            });
        });
    }

    /* ---------- Connection Handling ---------- */

    _handleIncomingConnection(conn) {
        const peerId = conn.peer;
        console.log('[Network] Incoming connection from:', peerId);

        conn.on('open', () => {
            const meta = conn.metadata || {};
            const nickname = meta.nickname || 'Guest';
            const color = meta.color || this._nextColor();

            this.connections.set(peerId, { conn, nickname, color });
            this._setupDataHandler(conn, peerId);

            console.log('[Network] Peer connected:', nickname);
        });

        conn.on('close', () => {
            this._handlePeerLeave(peerId);
        });

        conn.on('error', () => {
            this._handlePeerLeave(peerId);
        });
    }

    _setupDataHandler(conn, peerId) {
        conn.on('data', (data) => {
            this._handleMessage(data, peerId);
        });

        conn.on('close', () => {
            this._handlePeerLeave(peerId);
        });

        // ICE Connection Monitoring for immediate disconnect detection (tab close, network drop, etc.)
        if (conn.peerConnection) {
            const pc = conn.peerConnection;
            const onStateChange = () => {
                const state = pc.iceConnectionState;
                if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                    this._handlePeerLeave(peerId);
                }
            };
            pc.addEventListener('iceconnectionstatechange', onStateChange);
            
            const onConnStateChange = () => {
                const state = pc.connectionState;
                if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                    this._handlePeerLeave(peerId);
                }
            };
            pc.addEventListener('connectionstatechange', onConnStateChange);
        }
    }

    _handlePeerLeave(peerId) {
        const peer = this.connections.get(peerId);
        if (peer) {
            console.log('[Network] Peer left:', peer.nickname);
            this.connections.delete(peerId);
            this.onPeerLeave(peerId, peer.nickname);

            // If host, notify others
            if (this.isHost) {
                this._broadcast({ type: 'user-left', peerId, nickname: peer.nickname }, peerId);
            }
        }
    }

    /* ---------- Message Handling ---------- */

    _handleMessage(data, fromPeerId) {
        switch (data.type) {
            case 'join': {
                const info = this.connections.get(fromPeerId);
                if (info) {
                    info.nickname = data.nickname;
                    info.color = data.color;
                    info.isAway = false;
                }
                this.onPeerJoin(fromPeerId, data.nickname, data.color, false);

                // If host, notify all other peers about the new user
                if (this.isHost) {
                    this._broadcast({
                        type: 'user-joined',
                        peerId: fromPeerId,
                        nickname: data.nickname,
                        color: data.color
                    }, fromPeerId);

                    // Send existing user list to the new peer
                    const users = [{ nickname: this.nickname, color: this.myColor, peerId: this.myPeerId, isAway: false }];
                    this.connections.forEach((info, pid) => {
                        if (pid !== fromPeerId) {
                            users.push({ nickname: info.nickname, color: info.color, peerId: pid, isAway: info.isAway || false });
                        }
                    });
                    const conn = this.connections.get(fromPeerId);
                    if (conn) {
                        conn.conn.send({ type: 'user-list', users });
                    }
                }
                break;
            }

            case 'user-joined':
                this.onPeerJoin(data.peerId, data.nickname, data.color, false);
                break;

            case 'user-left':
                this.onPeerLeave(data.peerId, data.nickname);
                break;

            case 'user-list':
                if (data.users) {
                    data.users.forEach(u => {
                        this.onPeerJoin(u.peerId, u.nickname, u.color, u.isAway || false);
                    });
                }
                break;

            case 'state-request':
                if (this.isHost) {
                    const state = this.getCanvasState();
                    const conn = this.connections.get(fromPeerId);
                    if (conn) {
                        conn.conn.send({ type: 'state', state });
                    }
                }
                break;

            case 'state':
                this.onStateReceived(data.state);
                break;

            case 'action':
                this.onAction(data.action);
                // Host relays to others
                if (this.isHost) {
                    this._broadcast(data, fromPeerId);
                }
                break;

            case 'update-action':
                this.onUpdateAction(data.action);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'delete-action':
                this.onDeleteAction(data.id);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'undo':
                this.onUndo();
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'redo':
                this.onRedo();
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'clear':
                this.onClear();
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'background':
                this.onBackground(data.dataUrl);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'bgcolor':
                this.onBgColor(data.color);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'cursor':
                this.onCursorMove(fromPeerId, data.x, data.y, data.nickname, data.color);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'presence': {
                const info = this.connections.get(fromPeerId);
                if (info) {
                    info.isAway = data.isAway;
                }
                this.onPresence(fromPeerId, data.isAway);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;
            }

            case 'sudoku':
                this.onSudoku(fromPeerId, data.payload);
                // No automatic broadcast — app logic handles relay via sendSudoku
                break;

            case 'gomoku':
                this.onGomoku(fromPeerId, data.payload);
                break;

            case 'othello':
                this.onOthello(fromPeerId, data.payload);
                break;

            case 'minesweeper':
                this.onMinesweeper(fromPeerId, data.payload);
                break;

            case 'chat': {
                const recipientId = data.recipientId || 'all';
                if (this.isHost) {
                    if (recipientId === 'all') {
                        this._broadcast(data, fromPeerId);
                        this.onChat(fromPeerId, data.message, data.nickname, data.color, 'all');
                    } else if (recipientId === this.myPeerId) {
                        this.onChat(fromPeerId, data.message, data.nickname, data.color, recipientId);
                    } else {
                        // Relay to the specific connection
                        const info = this.connections.get(recipientId);
                        if (info) {
                            try { info.conn.send(data); } catch(e) {}
                        }
                    }
                } else {
                    if (recipientId === 'all' || recipientId === this.myPeerId) {
                        this.onChat(fromPeerId, data.message, data.nickname, data.color, recipientId);
                    }
                }
                break;
            }

            case 'file': {
                const recipientId = data.recipientId || 'all';
                if (this.isHost) {
                    if (recipientId === 'all') {
                        this._broadcast(data, fromPeerId);
                        this.onFileReceived(fromPeerId, data);
                    } else if (recipientId === this.myPeerId) {
                        this.onFileReceived(fromPeerId, data);
                    } else {
                        // Forward to the specific recipient
                        const info = this.connections.get(recipientId);
                        if (info) {
                            try { info.conn.send(data); } catch(e) {}
                        }
                    }
                } else {
                    if (recipientId === 'all' || recipientId === this.myPeerId) {
                        this.onFileReceived(fromPeerId, data);
                    }
                }
                break;
            }

            case 'emoji':
                this.onEmoji(fromPeerId, data.emoji, data.nickname, data.color);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'laser':
                this.onLaser(fromPeerId, data.points, data.color);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'draw-start':
                this.onDrawStart(fromPeerId, data.pathId, data.tool, data.color, data.size, data.opacity, data.point);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'draw-move':
                this.onDrawMove(fromPeerId, data.pathId, data.point, data.endPoint);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'draw-end':
                this.onDrawEnd(fromPeerId, data.pathId);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;
        }
    }

    /* ---------- Broadcasting ---------- */

    _broadcast(data, excludePeerId = null) {
        this.connections.forEach((info, peerId) => {
            if (peerId !== excludePeerId) {
                try {
                    info.conn.send(data);
                } catch (e) {
                    console.warn('[Network] Failed to send to', peerId);
                }
            }
        });
    }

    /* ---------- Public Send Methods ---------- */

    sendAction(action) {
        const data = { type: 'action', action };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            // Send to host only; host will relay
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendUpdateAction(action) {
        const data = { type: 'update-action', action };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendDeleteAction(id) {
        const data = { type: 'delete-action', id };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendUndo() {
        const data = { type: 'undo' };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendRedo() {
        const data = { type: 'redo' };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendClear() {
        const data = { type: 'clear' };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendBackground(dataUrl) {
        const data = { type: 'background', dataUrl };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendBgColor(color) {
        const data = { type: 'bgcolor', color };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendCursor(x, y) {
        const data = {
            type: 'cursor',
            x, y,
            nickname: this.nickname,
            color: this.myColor
        };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendPresence(isAway) {
        const data = { type: 'presence', isAway };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendSudoku(payload) {
        const data = { type: 'sudoku', payload };
        if (this.isHost) {
            this._broadcast(data);
            // Local echo: host also processes its own messages
            this.onSudoku(this.myPeerId, payload);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendGomoku(payload) {
        const data = { type: 'gomoku', payload };
        if (this.isHost) {
            this._broadcast(data);
            // Local echo: host also processes its own messages
            this.onGomoku(this.myPeerId, payload);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendOthello(payload) {
        const data = { type: 'othello', payload };
        if (this.isHost) {
            this._broadcast(data);
            // Local echo: host also processes its own messages
            this.onOthello(this.myPeerId, payload);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendMinesweeper(payload) {
        const data = { type: 'minesweeper', payload };
        if (this.isHost) {
            this._broadcast(data);
            // Local echo: host also processes its own messages
            this.onMinesweeper(this.myPeerId, payload);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendChat(message, recipientId = 'all') {
        const data = { 
            type: 'chat', 
            message, 
            nickname: this.nickname, 
            color: this.myColor,
            recipientId
        };
        if (this.isHost) {
            if (recipientId === 'all') {
                this._broadcast(data);
                this.onChat(this.myPeerId, message, this.nickname, this.myColor, 'all');
            } else if (recipientId === this.myPeerId) {
                this.onChat(this.myPeerId, message, this.nickname, this.myColor, recipientId);
            } else {
                const info = this.connections.get(recipientId);
                if (info) {
                    try { info.conn.send(data); } catch(e) {}
                }
                this.onChat(this.myPeerId, message, this.nickname, this.myColor, recipientId);
            }
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendFile(fileName, fileType, fileData, recipientId = 'all') {
        const data = {
            type: 'file',
            fileName,
            fileType,
            fileData,
            recipientId,
            nickname: this.nickname,
            color: this.myColor
        };

        if (this.isHost) {
            if (recipientId === 'all') {
                this._broadcast(data);
                this.onFileReceived(this.myPeerId, data);
            } else if (recipientId === this.myPeerId) {
                this.onFileReceived(this.myPeerId, data);
            } else {
                const info = this.connections.get(recipientId);
                if (info) {
                    try { info.conn.send(data); } catch(e) {}
                }
                this.onFileReceived(this.myPeerId, data);
            }
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
            this.onFileReceived(this.myPeerId, data);
        }
    }

    sendEmoji(emoji) {
        const data = { type: 'emoji', emoji, nickname: this.nickname, color: this.myColor };
        if (this.isHost) {
            this._broadcast(data);
            this.onEmoji(this.myPeerId, emoji, this.nickname, this.myColor);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendLaser(points, color) {
        const data = { type: 'laser', points, color };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendDrawStart(pathId, tool, color, size, opacity, point) {
        const data = { type: 'draw-start', pathId, tool, color, size, opacity, point };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendDrawMove(pathId, point, endPoint) {
        const data = { type: 'draw-move', pathId, point, endPoint };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendDrawEnd(pathId) {
        const data = { type: 'draw-end', pathId };
        if (this.isHost) {
            this._broadcast(data);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    getHostPeerId() {
        if (this.isHost) return this.myPeerId;
        return this.roomCode ? this._roomCodeToPeerId(this.roomCode) : null;
    }

    /* ---------- Getters ---------- */

    getParticipants() {
        const list = [{ nickname: this.nickname, color: this.myColor, peerId: this.myPeerId, isMe: true }];
        this.connections.forEach((info, peerId) => {
            list.push({ nickname: info.nickname, color: info.color, peerId, isMe: false });
        });
        return list;
    }

    getPeerCount() {
        return this.connections.size + 1; // +1 for self
    }

    /* ---------- Cleanup ---------- */

    disconnect() {
        this.connections.forEach(info => {
            try { info.conn.close(); } catch(e) {}
        });
        this.connections.clear();
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}
