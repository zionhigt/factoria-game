import IsoMath from '../utils/IsoMath.js';
import EventBus from '../utils/EventBus.js';

/**
 * Gestion complète des inputs (souris, clavier, touch)
 */
class InputManager {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
        this.eventBus = new EventBus();
        
        // État souris
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            gridX: 0,
            gridY: 0,
            down: false,
            button: -1,
            dragStartX: 0,
            dragStartY: 0,
            isDragging: false
        };
        
        // État clavier
        this.keys = new Set();
        this.keysPressed = new Set();  // Pour detecter pressé cette frame
        
        // État touch (mobile)
        this.touches = new Map();
        
        // Config
        this.dragThreshold = 5;  // pixels avant de considérer un drag
        this.panSpeed = 1;
        this.zoomSpeed = 0.1;
        
        // Bind events
        this._bindEvents();
    }
    
    /**
     * Bind tous les événements
     */
    _bindEvents() {
        // Mouse
        this.canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
        this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this._onWheel.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Keyboard
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
        
        // Touch (mobile)
        this.canvas.addEventListener('touchstart', this._onTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this._onTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this._onTouchEnd.bind(this));
        
        // Focus
        this.canvas.tabIndex = 1;
        this.canvas.focus();
    }
    
    /**
     * Mouse Move
     */
    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        
        // Conversion en coordonnées monde
        const world = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
        this.mouse.worldX = world.x;
        this.mouse.worldY = world.y;
        
        // Conversion en grille iso
        const grid = IsoMath.screenToGrid(world.x, world.y);
        if (grid.x !== this.mouse.gridX || grid.y !== this.mouse.gridY) {
            this.mouse.gridX = grid.x;
            this.mouse.gridY = grid.y;
            
            this.eventBus.emit('mouse:gridmove', { 
                x: grid.x, 
                y: grid.y 
            });
        }
        
        // Drag detection
        if (this.mouse.down) {
            const dx = this.mouse.x - this.mouse.dragStartX;
            const dy = this.mouse.y - this.mouse.dragStartY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (!this.mouse.isDragging && distance > this.dragThreshold) {
                this.mouse.isDragging = true;
                this.eventBus.emit('drag:start', { ...this.mouse });
            }
            
            if (this.mouse.isDragging) {
                // Pan caméra avec clic droit ou molette
                if (this.mouse.button === 1 || this.mouse.button === 2) {
                    this.camera.move(-dx * this.panSpeed, -dy * this.panSpeed);
                    this.mouse.dragStartX = this.mouse.x;
                    this.mouse.dragStartY = this.mouse.y;
                    
                    this.eventBus.emit('camera:move', { x: -dx, y: -dy });
                }
                
                this.eventBus.emit('drag:move', { ...this.mouse, dx, dy });
            }
        }
        
        this.eventBus.emit('mouse:move', { ...this.mouse });
    }
    
    /**
     * Mouse Down
     */
    _onMouseDown(e) {
        e.preventDefault();
        
        this.mouse.down = true;
        this.mouse.button = e.button;
        this.mouse.dragStartX = this.mouse.x;
        this.mouse.dragStartY = this.mouse.y;
        this.mouse.isDragging = false;
        
        this.eventBus.emit('mouse:down', { 
            ...this.mouse,
            button: e.button
        });
    }
    
    /**
     * Mouse Up
     */
    _onMouseUp(e) {
        const wasDown = this.mouse.down;
        const wasDragging = this.mouse.isDragging;
        
        this.mouse.down = false;
        this.mouse.isDragging = false;
        
        // Si c'était pas un drag, c'est un click
        if (wasDown && !wasDragging) {
            this.eventBus.emit('mouse:click', {
                ...this.mouse,
                button: e.button
            });
            
            // Click sur une tile
            if (e.button === 0) {  // Clic gauche
                this.eventBus.emit('tile:click', {
                    x: this.mouse.gridX,
                    y: this.mouse.gridY
                });
            }
        }
        
        if (wasDragging) {
            this.eventBus.emit('drag:end', { ...this.mouse });
        }
        
        this.eventBus.emit('mouse:up', {
            ...this.mouse,
            button: e.button
        });
    }
    
    /**
     * Mouse Wheel (zoom)
     */
    _onWheel(e) {
        e.preventDefault();
        
        const delta = -Math.sign(e.deltaY) * this.zoomSpeed;
        this.camera.setZoom(this.camera.targetZoom + delta);
        
        this.eventBus.emit('camera:zoom', { 
            zoom: this.camera.targetZoom,
            delta 
        });
    }
    
    /**
     * Key Down
     */
    _onKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (!this.keys.has(key)) {
            this.keysPressed.add(key);
            this.eventBus.emit('key:pressed', { key });
        }
        
        this.keys.add(key);
        this.eventBus.emit('key:down', { key });
        
        // Raccourcis clavier
        this._handleShortcuts(key, e);
    }
    
    /**
     * Key Up
     */
    _onKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys.delete(key);
        this.eventBus.emit('key:up', { key });
    }
    
    /**
     * Touch Start
     */
    _onTouchStart(e) {
        e.preventDefault();
        
        for (let touch of e.changedTouches) {
            const rect = this.canvas.getBoundingClientRect();
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                startX: touch.clientX - rect.left,
                startY: touch.clientY - rect.top
            });
        }
        
        // Deux doigts = zoom/rotation
        if (this.touches.size === 2) {
            const [t1, t2] = Array.from(this.touches.values());
            this.pinchDistance = this._distance(t1.x, t1.y, t2.x, t2.y);
        }
        
        this.eventBus.emit('touch:start', { touches: this.touches });
    }
    
    /**
     * Touch Move
     */
    _onTouchMove(e) {
        e.preventDefault();
        
        for (let touch of e.changedTouches) {
            const rect = this.canvas.getBoundingClientRect();
            const data = this.touches.get(touch.identifier);
            if (data) {
                data.x = touch.clientX - rect.left;
                data.y = touch.clientY - rect.top;
            }
        }
        
        // Un doigt = pan
        if (this.touches.size === 1) {
            const touch = Array.from(this.touches.values())[0];
            const dx = touch.x - touch.startX;
            const dy = touch.y - touch.startY;
            
            this.camera.move(-dx * this.panSpeed, -dy * this.panSpeed);
            
            touch.startX = touch.x;
            touch.startY = touch.y;
        }
        
        // Deux doigts = pinch zoom
        if (this.touches.size === 2) {
            const [t1, t2] = Array.from(this.touches.values());
            const newDistance = this._distance(t1.x, t1.y, t2.x, t2.y);
            const scale = newDistance / this.pinchDistance;
            
            this.camera.setZoom(this.camera.zoom * scale);
            this.pinchDistance = newDistance;
        }
        
        this.eventBus.emit('touch:move', { touches: this.touches });
    }
    
    /**
     * Touch End
     */
    _onTouchEnd(e) {
        e.preventDefault();
        
        for (let touch of e.changedTouches) {
            this.touches.delete(touch.identifier);
        }
        
        this.eventBus.emit('touch:end', { touches: this.touches });
    }
    
    /**
     * Gestion des raccourcis clavier
     */
    _handleShortcuts(key, event) {
        // Pan caméra avec WASD ou flèches
        const panAmount = 20;
        
        switch(key) {
            case 'w':
            case 'arrowup':
                this.camera.move(0, -panAmount);
                break;
            case 's':
            case 'arrowdown':
                this.camera.move(0, panAmount);
                break;
            case 'a':
            case 'arrowleft':
                this.camera.move(-panAmount, 0);
                break;
            case 'd':
            case 'arrowright':
                this.camera.move(panAmount, 0);
                break;
            
            // Zoom
            case '+':
            case '=':
                this.camera.setZoom(this.camera.targetZoom + this.zoomSpeed);
                break;
            case '-':
                this.camera.setZoom(this.camera.targetZoom - this.zoomSpeed);
                break;
            
            // Reset caméra
            case 'r':
                this.camera.reset();
                break;
            
            // Espace = pause
            case ' ':
                event.preventDefault();
                this.eventBus.emit('game:toggle-pause');
                break;
            
            // Escape = cancel/deselect
            case 'escape':
                this.eventBus.emit('ui:cancel');
                break;
        }
    }
    
    /**
     * Update (appelé chaque frame)
     */
    update() {
        // Pan continu avec WASD si maintenu
        const panSpeed = 3;
        
        if (this.isKeyDown('w') || this.isKeyDown('arrowup')) {
            this.camera.move(0, -panSpeed);
        }
        if (this.isKeyDown('s') || this.isKeyDown('arrowdown')) {
            this.camera.move(0, panSpeed);
        }
        if (this.isKeyDown('a') || this.isKeyDown('arrowleft')) {
            this.camera.move(-panSpeed, 0);
        }
        if (this.isKeyDown('d') || this.isKeyDown('arrowright')) {
            this.camera.move(panSpeed, 0);
        }
        
        // Clear pressed keys (pour frame suivante)
        this.keysPressed.clear();
    }
    
    /**
     * Vérifie si une touche est enfoncée
     */
    isKeyDown(key) {
        return this.keys.has(key.toLowerCase());
    }
    
    /**
     * Vérifie si une touche a été pressée cette frame
     */
    isKeyPressed(key) {
        return this.keysPressed.has(key.toLowerCase());
    }
    
    /**
     * Subscribe à un événement
     */
    on(event, callback) {
        this.eventBus.on(event, callback);
    }
    
    /**
     * Unsubscribe d'un événement
     */
    off(event, callback) {
        this.eventBus.off(event, callback);
    }
    
    /**
     * Distance entre deux points
     */
    _distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    /**
     * Récupère la position de la souris en grille
     */
    getGridPosition() {
        return { x: this.mouse.gridX, y: this.mouse.gridY };
    }
    
    /**
     * Récupère la position de la souris en monde
     */
    getWorldPosition() {
        return { x: this.mouse.worldX, y: this.mouse.worldY };
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Retirer tous les listeners
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('mousedown', this._onMouseDown);
        this.canvas.removeEventListener('mouseup', this._onMouseUp);
        this.canvas.removeEventListener('wheel', this._onWheel);
        
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchmove', this._onTouchMove);
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
        
        this.eventBus.clear();
        this.keys.clear();
        this.touches.clear();
    }
}

export default InputManager;