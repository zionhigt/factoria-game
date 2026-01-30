import IsoMath from '../utils/IsoMath.js';

/**
 * Moteur de rendu isométrique Canvas 2D
 */
class IsoRenderer {
    constructor(ctx, camera, spriteManager) {
        this.ctx = ctx;
        this.camera = camera;
        this.spriteManager = spriteManager;

        // Config rendu
        this.tileWidth = 64;
        this.tileHeight = 32;

        // Couleurs par défaut
        this.colors = {
            grass: '#4CAF50',
            water: '#2196F3',
            rock: '#757575',
            border: '#8B4513',  // Marron pour la bordure
            gridLine: 'rgba(255, 255, 255, 0.1)'
        };

        // Map type → texture path
        this.tileTextures = {
            'grass': 'assets/tiles/grass.png',
            'water': 'assets/tiles/water.png',
            'rock': 'assets/tiles/rock.png',
            'sand': 'assets/tiles/sand.png',
            'border': 'assets/tiles/tile_059.png'
        };

        // Configuration des offsets et échelles par type de tile
        this.tileConfig = {
            'tree': {
                scale: 0.5,        // Échelle à 50%
                offsetY: -25       // Décalage vers le haut de 35px
            },
            // Autres types peuvent être ajoutés ici
        };
    }

    /**
     * Dessine le sélecteur de tile (hover)
     */
    drawTileSelector(gridX, gridY, color = '#FFF', alpha = 0.5) {
        const pos = IsoMath.gridToScreen(gridX, gridY);
        const cam = this.camera.worldToScreen(pos.x, pos.y);
        
        const w = this.tileWidth * this.camera.zoom / 2;
        const h = this.tileHeight * this.camera.zoom / 2;
        
        this.ctx.save();
        
        // Losange de sélection
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cam.x, cam.y);
        this.ctx.lineTo(cam.x + w / 2, cam.y + h / 2);
        this.ctx.lineTo(cam.x, cam.y + h);
        this.ctx.lineTo(cam.x - w / 2, cam.y + h / 2);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Remplissage semi-transparent
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha * 0.3;
        this.ctx.fill();
        
        this.ctx.restore();
    }

    /**
     * Dessine la grille de fond
     */
    renderGrid(grid) {
        const { width, height, tiles } = grid;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = tiles[y][x];

                // Conversion grille → écran iso
                const screen = IsoMath.gridToScreen(x, y);
                const cam = this.camera.worldToScreen(screen.x, screen.y);

                // Vérifier si visible (culling)
                if (!this._isInView(cam.x, cam.y)) continue;

                // Dessiner la tile
                this.drawTile(cam.x, cam.y, tile);
            }
        }
    }

    /**
     * Dessine une tile isométrique (losange)
     */
    drawTile(x, y, tile) {
        // Charger l'image pour ce type (utiliser la map de textures)
        const texturePath = this.tileTextures[tile.type] || `assets/tiles/${tile.type}.png`;
        const img = this.spriteManager.getSprite(texturePath);

        this.ctx.save();

        // Vérifier si l'image est vraiment chargée et valide
        if (img && img.width && img.height && img.complete) {
            // Configuration spécifique au type (scale, offset)
            const config = this.tileConfig[tile.type] || {};
            const scale = config.scale || 1;
            const offsetY = config.offsetY || 0;
            
            // Utiliser les dimensions RÉELLES de l'image avec l'échelle
            const w = img.width * this.camera.zoom * scale;
            const h = img.height * this.camera.zoom * scale;
            
            // DEPTH OFFSET pour compenser l'espace dans le PNG
            const depthOffset = -8 * this.camera.zoom;
            
            this.ctx.drawImage(
                img,
                x - w / 2,
                y - h / 2 - depthOffset + (offsetY * this.camera.zoom),
                w,
                h
            );
        } else {
            // Fallback : losange de couleur (dimensions de projection)
            const w = this.tileWidth * this.camera.zoom;
            const h = this.tileHeight * this.camera.zoom;
            
            this.ctx.fillStyle = this.colors[tile.type] || this.colors.grass;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + w / 2, y + h / 2);
            this.ctx.lineTo(x, y + h);
            this.ctx.lineTo(x - w / 2, y + h / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Dessine un sprite (entité)
     */
    drawSprite(sprite, x, y) {
        const img = this.spriteManager.getSprite(sprite.texture);
        if (!img || !img.complete) return;

        const w = sprite.width || img.width;
        const h = sprite.height || img.height;
        const zoom = this.camera.zoom;

        this.ctx.save();

        // Appliquer offset si défini
        const offsetX = (sprite.offsetX || 0) * zoom;
        const offsetY = (sprite.offsetY || 0) * zoom;

        // Dessiner centré
        this.ctx.drawImage(
            img,
            x - (w * zoom) / 2 + offsetX,
            y - (h * zoom) / 2 + offsetY,
            w * zoom,
            h * zoom
        );

        this.ctx.restore();
    }

    /**
     * Dessine un rectangle iso (pour debug ou sélection)
     */
    drawIsoRect(x, y, width, height, color = '#fff', filled = false) {
        const screen = IsoMath.gridToScreen(x, y);
        const cam = this.camera.worldToScreen(screen.x, screen.y);

        const w = width * this.tileWidth * this.camera.zoom;
        const h = height * this.tileHeight * this.camera.zoom;

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.3;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(cam.x, cam.y);
        this.ctx.lineTo(cam.x + w / 2, cam.y + h / 2);
        this.ctx.lineTo(cam.x, cam.y + h);
        this.ctx.lineTo(cam.x - w / 2, cam.y + h / 2);
        this.ctx.closePath();

        if (filled) this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Dessine du texte en monde iso
     */
    drawText(text, x, y, options = {}) {
        const screen = IsoMath.gridToScreen(x, y);
        const cam = this.camera.worldToScreen(screen.x, screen.y);

        this.ctx.save();
        this.ctx.fillStyle = options.color || '#fff';
        this.ctx.font = options.font || '12px monospace';
        this.ctx.textAlign = options.align || 'center';
        this.ctx.fillText(text, cam.x, cam.y + (options.offsetY || 0));
        this.ctx.restore();
    }

    /**
     * Vérifie si un point est visible à l'écran (frustum culling)
     */
    _isInView(x, y, margin = 100) {
        return x >= -margin &&
            x <= this.ctx.canvas.width + margin &&
            y >= -margin &&
            y <= this.ctx.canvas.height + margin;
    }

    /**
     * Clear complet du canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

export default IsoRenderer;