/* ========================================
   PicComm - Drawing Canvas Engine
   Manages all canvas drawing operations
   ======================================== */

class DrawingCanvas {
    constructor(mainCanvasEl, tempCanvasEl, options = {}) {
        this.mainCanvas = mainCanvasEl;
        this.tempCanvas = tempCanvasEl;
        this.mainCtx = mainCanvasEl.getContext('2d');
        this.tempCtx = tempCanvasEl.getContext('2d');

        // Logical canvas resolution (fixed for consistency across users)
        this.CANVAS_WIDTH = 1920;
        this.CANVAS_HEIGHT = 1080;

        // State
        this.actions = [];
        this.redoStack = [];
        this.backgroundImage = null;   // HTMLImageElement
        this.backgroundDataUrl = null; // For sync
        this.backgroundColor = '#f4eedb';
        this.imageCache = new Map();
        this.editingActionId = null;

        // Current tool settings
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.currentSize = 6;
        this.currentOpacity = 1;

        // Drawing state
        this.isDrawing = false;
        this.currentPath = [];
        this.startPoint = null;
        this.lastPoint = null;

        // Callbacks
        this.onAction = options.onAction || (() => {});
        this.onCursorMove = options.onCursorMove || (() => {});

        // Text input
        this.textInputEl = options.textInputEl || null;
        this._textCallback = null;

        this._init();
    }

    _init() {
        // Set canvas dimensions
        this.mainCanvas.width = this.CANVAS_WIDTH;
        this.mainCanvas.height = this.CANVAS_HEIGHT;
        this.tempCanvas.width = this.CANVAS_WIDTH;
        this.tempCanvas.height = this.CANVAS_HEIGHT;

        // Default context settings
        this.mainCtx.lineCap = 'round';
        this.mainCtx.lineJoin = 'round';
        this.tempCtx.lineCap = 'round';
        this.tempCtx.lineJoin = 'round';

        this._setupEvents();
        this._fillBackground();
    }

    _fillBackground() {
        this.mainCtx.fillStyle = this.backgroundColor;
        this.mainCtx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    /* ---------- Coordinate Helpers ---------- */

    _getCanvasPoint(e) {
        const rect = this.tempCanvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.CANVAS_WIDTH / rect.width),
            y: (e.clientY - rect.top) * (this.CANVAS_HEIGHT / rect.height)
        };
    }

    _screenFromCanvas(cx, cy) {
        const rect = this.tempCanvas.getBoundingClientRect();
        return {
            x: cx * (rect.width / this.CANVAS_WIDTH) + rect.left,
            y: cy * (rect.height / this.CANVAS_HEIGHT) + rect.top
        };
    }

    /* ---------- Event Handlers ---------- */

    _setupEvents() {
        // Mouse events
        this.tempCanvas.addEventListener('mousedown', (e) => this._onPointerDown(e));
        this.tempCanvas.addEventListener('mousemove', (e) => this._onPointerMove(e));
        this.tempCanvas.addEventListener('mouseup', (e) => this._onPointerUp(e));
        this.tempCanvas.addEventListener('mouseleave', (e) => {
            if (this.isDrawing) this._onPointerUp(e);
        });

        // Touch events
        this.tempCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onPointerDown(touch);
        }, { passive: false });
        this.tempCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onPointerMove(touch);
        }, { passive: false });
        this.tempCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this._onPointerUp(touch);
        }, { passive: false });

        // Cursor position for network
        this.tempCanvas.addEventListener('mousemove', (e) => {
            const pt = this._getCanvasPoint(e);
            this.onCursorMove(pt.x, pt.y);
        });
    }

    _onPointerDown(e) {
        const point = this._getCanvasPoint(e);
        this.startPoint = point;
        this.lastPoint = point;

        if (this.currentTool === 'text') {
            // If already typing, commit current text first, then start new
            if (this._isTextInputActive) {
                this._commitText(this._textPoint);
            }
            this._startTextInput(point);
            return;
        }

        this.isDrawing = true;

        if (this._isFreehandTool()) {
            this.currentPath = [point];
        }
    }

    _onPointerMove(e) {
        if (!this.isDrawing) return;
        const point = this._getCanvasPoint(e);

        if (this._isFreehandTool()) {
            this.currentPath.push(point);
            this.lastPoint = point;

            // Draw path preview on temp canvas to prevent overlapping opacity circles at joints
            this._clearTemp();
            this._drawFreehandPath(this.tempCtx, this.currentPath);
        } else {
            // Shape preview on temp canvas
            this._clearTemp();
            this._drawShapePreview(this.startPoint, point);
        }
    }

    _onPointerUp(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        const point = this._getCanvasPoint(e);

        if (this._isFreehandTool()) {
            this._clearTemp(); // Clear temp canvas
            if (this.currentPath.length > 0) {
                // Simplify path for network efficiency
                const simplified = this._simplifyPath(this.currentPath);
                const action = {
                    type: 'freehand',
                    tool: this.currentTool,
                    points: simplified,
                    color: this.currentTool === 'eraser' ? this.backgroundColor : this.currentColor,
                    size: this.currentTool === 'brush' ? this.currentSize * 2.5 : this.currentSize,
                    opacity: this.currentTool === 'eraser' ? 1 : this.currentOpacity,
                    isEraser: this.currentTool === 'eraser'
                };
                // Commit the completed stroke to the main canvas
                this._renderAction(this.mainCtx, action);
                this._addAction(action);
            }
        } else {
            // Finalize shape
            this._clearTemp();
            const action = {
                type: 'shape',
                shape: this.currentTool,
                x1: this.startPoint.x,
                y1: this.startPoint.y,
                x2: point.x,
                y2: point.y,
                color: this.currentColor,
                size: this.currentSize,
                opacity: this.currentOpacity
            };
            this._renderAction(this.mainCtx, action);
            this._addAction(action);
        }

        this.currentPath = [];
        this.startPoint = null;
        this.lastPoint = null;
    }

    /* ---------- Tool Helpers ---------- */

    _isFreehandTool() {
        return ['pen', 'brush', 'eraser'].includes(this.currentTool);
    }

    /* ---------- Drawing Primitives ---------- */

    _drawFreehandPath(ctx, path) {
        if (path.length === 0) return;
        ctx.save();
        ctx.globalAlpha = this.currentTool === 'eraser' ? 1 : this.currentOpacity;
        ctx.strokeStyle = this.currentTool === 'eraser' ? this.backgroundColor : this.currentColor;
        ctx.lineWidth = this.currentTool === 'brush' ? this.currentSize * 2.5 : this.currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        if (path.length === 1) {
            ctx.lineTo(path[0].x, path[0].y);
        } else {
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
        }
        ctx.stroke();
        ctx.restore();
    }

    _drawShapePreview(from, to) {
        const ctx = this.tempCtx;
        ctx.save();
        ctx.globalAlpha = this.currentOpacity;
        ctx.strokeStyle = this.currentColor;
        ctx.lineWidth = this.currentSize;
        ctx.setLineDash([6, 4]);

        switch (this.currentTool) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
                break;
            case 'rectangle':
                ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
                break;
            case 'circle': {
                const rx = Math.abs(to.x - from.x) / 2;
                const ry = Math.abs(to.y - from.y) / 2;
                const cx = from.x + (to.x - from.x) / 2;
                const cy = from.y + (to.y - from.y) / 2;
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 'arrow':
                this._drawArrow(ctx, from.x, from.y, to.x, to.y);
                break;
        }
        ctx.restore();
    }

    _drawArrow(ctx, x1, y1, x2, y2) {
        const headLen = Math.max(15, this.currentSize * 4);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // Arrowhead
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    _renderAction(ctx, action) {
        ctx.save();
        ctx.globalAlpha = action.opacity || 1;
        ctx.strokeStyle = action.isEraser ? this.backgroundColor : action.color;
        ctx.fillStyle = action.isEraser ? this.backgroundColor : action.color;
        ctx.lineWidth = action.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (action.type) {
            case 'freehand':
                if (action.points && action.points.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(action.points[0].x, action.points[0].y);
                    for (let i = 1; i < action.points.length; i++) {
                        ctx.lineTo(action.points[i].x, action.points[i].y);
                    }
                    ctx.stroke();
                }
                break;

            case 'shape':
                ctx.setLineDash([]);
                switch (action.shape) {
                    case 'line':
                        ctx.beginPath();
                        ctx.moveTo(action.x1, action.y1);
                        ctx.lineTo(action.x2, action.y2);
                        ctx.stroke();
                        break;
                    case 'rectangle':
                        ctx.strokeRect(action.x1, action.y1, action.x2 - action.x1, action.y2 - action.y1);
                        break;
                    case 'circle': {
                        const rx = Math.abs(action.x2 - action.x1) / 2;
                        const ry = Math.abs(action.y2 - action.y1) / 2;
                        const cx = action.x1 + (action.x2 - action.x1) / 2;
                        const cy = action.y1 + (action.y2 - action.y1) / 2;
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                    }
                    case 'arrow':
                        this._drawArrow(ctx, action.x1, action.y1, action.x2, action.y2);
                        break;
                }
                break;

            case 'text':
                ctx.font = `${action.fontSize || 24}px 'Inter', sans-serif`;
                ctx.fillStyle = action.color;
                ctx.textBaseline = 'top';
                // Draw multi-line text
                const lines = (action.text || '').split('\n');
                const lineHeight = (action.fontSize || 24) * 1.3;
                lines.forEach((line, i) => {
                    ctx.fillText(line, action.x, action.y + i * lineHeight);
                });
                break;

            case 'image':
                const img = this.imageCache.get(action.dataUrl);
                if (img && img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(img, action.x, action.y, action.width, action.height);
                } else {
                    const newImg = new Image();
                    newImg.onload = () => {
                        this.imageCache.set(action.dataUrl, newImg);
                        this.redrawAll();
                    };
                    newImg.src = action.dataUrl;
                }
                break;
        }
        ctx.restore();
    }

    /* ---------- Text Input ---------- */

    _startTextInput(point) {
        if (!this.textInputEl) return;

        // Store the canvas point for this text input session
        this._textPoint = point;
        this._isTextInputActive = true;

        const screen = this._screenFromCanvas(point.x, point.y);
        const container = this.tempCanvas.parentElement;
        const containerRect = container.getBoundingClientRect();

        this.textInputEl.style.left = (screen.x - containerRect.left) + 'px';
        this.textInputEl.style.top = (screen.y - containerRect.top) + 'px';
        this.textInputEl.style.color = this.currentColor;
        this.textInputEl.style.fontSize = Math.max(14, this.currentSize * 3) + 'px';
        this.textInputEl.style.borderColor = this.currentColor;
        this.textInputEl.value = '';
        this.textInputEl.hidden = false;

        // Clean up old listeners before attaching new ones
        this._cleanupTextListeners();

        this._textKeydownHandler = (e) => {
            // Shift+Enter for newlines, Enter to commit
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._commitText(this._textPoint);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this._cancelTextInput();
            }
        };

        this._textBlurHandler = () => {
            // Use setTimeout to allow click events on canvas to fire first
            // (so that clicking elsewhere commits, but clicking a tool button doesn't double-fire)
            setTimeout(() => {
                if (this._isTextInputActive) {
                    if (this.textInputEl.value.trim()) {
                        this._commitText(this._textPoint);
                    } else {
                        this._cancelTextInput();
                    }
                }
            }, 100);
        };

        this.textInputEl.addEventListener('keydown', this._textKeydownHandler);
        this.textInputEl.addEventListener('blur', this._textBlurHandler);

        // Delay focus to ensure the element is visible and the current mousedown is done
        setTimeout(() => {
            this.textInputEl.focus();
        }, 50);
    }

    _commitText(point) {
        if (!this._isTextInputActive) return;

        const text = this.textInputEl.value.trim();
        this._cleanupTextListeners();
        this.textInputEl.hidden = true;
        this._isTextInputActive = false;

        if (!text) return;

        const action = {
            type: 'text',
            text: text,
            x: point.x,
            y: point.y,
            color: this.currentColor,
            fontSize: Math.max(14, this.currentSize * 3),
            opacity: this.currentOpacity
        };
        this._renderAction(this.mainCtx, action);
        this._addAction(action);
    }

    _cancelTextInput() {
        this._cleanupTextListeners();
        this.textInputEl.value = '';
        this.textInputEl.hidden = true;
        this._isTextInputActive = false;
    }

    _cleanupTextListeners() {
        if (this._textKeydownHandler) {
            this.textInputEl.removeEventListener('keydown', this._textKeydownHandler);
            this._textKeydownHandler = null;
        }
        if (this._textBlurHandler) {
            this.textInputEl.removeEventListener('blur', this._textBlurHandler);
            this._textBlurHandler = null;
        }
    }

    /* ---------- Path Simplification ---------- */

    _simplifyPath(points) {
        if (points.length <= 3) return points;
        // Keep every Nth point for efficiency, always keep first and last
        const tolerance = Math.max(1, Math.floor(points.length / 200));
        if (tolerance <= 1) return points;
        const result = [points[0]];
        for (let i = tolerance; i < points.length - 1; i += tolerance) {
            result.push(points[i]);
        }
        result.push(points[points.length - 1]);
        return result;
    }

    /* ---------- Temp Canvas ---------- */

    _clearTemp() {
        this.tempCtx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    /* ---------- Action Management ---------- */

    _addAction(action) {
        if (!action.id) {
            action.id = 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }
        this.actions.push(action);
        this.redoStack = []; // Clear redo on new action
        this.onAction(action);
    }

    replayAction(action) {
        this._renderAction(this.mainCtx, action);
        this.actions.push(action);
    }

    redrawAll() {
        this._fillBackground();
        // Draw background image
        if (this.backgroundImage) {
            this.mainCtx.drawImage(this.backgroundImage, 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        }
        // Replay all actions
        for (const action of this.actions) {
            if (this.editingActionId && action.id === this.editingActionId) continue;
            this._renderAction(this.mainCtx, action);
        }
    }

    undo() {
        if (this.actions.length === 0) return null;
        const action = this.actions.pop();
        this.redoStack.push(action);
        this.redrawAll();
        return action;
    }

    redo() {
        if (this.redoStack.length === 0) return null;
        const action = this.redoStack.pop();
        this.actions.push(action);
        this._renderAction(this.mainCtx, action);
        return action;
    }

    clearAll() {
        this.actions = [];
        this.redoStack = [];
        this.backgroundImage = null;
        this.backgroundDataUrl = null;
        this.redrawAll();
    }

    /* ---------- Background Image ---------- */

    setBackgroundImage(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImage = img;
                this.backgroundDataUrl = dataUrl;
                this.redrawAll();
                resolve();
            };
            img.onerror = () => resolve();
            img.src = dataUrl;
        });
    }

    /* ---------- State Sync ---------- */

    getState() {
        return {
            actions: this.actions,
            backgroundDataUrl: this.backgroundDataUrl,
            backgroundColor: this.backgroundColor
        };
    }

    async loadState(state) {
        this.actions = [];
        this.redoStack = [];
        this.backgroundColor = state.backgroundColor || '#f4eedb';

        if (state.actions) {
            this.actions = [...state.actions];
        }

        if (state.backgroundDataUrl) {
            await this.setBackgroundImage(state.backgroundDataUrl);
        } else {
            this.backgroundImage = null;
            this.backgroundDataUrl = null;
            this.redrawAll();
        }
    }

    /* ---------- Export ---------- */

    exportImage() {
        // Create offscreen canvas with white background
        const offscreen = document.createElement('canvas');
        offscreen.width = this.CANVAS_WIDTH;
        offscreen.height = this.CANVAS_HEIGHT;
        const ctx = offscreen.getContext('2d');

        // Background color
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        // Background image
        if (this.backgroundImage) {
            ctx.drawImage(this.backgroundImage, 0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        }

        // All actions
        for (const action of this.actions) {
            this._renderAction(ctx, action);
        }

        return offscreen.toDataURL('image/png');
    }

    /* ---------- Setters ---------- */

    setTool(tool) { this.currentTool = tool; }
    setColor(color) { this.currentColor = color; }
    setSize(size) { this.currentSize = size; }
    setOpacity(opacity) { this.currentOpacity = opacity; }
    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.redrawAll();
    }

    addImageAction(dataUrl, x, y, width, height) {
        const action = {
            id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: 'image',
            dataUrl: dataUrl,
            x: x,
            y: y,
            width: width,
            height: height
        };
        this._renderAction(this.mainCtx, action);
        this._addAction(action);
        return action;
    }

    updateAction(updatedAction) {
        const idx = this.actions.findIndex(a => a.id === updatedAction.id);
        if (idx !== -1) {
            this.actions[idx] = updatedAction;
            this.redrawAll();
        }
    }

    deleteAction(id) {
        const idx = this.actions.findIndex(a => a.id === id);
        if (idx !== -1) {
            this.actions.splice(idx, 1);
            this.redrawAll();
        }
    }

    /* ---------- Canvas Resize ---------- */

    resize() {
        const container = this.tempCanvas.parentElement;
        if (!container) return;

        const cw = container.clientWidth;
        const ch = container.clientHeight;

        // Maintain aspect ratio
        const aspect = this.CANVAS_WIDTH / this.CANVAS_HEIGHT;
        let w, h;
        if (cw / ch > aspect) {
            h = ch;
            w = h * aspect;
        } else {
            w = cw;
            h = w / aspect;
        }

        this.mainCanvas.style.width = w + 'px';
        this.mainCanvas.style.height = h + 'px';
        this.tempCanvas.style.width = w + 'px';
        this.tempCanvas.style.height = h + 'px';
    }
}
