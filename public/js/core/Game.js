import GameLoop from './GameLoop.js'
import SpriteManager from '../rendering/SpriteManager.js';
import Camera from '../rendering/Camera.js';
import IsoRenderer from '../rendering/IsoRenderer.js';
import WorldManager from '../world/WorldManager.js';
import InputManager from "./InputManager.js";
import EventBus from '../utils/EventBus.js';

import UIManager from '../ui/UIManager.js';
import SystemManager from '../ecs/SystemManager.js';
import RenderSystem from '../ecs/systems/RenderSystem.js';

class Game {
    constructor(options) {
        this.canvas = options.canvas;
        this.width = options.width || 1280;
        this.height = options.height || 720;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.eventBus = new EventBus();

        this.spriteManager = new SpriteManager();
        this.camera = new Camera(
            this.width,
            this.height,
            {
                x: 36,
                y: 394,
                zoom: 0.8,
                targetX: 36,
                targetY: 394,
                targetZoom: 0.8,
            }
        );
        this.renderer = new IsoRenderer(this.ctx, this.camera, this.spriteManager);
        this.input = new InputManager(this.canvas, this.camera);
        this.world = new WorldManager();

        this.systemManager = new SystemManager();
        this.ui = new UIManager(this, "#game-container #ui-panel");

        this.running = false;
        this.paused = false;

        this.hoveredTile = null;

        this._setupEvents();
        // _init() sera appelé après le chargement des assets
    }

    _setupEvents() {
        // Placement de building
        this.eventBus.on('building:place', (data) => {
            this.world.placeBuilding(data.x, data.y, data.type);
        });
        
        // Pause/Resume
        this.eventBus.on('game:pause', () => this.pause());
        this.eventBus.on('game:resume', () => this.resume());
        
        this.input.on('tile:click', (gridPos) => {
            const tile = this.world.grid.getTile(gridPos.x, gridPos.y);
            if (tile) {
                this.eventBus.emit('tile:click', { 
                    gridX: gridPos.x, 
                    gridY: gridPos.y, 
                    tile
                });
            }
        });
        this.input.on('camera:move', (delta) => {
            this.camera.move(delta.x, delta.y);
        });

        this.input.on('mouse:gridmove', (data) => {
            const tile = this.world.grid.getTile(data.x, data.y);
            if (tile) {
                this.hoveredTile = { 
                    gridX: data.x, 
                    gridY: data.y, 
                    tile,
                    camera: this.camera,
                }
                this.eventBus.emit('tile:hover', this.hoveredTile);
            } else {
                this.hoveredTile = null;
            }
        });

        this.eventBus.on('tile:place', (data) => {
            const tile = this.world.grid.getTile(data.x, data.y);
            if (tile) {
                tile.type = data.type;
            }
        });
    }

    _render() {
        const colors= {
            "grass": "#4cAf50",
            "water": "#4c8baf",
            "rock": "#a1a1a1",
            "sand": "#adaf4c",
        }
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render grid background
        this.renderer.renderGrid(this.world.grid);

        if (this.hoveredTile) {
            this.renderer.drawTileSelector(
                this.hoveredTile.gridX, 
                this.hoveredTile.gridY,
                colors[this.hoveredTile.tile.type],  // Couleur verte
                0.6         // Opacité
            );
        }
        return;
    }
    _update(time) {
        console.log("Loop : " + time);
        this.camera.update(time);
        return;
    }
    _init() {
        this.systemManager.addSystem(new RenderSystem(this.renderer, this.camera));

        this.gameLoop = new GameLoop(
            this._update.bind(this),
            this._render.bind(this),
            {
                frameRate: 12
            }
        )

        this.world.generateWorld(12256897);
        this.gameLoop.start();
    }
    async loadAssets(assetPaths) {
        console.log('📦 Loading assets...');
        await this.spriteManager.loadSprites(assetPaths);
        console.log('✅ Assets loaded');
        this._init(); // Démarrer le jeu après le chargement
    }
}

export default Game;