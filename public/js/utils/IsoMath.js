/**
 * Utilitaires mathématiques pour projection isométrique
 */
const IsoMath = {
    TILE_WIDTH: 32,
    TILE_HEIGHT: 16,
    
    /**
     * Convertir coordonnées grille → écran iso
     */
    gridToScreen(gridX, gridY) {
        return {
            x: (gridX - gridY) * (this.TILE_WIDTH / 2),
            y: (gridX + gridY) * (this.TILE_HEIGHT / 2)
        };
    },
    
    /**
     * Convertir coordonnées écran → grille
     */
    screenToGrid(screenX, screenY) {
        const gridX = (screenX / (this.TILE_WIDTH / 2) + screenY / (this.TILE_HEIGHT / 2)) / 2;
        const gridY = (screenY / (this.TILE_HEIGHT / 2) - screenX / (this.TILE_WIDTH / 2)) / 2;
        
        return {
            x: Math.floor(gridX),
            y: Math.floor(gridY)
        };
    },
    
    /**
     * Distance entre deux points grille
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    /**
     * Distance Manhattan (pour pathfinding)
     */
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    },
    
    /**
     * Vérifier si une position est dans les limites
     */
    inBounds(x, y, width, height) {
        return x >= 0 && x < width && y >= 0 && y < height;
    },
    
    /**
     * Obtenir les voisins d'une tile (4 directions)
     */
    getNeighbors(x, y) {
        return [
            { x: x + 1, y: y, dir: 'east' },
            { x: x - 1, y: y, dir: 'west' },
            { x: x, y: y + 1, dir: 'south' },
            { x: x, y: y - 1, dir: 'north' }
        ];
    },
    
    /**
     * Obtenir direction entre deux points
     */
    getDirection(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'east' : 'west';
        } else {
            return dy > 0 ? 'south' : 'north';
        }
    }
};

export default IsoMath;