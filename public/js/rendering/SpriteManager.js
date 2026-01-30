/**
 * Gestion du cache de sprites/textures
 */
class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.loading = new Map();
    }
    
    /**
     * Charger un sprite
     */
    loadSprite(path) {
        return new Promise((resolve, reject) => {
            // Déjà chargé
            if (this.sprites.has(path)) {
                resolve(this.sprites.get(path));
                return;
            }
            
            // En cours de chargement
            if (this.loading.has(path)) {
                this.loading.get(path).push({ resolve, reject });
                return;
            }
            
            // Nouveau chargement
            this.loading.set(path, [{ resolve, reject }]);
            
            const img = new Image();
            
            img.onload = () => {
                this.sprites.set(path, img);
                
                // Résoudre toutes les promesses en attente
                const waiting = this.loading.get(path);
                waiting.forEach(p => p.resolve(img));
                this.loading.delete(path);
            };
            
            img.onerror = () => {
                const waiting = this.loading.get(path);
                const error = new Error(`Failed to load sprite: ${path}`);
                waiting.forEach(p => p.reject(error));
                this.loading.delete(path);
            };
            
            img.src = path;
        });
    }
    
    /**
     * Charger plusieurs sprites
     */
    async loadSprites(paths) {
        const promises = paths.map(path => this.loadSprite(path));
        return Promise.all(promises);
    }
    
    /**
     * Récupérer un sprite (sync)
     */
    getSprite(path) {
        return this.sprites.get(path);
    }
    
    /**
     * Vérifier si un sprite est chargé
     */
    hasSprite(path) {
        return this.sprites.has(path);
    }
    
    /**
     * Créer un sprite procédural (carré coloré par ex)
     */
    createColorSprite(color, width = 64, height = 64) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        // Bordure
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        
        return img;
    }
    
    /**
     * Nettoyer le cache
     */
    clear() {
        this.sprites.clear();
        this.loading.clear();
    }
    
    /**
     * Stats
     */
    getStats() {
        return {
            loaded: this.sprites.size,
            loading: this.loading.size
        };
    }
}

export default SpriteManager;