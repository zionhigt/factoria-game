import EventBus from '../utils/EventBus.js';

/**
 * Gère toute l'interface utilisateur
 */
class UIManager {
    constructor(game, containerSelector) {
        this.game = game;
        this.eventBus = new EventBus();
        
        this.container = document.querySelector(containerSelector) || document.body;
        // État UI
        this.inventoryOpen = false;
        this.selectedHotbarSlot = 0; // 0-8
        this.hoveredTile = null;
        
        // Inventaire (pour l'instant juste du sable)
        this.inventory = [
            { type: 'sand', name: 'Sable', quantity: Infinity }
        ];
        
        // Elements DOM
        this.hotbar = null;
        this.inventoryPanel = null;
        
        this._init();
    }
    
    /**
     * Initialise l'UI
     */
    _init() {
        this._createHotbar(document.getElementById("bottom-panel"));
        this._createInventory();
        this._createTileHighlight();
        this._bindEvents();
    }
    
    /**
     * Crée la hotbar Minecraft
     */
    _createHotbar(container) {
        const hotbar = document.createElement('div');
        hotbar.id = 'hotbar';
        
        // 9 slots
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.dataset.slot = i;
            
            // Premier slot = sable
            if (i === 0) {
                const img = document.createElement('img');
                img.src = 'assets/tiles/sand.png';
                img.style.cssText = `
                    width: 32px;
                    height: 32px;
                    image-rendering: pixelated;
                    image-rendering: crisp-edges;
                `;
                img.onerror = () => {
                    // Fallback si l'image ne charge pas
                    slot.textContent = 'Sable';
                    slot.style.fontSize = '10px';
                };
                slot.appendChild(img);
            }
            
            // Sélection
            if (i === this.selectedHotbarSlot) {
                slot.style.border = '2px solid white';
                slot.style.background = 'rgba(200, 200, 200, 0.8)';
            }
            
            slot.addEventListener('click', () => this.selectHotbarSlot(i));
            
            hotbar.appendChild(slot);
        }
        
        container.appendChild(hotbar);
        this.hotbar = hotbar;
    }
    
    /**
     * Crée le panneau d'inventaire
     */
    _createInventory() {
        const panel = document.getElementById("inventory-panel");
        // Bouton sac
        const bagBtn = document.getElementById("bag-btn");
        bagBtn.addEventListener('click', () => this.toggleInventory());
        this.inventoryPanel = panel;
    }
    
    /**
     * Crée l'overlay pour highlight tile
     */
    _createTileHighlight() {
        const highlight = document.createElement('div');
        highlight.id = 'tile-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            pointer-events: none;
            display: none;
        `;
        this.container.appendChild(highlight);
        this.highlightElement = highlight;
    }
    
    /**
     * Bind les events
     */
    _bindEvents() {
        // Sélection hotbar par chiffres 1-9
        window.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.selectHotbarSlot(parseInt(e.key) - 1);
            }
            
            // Tab pour inventaire
            if (e.key === 'Tab') {
                e.preventDefault();
                this.toggleInventory();
            }
        });
        
        // Écouter les events du jeu
        this.game.eventBus.on('tile:hover', (data) => {
            this.hoveredTile = data;
            this.updateTileHighlight(data);
        });
        
        this.game.eventBus.on('tile:click', (data) => {
            this.handleTileClick(data);
        });
    }
    
    /**
     * Sélectionne un slot de la hotbar
     */
    selectHotbarSlot(index) {
        if (index < 0 || index > 8) return;
        
        this.selectedHotbarSlot = index;
        
        // Update visuel
        const slots = this.hotbar.querySelectorAll('.hotbar-slot');
        slots.forEach((slot, i) => {
            if (i === index) {
                slot.style.border = '2px solid white';
                slot.style.background = 'rgba(200, 200, 200, 0.8)';
            } else {
                slot.style.border = '2px solid rgba(255, 255, 255, 0.5)';
                slot.style.background = 'rgba(139, 139, 139, 0.8)';
            }
        });
        
        this.game.eventBus.emit('hotbar:select', { slot: index });
    }
    
    /**
     * Toggle inventaire
     */
    toggleInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        // TODO: Ouvrir panel complet inventaire
        console.log('Inventaire:', this.inventoryOpen ? 'Ouvert' : 'Fermé');
    }
    
    /**
     * Update l'affichage de la tile survolée
     */
    updateTileHighlight(data) {
        if (!data) {
            this.highlightElement.style.display = 'none';
            return;
        }
        
        this.highlightElement.style.display = 'block';
        this.highlightElement.innerHTML = `
            Position: (${data.gridX}, ${data.gridY})<br>
            Type: ${data.tile.type}<br>
            camera: <br>
            ${(function() {
                return Object.keys(data.camera).map(item => {
                    return `${item} : ${data.camera[item]}`;
                }).join("<br>")
            })()}
        `;
    }
    
    /**
     * Gère le clic sur une tile
     */
    handleTileClick(data) {
        // Si slot 0 sélectionné = sable en main
        if (this.selectedHotbarSlot === 0) {
            const item = this.inventory[0];
            
            // Seulement sur grass
            if (data.tile.type === 'grass' && data.tile.isEmpty()) {
                // Placer du sable
                this.game.eventBus.emit('tile:place', {
                    x: data.gridX,
                    y: data.gridY,
                    type: 'sand'
                });
                
                console.log(`Sable placé à (${data.gridX}, ${data.gridY})`);
            }
        }
    }
    
    /**
     * Récupère l'item en main
     */
    getItemInHand() {
        if (this.selectedHotbarSlot === 0) {
            return this.inventory[0];
        }
        return null;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.hotbar) this.hotbar.remove();
        if (this.inventoryPanel) this.inventoryPanel.remove();
        if (this.highlightElement) this.highlightElement.remove();
        this.eventBus.clear();
    }
}

export default UIManager;