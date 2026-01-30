/**
 * Représente une case individuelle de la grille
 */
class Tile {
    constructor(x, y, type = 'grass') {
        this.x = x;
        this.y = y;
        this.type = type;           // 'grass', 'water', 'rock', etc.
        this.entity = null;         // Référence à l'entité sur cette tile
        this.walkable = true;       // Pour pathfinding
        this.buildable = true;      // Peut-on construire dessus ?
        
        // Métadonnées optionnelles
        this.resource = null;       // Ressource présente (minerai, etc.)
        this.elevation = 0;         // Hauteur (pour multi-niveaux futur)
    }
    
    /**
     * Vérifie si la tile est libre
     */
    isEmpty() {
        return this.entity === null;
    }
    
    /**
     * Vérifie si on peut construire
     */
    canBuild() {
        return this.buildable && this.isEmpty();
    }
    
    /**
     * Place une entité sur la tile
     */
    setEntity(entity) {
        this.entity = entity;
    }
    
    /**
     * Retire l'entité
     */
    clearEntity() {
        this.entity = null;
    }
    
    /**
     * Clone la tile
     */
    clone() {
        const tile = new Tile(this.x, this.y, this.type);
        tile.walkable = this.walkable;
        tile.buildable = this.buildable;
        tile.resource = this.resource;
        tile.elevation = this.elevation;
        return tile;
    }
}

export default Tile;