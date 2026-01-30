import Grid from './Grid.js';
import Entity from '../ecs/Entity.js';

/**
 * Gère l'état du monde et toutes les entités
 */
class WorldManager {
    constructor(width = 50, height = 50) {
        this.grid = new Grid(width, height);
        this.entities = new Map();  // Map<entityId, Entity>
        this.nextEntityId = 0;
        
        // Stats
        this.tickCount = 0;
    }
    
    /**
     * Ajoute une entité au monde
     */
    addEntity(entity) {
        if (!entity.id) {
            entity.id = `entity_${this.nextEntityId++}`;
        }
        
        this.entities.set(entity.id, entity);
        
        // Si l'entité a une position, l'ajouter à la grille
        const posComp = entity.getComponent('Position');
        if (posComp) {
            const tile = this.grid.getTile(posComp.x, posComp.y);
            if (tile) {
                tile.setEntity(entity);
            }
        }
        
        return entity;
    }
    
    /**
     * Retire une entité du monde
     */
    removeEntity(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) return false;
        
        // Retirer de la grille
        const posComp = entity.getComponent('Position');
        if (posComp) {
            const tile = this.grid.getTile(posComp.x, posComp.y);
            if (tile && tile.entity === entity) {
                tile.clearEntity();
            }
        }
        
        this.entities.delete(entityId);
        return true;
    }
    
    /**
     * Récupère une entité par ID
     */
    getEntity(entityId) {
        return this.entities.get(entityId);
    }
    
    /**
     * Récupère toutes les entités
     */
    getEntities() {
        return Array.from(this.entities.values());
    }
    
    /**
     * Récupère les entités avec certains components
     */
    getEntitiesWith(...componentNames) {
        return this.getEntities().filter(entity => 
            componentNames.every(name => entity.hasComponent(name))
        );
    }
    
    /**
     * Récupère l'entité à une position
     */
    getEntityAt(x, y) {
        const tile = this.grid.getTile(x, y);
        return tile ? tile.entity : null;
    }
    
    /**
     * Place un bâtiment sur la grille
     */
    placeBuilding(x, y, type, data = {}) {
        // Vérifier si on peut construire
        const width = data.width || 1;
        const height = data.height || 1;
        
        if (!this.grid.isAreaFree(x, y, width, height)) {
            console.warn(`Cannot build at ${x},${y} - area not free`);
            return null;
        }
        
        // Créer l'entité (sera fait par un BuildingFactory plus tard)
        const entity = new Entity();
        // TODO: Ajouter les components selon le type
        
        // Réserver la zone
        this.grid.reserveArea(x, y, width, height, entity);
        
        // Ajouter au monde
        this.addEntity(entity);
        
        console.log(`Building ${type} placed at ${x},${y}`);
        return entity;
    }
    
    /**
     * Déplace une entité
     */
    moveEntity(entityId, newX, newY) {
        const entity = this.getEntity(entityId);
        if (!entity) return false;
        
        const posComp = entity.getComponent('Position');
        if (!posComp) return false;
        
        // Retirer de l'ancienne tile
        const oldTile = this.grid.getTile(posComp.x, posComp.y);
        if (oldTile && oldTile.entity === entity) {
            oldTile.clearEntity();
        }
        
        // Vérifier nouvelle position
        const newTile = this.grid.getTile(newX, newY);
        if (!newTile || !newTile.isEmpty()) return false;
        
        // Mettre à jour
        posComp.x = newX;
        posComp.y = newY;
        newTile.setEntity(entity);
        
        return true;
    }
    
    /**
     * Génère le terrain initial
     */
    generateWorld(seed) {
        this.grid.generateTerrain(seed);
        this._createBorder();
        console.log(`World generated with seed: ${seed}`);
    }

    /**
     * Crée une bordure incassable autour de la map
     */
    _createBorder() {
        const { width, height } = this.grid;
        
        // Bordures haut et bas
        for (let x = 0; x < width; x++) {
            this.grid.getTile(x, 0).type = 'border';
            this.grid.getTile(x, 0).walkable = false;
            this.grid.getTile(x, 0).buildable = false;
            
            this.grid.getTile(x, height - 1).type = 'border';
            this.grid.getTile(x, height - 1).walkable = false;
            this.grid.getTile(x, height - 1).buildable = false;
        }
        
        // Bordures gauche et droite
        for (let y = 0; y < height; y++) {
            this.grid.getTile(0, y).type = 'border';
            this.grid.getTile(0, y).walkable = false;
            this.grid.getTile(0, y).buildable = false;
            
            this.grid.getTile(width - 1, y).type = 'border';
            this.grid.getTile(width - 1, y).walkable = false;
            this.grid.getTile(width - 1, y).buildable = false;
        }
    }
    
    /**
     * Update du monde (appelé chaque frame si besoin)
     */
    update(deltaTime) {
        this.tickCount++;
        
        // Logique globale du monde ici si besoin
        // (météo, cycles jour/nuit, etc.)
    }
    
    /**
     * Sauvegarde l'état du monde
     */
    serialize() {
        return {
            width: this.grid.width,
            height: this.grid.height,
            entities: this.getEntities().map(e => ({
                id: e.id,
                components: Array.from(e.components.entries())
            })),
            tickCount: this.tickCount
        };
    }
    
    /**
     * Charge un état sauvegardé
     */
    deserialize(data) {
        // TODO: Implémenter le chargement
        console.log('Loading world...', data);
    }
    
    /**
     * Reset complet
     */
    reset() {
        this.entities.clear();
        this.grid.clear();
        this.nextEntityId = 0;
        this.tickCount = 0;
    }
    
    /**
     * Stats du monde
     */
    getStats() {
        return {
            entities: this.entities.size,
            gridSize: `${this.grid.width}x${this.grid.height}`,
            ticks: this.tickCount
        };
    }
}

export default WorldManager;