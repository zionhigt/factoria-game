
import Tile from './Tile.js';
import IsoMath from '../utils/IsoMath.js';
import PerlinNoise from '../utils/PerlinNoise.js';

/**
 * Grille de jeu principale
 */
class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];

        this._init();
    }

    /**
     * Initialise la grille
     */
    _init() {
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = new Tile(x, y);
            }
        }
    }

    /**
     * Récupère une tile
     */
    getTile(x, y) {
        if (!this.inBounds(x, y)) return null;
        return this.tiles[y][x];
    }

    /**
     * Définit le type d'une tile
     */
    setTileType(x, y, type) {
        const tile = this.getTile(x, y);
        if (tile) tile.type = type;
    }

    /**
     * Vérifie si les coordonnées sont dans la grille
     */
    inBounds(x, y) {
        return IsoMath.inBounds(x, y, this.width, this.height);
    }

    /**
     * Récupère les voisins d'une tile
     */
    getNeighbors(x, y) {
        return IsoMath.getNeighbors(x, y)
            .filter(n => this.inBounds(n.x, n.y))
            .map(n => ({
                tile: this.getTile(n.x, n.y),
                direction: n.dir
            }));
    }

    /**
     * Trouve un chemin entre deux points (A* simplifié)
     */
    findPath(startX, startY, endX, endY) {
        // TODO: Implémenter A* ou Dijkstra
        // Pour l'instant retourne un chemin en ligne droite
        const path = [];
        let x = startX;
        let y = startY;

        while (x !== endX || y !== endY) {
            if (x < endX) x++;
            else if (x > endX) x--;
            else if (y < endY) y++;
            else if (y > endY) y--;

            path.push({ x, y });
        }

        return path;
    }
    _seededRandom(seed) {
        let state = seed;
        return function () {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        };
    }

    /**
 * Génération procédurale avec Perlin Noise
 * 
 * @param {number} seed - Seed pour reproductibilité
 * @param {Object} config - Configuration du terrain
 */
    generateTerrain(seed = 0, config = {}) {
        const cfg = {
            octaves: 4,
            persistence: 0.5,
            lacunarity: 2,
            scale: 0.05,

            // Seuils optimisés
            waterLevel: 0.30,      // < 0.30 = eau (30%)
            sandLevel: 0.38,       // 0.30-0.38 = sable (8%)
            grassLevel: 0.75,      // 0.38-0.75 = herbe (37%)
            rockLevel: 0.85,       // 0.75-0.85 = roche dense (10%)
            // > 0.85 = montagnes (15%)

            // Nouveaux paramètres
            treeChance: 0.01,      // 15% de chance d'arbre sur herbe
            scatteredRockChance: 0.05,  // 5% de rochers isolés sur herbe/sable

            ...config
        };

        const perlin = new PerlinNoise(seed);
        const random = this._seededRandom(seed);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const noise = perlin.octave(
                    x, y,
                    cfg.octaves,
                    cfg.persistence,
                    cfg.lacunarity,
                    cfg.scale
                );

                let tileType;

                if (noise < cfg.waterLevel) {
                    tileType = 'water';
                    this.getTile(x, y).walkable = false;
                    this.getTile(x, y).buildable = false;
                } else if (noise < cfg.sandLevel) {
                    tileType = 'sand';

                    // Rochers isolés sur sable
                    if (random() < cfg.scatteredRockChance) {
                        tileType = 'rock';
                        this.getTile(x, y).walkable = false;
                    }
                } else if (noise < cfg.grassLevel) {
                    tileType = 'grass';

                    // Arbres sur herbe
                    if (random() < cfg.treeChance) {
                        tileType = 'tree';
                    }
                    // Rochers isolés sur herbe
                    else if (random() < cfg.scatteredRockChance) {
                        tileType = 'rock';
                        this.getTile(x, y).walkable = false;
                    }
                } else if (noise < cfg.rockLevel) {
                    tileType = 'rock';
                    this.getTile(x, y).walkable = false;
                } else {
                    // Montagnes hautes
                    tileType = 'rock';
                    this.getTile(x, y).walkable = false;
                }

                this.setTileType(x, y, tileType);
            }
        }
    }

    /**
     * Bruit simplifié (remplacer par vrai Perlin si besoin)
     */
    _simpleNoise(x, y, seed) {
        const n = Math.sin(x * 0.1 + seed) * Math.cos(y * 0.1 + seed);
        return (n + 1) / 2; // Normaliser entre 0 et 1
    }

    /**
     * Récupère toutes les tiles d'un type
     */
    getTilesByType(type) {
        const result = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (tile.type === type) {
                    result.push(tile);
                }
            }
        }
        return result;
    }

    /**
     * Vérifie si une zone est libre pour construction
     */
    isAreaFree(x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const tile = this.getTile(x + dx, y + dy);
                if (!tile || !tile.canBuild()) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Réserve une zone pour un bâtiment
     */
    reserveArea(x, y, width, height, entity) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const tile = this.getTile(x + dx, y + dy);
                if (tile) {
                    tile.setEntity(entity);
                }
            }
        }
    }

    /**
     * Libère une zone
     */
    freeArea(x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const tile = this.getTile(x + dx, y + dy);
                if (tile) {
                    tile.clearEntity();
                }
            }
        }
    }

    /**
     * Reset la grille
     */
    clear() {
        this._init();
    }
}

export default Grid;