/* ========================================
   PicChat - Network Manager (PeerJS)
   Handles P2P connections via WebRTC
   Star topology: host relays all messages
   ======================================== */

const CLOUDFLARE_WORKER_URL = ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.protocol !== 'file:')
    ? 'http://localhost:8787'
    : 'https://picchat-turn.jssimonlee.workers.dev';


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
        this.onSpeedrun = callbacks.onSpeedrun || (() => {});
        this.onChat = callbacks.onChat || (() => {});
        this.onFileReceived = callbacks.onFileReceived || (() => {});
        this.onReadReceipt = callbacks.onReadReceipt || (() => {});
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
        this.coordinatorId = '';

        this._peerColors = [
            '#ef4444', // Vibrant Red
            '#3b82f6', // Vibrant Blue
            '#10b981', // Emerald Green
            '#f59e0b', // Amber Orange
            '#8b5cf6', // Vivid Purple
            '#ec4899', // Hot Pink
            '#06b6d4', // Bright Cyan
            '#f97316', // Orange
            '#14b8a6', // Teal
            '#d946ef'  // Fuchsia Magenta
        ];
        this._colorIndex = 0;

        // Pre-fetch dynamic ICE servers to eliminate initial loading latency
        this._cachedPeerConfig = null;
        this._preFetchConfig();
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

    async _preFetchConfig() {
        let iceServers = [
            { urls: 'stun:stun.relay.metered.ca:80' },
            { urls: 'stun:stun.l.google.com:19302' }
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
            console.warn('[Network] Failed to pre-fetch dynamic TURN credentials from Cloudflare Worker, using static fallbacks', e);
        }

        this._cachedPeerConfig = {
            debug: 0,
            config: { iceServers }
        };
    }

    async _getPeerConfig() {
        if (this._cachedPeerConfig) {
            return this._cachedPeerConfig;
        }
        await this._preFetchConfig();
        return this._cachedPeerConfig;
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

                // Query DB to see if the custom code is already active
                try {
                    const response = await fetch(`${CLOUDFLARE_WORKER_URL}/api/rooms/${this.roomCode}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.peerIds && data.peerIds.length > 0) {
                            reject(new Error('unavailable-id'));
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('[Network] Pre-check for room code failed:', e);
                }
            } else {
                this.roomCode = this._generateRoomCode();
                this.hasCustomCode = false;
            }
            
            // Random host peer ID to avoid collision
            const peerId = this._roomCodeToPeerId(this.roomCode) + '-peer-' + Math.random().toString(36).substr(2, 6);
            this.coordinatorId = peerId;

            const peerConfig = await this._getPeerConfig();
            this.peer = new Peer(peerId, peerConfig);

            this.peer.on('open', async (id) => {
                this.myPeerId = id;
                console.log('[Network] Room created:', this.roomCode, 'PeerId:', id);
                this.onReady();

                // Save initial peer ID to database
                await this._syncRoomWithDb([this.myPeerId]);

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

            try {
                // 1. Query DB to see active peer IDs in this room
                const response = await fetch(`${CLOUDFLARE_WORKER_URL}/api/rooms/${this.roomCode}`);
                if (!response.ok) throw new Error('Failed to query room DB');
                
                const data = await response.json();
                const peerIds = data.peerIds || [];
                
                if (peerIds.length === 0) {
                    reject(new Error('peer-unavailable'));
                    return;
                }

                // Connect to the oldest active peer (the current coordinator/host)
                const hostPeerId = peerIds[0];
                this.coordinatorId = hostPeerId;

                const myPeerId = this._roomCodeToPeerId(this.roomCode) + '-peer-' + Math.random().toString(36).substr(2, 6);
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
                        console.error('[Network] Connection error to host:', err);
                        // Try connection recovery / migration immediately
                        this._handleHostMigration().then(() => resolve()).catch(reject);
                    });
                });

                this.peer.on('error', (err) => {
                    console.error('[Network] Peer error:', err);
                    this.onError(err.type === 'peer-unavailable'
                        ? '방을 찾을 수 없습니다. 코드를 확인해주세요.'
                        : '연결 오류가 발생했습니다.');
                    reject(err);
                });

            } catch (e) {
                console.error('[Network] Join failed:', e);
                reject(new Error('peer-unavailable'));
            }
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

            // Sync database when guest joins
            if (this.isHost) {
                this._syncRoomWithDb(this.getActivePeerIds());
            }
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

            // If host, notify others and sync DB
            if (this.isHost) {
                this._broadcast({ type: 'user-left', peerId, nickname: peer.nickname }, peerId);
                this._syncRoomWithDb(this.getActivePeerIds());
            } else {
                // If guest, and host left, trigger migration
                if (peerId === this.coordinatorId) {
                    console.log('[Network] Coordinator left, starting host migration...');
                    this._handleHostMigration();
                }
            }
        }
    }

    /* ---------- Message Handling ---------- */

    _handleMessage(data, fromPeerId) {
        switch (data.type) {
            case 'assign-color':
                this.myColor = data.color;
                this.onPeerJoin(this.myPeerId, this.nickname, this.myColor, false);
                break;

            case 'join': {
                const info = this.connections.get(fromPeerId);
                const assignedColor = this._nextColor(); // Assign color sequentially
                if (info) {
                    info.nickname = data.nickname;
                    info.color = assignedColor;
                    info.isAway = false;
                }
                this.onPeerJoin(fromPeerId, data.nickname, assignedColor, false);

                // Send confirmation with assigned color back to the newly joined guest
                const conn = this.connections.get(fromPeerId);
                if (conn) {
                    conn.conn.send({ type: 'assign-color', color: assignedColor });
                }

                // If host, notify all other peers about the new user
                if (this.isHost) {
                    this._broadcast({
                        type: 'user-joined',
                        peerId: fromPeerId,
                        nickname: data.nickname,
                        color: assignedColor
                    }, fromPeerId);

                    // Send existing user list to the new peer
                    const users = [{ nickname: this.nickname, color: this.myColor, peerId: this.myPeerId, isAway: false }];
                    this.connections.forEach((info, pid) => {
                        if (pid !== fromPeerId) {
                            users.push({ nickname: info.nickname, color: info.color, peerId: pid, isAway: info.isAway || false });
                        }
                    });
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

            case 'speedrun':
                this.onSpeedrun(fromPeerId, data.payload);
                break;

            case 'chat': {
                const recipientId = data.recipientId || 'all';
                const msgId = data.msgId;
                if (this.isHost) {
                    if (recipientId === 'all') {
                        this._broadcast(data, fromPeerId);
                        this.onChat(fromPeerId, data.message, data.nickname, data.color, 'all', data.isVolatile, data.volatileDuration, msgId);
                    } else if (recipientId === this.myPeerId) {
                        this.onChat(fromPeerId, data.message, data.nickname, data.color, recipientId, data.isVolatile, data.volatileDuration, msgId);
                    } else {
                        // Relay to the specific connection
                        const info = this.connections.get(recipientId);
                        if (info) {
                            try { info.conn.send(data); } catch(e) {}
                        }
                    }
                } else {
                    if (recipientId === 'all' || recipientId === this.myPeerId) {
                        this.onChat(fromPeerId, data.message, data.nickname, data.color, recipientId, data.isVolatile, data.volatileDuration, msgId);
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

            case 'read-receipt': {
                if (this.isHost) {
                    this._broadcast(data, fromPeerId);
                }
                this.onReadReceipt(fromPeerId, data.msgIds);
                break;
            }

            case 'emoji':
                this.onEmoji(fromPeerId, data.emoji, data.nickname, data.color, data.isVolatile, data.volatileDuration);
                if (this.isHost) this._broadcast(data, fromPeerId);
                break;

            case 'laser':
                if (data.action) {
                    this.onLaser(fromPeerId, data.action);
                } else {
                    this.onLaser(fromPeerId, data.points, data.color);
                }
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

    sendSpeedrun(payload) {
        const data = { type: 'speedrun', payload };
        if (this.isHost) {
            this._broadcast(data);
            // Local echo: host also processes its own messages
            this.onSpeedrun(this.myPeerId, payload);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendChat(message, recipientId = 'all', isVolatile = false, volatileDuration = 0, msgId = null) {
        if (!msgId) {
            msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        const data = { 
            type: 'chat', 
            msgId,
            message, 
            nickname: this.nickname, 
            color: this.myColor,
            recipientId,
            isVolatile,
            volatileDuration
        };
        if (this.isHost) {
            if (recipientId === 'all') {
                this._broadcast(data);
                this.onChat(this.myPeerId, message, this.nickname, this.myColor, 'all', isVolatile, volatileDuration, msgId);
            } else if (recipientId === this.myPeerId) {
                this.onChat(this.myPeerId, message, this.nickname, this.myColor, recipientId, isVolatile, volatileDuration, msgId);
            } else {
                const info = this.connections.get(recipientId);
                if (info) {
                    try { info.conn.send(data); } catch(e) {}
                }
                this.onChat(this.myPeerId, message, this.nickname, this.myColor, recipientId, isVolatile, volatileDuration, msgId);
            }
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
        return msgId;
    }

    sendFile(fileName, fileType, fileData, recipientId = 'all', isVolatile = false, volatileDuration = 0, msgId = null) {
        if (!msgId) {
            msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        const data = {
            type: 'file',
            msgId,
            fileName,
            fileType,
            fileData,
            recipientId,
            nickname: this.nickname,
            color: this.myColor,
            isVolatile,
            volatileDuration
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
        return msgId;
    }

    sendReadReceipts(msgIds) {
        if (!Array.isArray(msgIds) || msgIds.length === 0) return;
        const data = {
            type: 'read-receipt',
            msgIds,
            readerPeerId: this.myPeerId
        };
        if (this.isHost) {
            this._broadcast(data);
            this.onReadReceipt(this.myPeerId, msgIds);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    sendEmoji(emoji, isVolatile = false, volatileDuration = 0) {
        const data = { type: 'emoji', emoji, nickname: this.nickname, color: this.myColor, isVolatile, volatileDuration };
        if (this.isHost) {
            this._broadcast(data);
            this.onEmoji(this.myPeerId, emoji, this.nickname, this.myColor, isVolatile, volatileDuration);
        } else {
            this.connections.forEach(info => {
                try { info.conn.send(data); } catch(e) {}
            });
        }
    }

    async isConnectionRelayed(recipientId = 'all') {
        const checkPC = async (pc) => {
            if (!pc) return false;
            try {
                const stats = await pc.getStats();
                let isRelay = false;
                stats.forEach(report => {
                    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        const local = stats.get(report.localCandidateId);
                        const remote = stats.get(report.remoteCandidateId);
                        if ((local && local.candidateType === 'relay') || 
                            (remote && remote.candidateType === 'relay')) {
                            isRelay = true;
                        }
                    }
                });
                return isRelay;
            } catch (e) {
                return false;
            }
        };

        if (recipientId === 'all') {
            for (const [pid, info] of this.connections) {
                if (await checkPC(info.conn?.peerConnection)) {
                    return true;
                }
            }
            return false;
        } else {
            const info = this.connections.get(recipientId);
            return await checkPC(info?.conn?.peerConnection);
        }
    }

    sendLaser(pointsOrAction, color) {
        const data = { type: 'laser' };
        if (Array.isArray(pointsOrAction)) {
            data.points = pointsOrAction;
            data.color = color;
        } else {
            data.action = pointsOrAction;
        }
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
        return this.coordinatorId || null;
    }

    /* ---------- Database Synchronizer & Peer Recovery ---------- */

    async _syncRoomWithDb(peerIds) {
        try {
            const response = await fetch(`${CLOUDFLARE_WORKER_URL}/api/rooms/${this.roomCode}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ peerIds })
            });
            if (!response.ok) {
                console.warn('[Network] Failed to sync room peer IDs to D1 database');
            }
        } catch (e) {
            console.error('[Network] Database sync request failed:', e);
        }
    }

    getActivePeerIds() {
        const ids = [this.myPeerId];
        this.connections.forEach((info, pid) => {
            ids.push(pid);
        });
        return ids;
    }

    async _handleHostMigration() {
        try {
            console.log('[Network] Querying database for remaining active peers...');
            const response = await fetch(`${CLOUDFLARE_WORKER_URL}/api/rooms/${this.roomCode}`);
            if (!response.ok) throw new Error('Database query error');

            const data = await response.json();
            let peerIds = data.peerIds || [];

            // Filter out the dead coordinator
            peerIds = peerIds.filter(id => id !== this.coordinatorId);

            if (peerIds.length === 0) {
                console.log('[Network] No peers left in room. Staying as idle client.');
                return;
            }

            const nextCoordinatorId = peerIds[0];

            if (nextCoordinatorId === this.myPeerId) {
                // I am the new Host!
                console.log('[Network] I am the oldest remaining peer. Promoting to Host/Coordinator.');
                this.isHost = true;
                this.coordinatorId = this.myPeerId;
                this.connections.clear();

                // Re-bind connection handler for incoming guests
                this.peer.on('connection', (conn) => {
                    this._handleIncomingConnection(conn);
                });

                // Sync new state to DB
                await this._syncRoomWithDb(this.getActivePeerIds());

                // Trigger self onPeerJoin update to notify UI of promotion
                this.onPeerJoin(this.myPeerId, this.nickname, this.myColor, false);
                
                // Show notification in studio
                if (typeof showToast === 'function') {
                    showToast('👑 내가 방장이 되었습니다! 방이 유지됩니다.');
                }
            } else {
                // Connect to the new Host
                console.log('[Network] Promoting peer ' + nextCoordinatorId + ' to Host. Connecting...');
                this.coordinatorId = nextCoordinatorId;
                this.connections.clear();

                this._connectToCoordinator(nextCoordinatorId);
            }
        } catch (e) {
            console.error('[Network] Host migration failed:', e);
        }
    }

    _connectToCoordinator(coordinatorId) {
        const conn = this.peer.connect(coordinatorId, {
            reliable: true,
            metadata: { nickname: this.nickname, color: this.myColor }
        });

        conn.on('open', () => {
            console.log('[Network] Reconnected to the new Host:', coordinatorId);
            this.connections.set(coordinatorId, {
                conn,
                nickname: 'Host',
                color: '#ffffff'
            });

            this._setupDataHandler(conn, coordinatorId);

            // Notify new host of our details
            conn.send({
                type: 'join',
                nickname: this.nickname,
                color: this.myColor,
                peerId: this.myPeerId
            });

            // Request state-request to sync canvas
            conn.send({ type: 'state-request' });
        });

        conn.on('error', (err) => {
            console.error('[Network] Failed to connect to the new Host:', err);
            // Retrying migration to find next host candidate
            setTimeout(() => {
                this._handleHostMigration();
            }, 1000);
        });
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
