/**
 * Gestion de la caméra (position, zoom, pan)
 */
class Camera {
    constructor(viewportWidth, viewportHeight, init={}) {
        this.x = init.x || 0;
        this.y = init.y || 0;
        this.zoom = init.zoom || 1;
        
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        
        // Limites
        this.minZoom = 0.5;
        this.maxZoom = 2;
        
        // Smoothing
        this.targetX = init.targetX || 0;
        this.targetY = init.targetY || 0;
        this.targetZoom = init.targetZoom || 1;
        this.smoothing = 0.4;
    }
    
    /**
     * Déplacer la caméra
     */
    move(dx, dy) {
        this.targetX += dx;
        this.targetY += dy;
    }
    
    /**
     * Définir position absolue
     */
    setPosition(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    
    /**
     * Zoomer
     */
    setZoom(zoom) {
        this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }
    
    /**
     * Zoomer relatif
     */
    zoom(delta) {
        this.setZoom(this.targetZoom + delta);
    }
    
    /**
     * Update avec smoothing
     */
    update(deltaTime) {
        // Lerp position
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
        
        // Lerp zoom
        this.zoom += (this.targetZoom - this.zoom) * this.smoothing;
    }
    
    /**
     * Convertir coordonnées monde → écran
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom + this.viewportWidth / 2,
            y: (worldY - this.y) * this.zoom + this.viewportHeight / 2
        };
    }
    
    /**
     * Convertir coordonnées écran → monde
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.viewportWidth / 2) / this.zoom + this.x,
            y: (screenY - this.viewportHeight / 2) / this.zoom + this.y
        };
    }
    
    /**
     * Centrer sur un point du monde
     */
    centerOn(worldX, worldY) {
        this.setPosition(worldX, worldY);
    }
    
    /**
     * Reset
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.zoom = 1;
        this.targetZoom = 1;
    }
}

export default Camera;