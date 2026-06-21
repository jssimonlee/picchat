/* ========================================
   PicComm - Network Manager (PeerJS)
   Handles P2P connections via WebRTC
   Star topology: host relays all messages
   ======================================== */

class NetworkManager {
    constructor(callbacks = {}) {
        this.onAction = callbacks.onAction || (() => {});
        this.onUndo = callbacks.onUndo || (() => {});
        this.onRedo = callbacks.onRedo || (() => {});
        this.onClear = callbacks.onClear || (() => {});
        this.onBackground = callbacks.onBackground || (() => {});
        this.onBgColor = callbacks.onBgColor || (() => {});
        this.onStateReceived = callbacks.onStateReceived || (() => {});
        this.onPeerJoin = callbacks.onPeerJoin || (() => {});
        this.onPeerLeave = callbacks.onPeerLeave || (() => {});
        this.onCursorMove = callbacks.onCursorMove || (() => {});
        this.onError = callbacks.onError || (() => {});
        this.onReady = callbacks.onReady || (() => {});

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
        return 'piccomm-' + code.replace('-', '').toLowerCase();
    }

    _nextColor() {
        const color = this._peerColors[this._colorIndex % this._peerColors.length];
        this._colorIndex++;
        return color;
    }

    /* ---------- Create Room (Host) ---------- */

    createRoom(nickname) {
        return new Promise((resolve, reject) => {
            this.isHost = true;
            this.nickname = nickname;
            this.myColor = this._nextColor();
            this.roomCode = this._generateRoomCode();
            const peerId = this._roomCodeToPeerId(this.roomCode);

            this.peer = new Peer(peerId, {
                debug: 0
            });

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
                    // Room code collision, try again
                    this.roomCode = this._generateRoomCode();
                    this.peer.destroy();
                    this.createRoom(nickname).then(resolve).catch(reject);
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
        return new Promise((resolve, reject) => {
            this.isHost = false;
            this.nickname = nickname;
            this.myColor = this._nextColor();
            this.roomCode = roomCode.toUpperCase();

            const hostPeerId = this._roomCodeToPeerId(this.roomCode);
            const myPeerId = hostPeerId + '-' + Math.random().toString(36).substr(2, 6);

            this.peer = new Peer(myPeerId, {
                debug: 0
            });

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
                }
                this.onPeerJoin(fromPeerId, data.nickname, data.color);

                // If host, notify all other peers about the new user
                if (this.isHost) {
                    this._broadcast({
                        type: 'user-joined',
                        peerId: fromPeerId,
                        nickname: data.nickname,
                        color: data.color
                    }, fromPeerId);

                    // Send existing user list to the new peer
                    const users = [{ nickname: this.nickname, color: this.myColor, peerId: this.myPeerId }];
                    this.connections.forEach((info, pid) => {
                        if (pid !== fromPeerId) {
                            users.push({ nickname: info.nickname, color: info.color, peerId: pid });
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
                this.onPeerJoin(data.peerId, data.nickname, data.color);
                break;

            case 'user-left':
                this.onPeerLeave(data.peerId, data.nickname);
                break;

            case 'user-list':
                if (data.users) {
                    data.users.forEach(u => {
                        this.onPeerJoin(u.peerId, u.nickname, u.color);
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
