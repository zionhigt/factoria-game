/**
 * Gestion de l'UI de la hotbar
 */
class HotbarUI {
    constructor(game, containerId) {
        this.game = game;
        this.container = document.querySelector(containerId);
        this.inventory = game.playerInventory;
        this.resourceManager = game.resourceManager;
        
        // Configuration de la hotbar
        this.slots = 5;
        this.selectedSlot = 0;
        
        this._init();
        this._setupEvents();
    }

    /**
     * Initialiser la hotbar
     */
    _init() {
        // Vider le container d'abord
        this.container.innerHTML = '';
        
        // Créer la hotbar
        const hotbar = document.createElement('div');
        hotbar.id = 'hotbar';
        
        // Créer les slots
        for (let i = 0; i < this.slots; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.dataset.slot = i;
            slot.innerHTML = `<div class="slot-content"></div><div class="slot-label">${i + 1}</div>`;
            
            slot.addEventListener('click', () => this._selectSlot(i));
            
            hotbar.appendChild(slot);
        }
        
        this.container.appendChild(hotbar);
        
        // Référence les slots - chercher seulement dans le hotbar créé
        this.slotElements = Array.from(hotbar.querySelectorAll('.hotbar-slot'));
        
        // Ajouter le seau au slot 0
        this.inventory.addItem('bucket', 1);
        
        this._render();
    }

    /**
     * Sélectionner un slot
     */
    _selectSlot(index) {
        this.selectedSlot = index;
        
        // Mettre à jour la sélection visuelle
        this.slotElements.forEach((slot, i) => {
            slot.classList.toggle('selected', i === index);
        });
        
        // Obtenir l'item du slot et le sélectionner
        const items = Array.from(this.inventory.getItems().entries());
        if (index < items.length) {
            const [itemType] = items[index];
            this.inventory.selectItem(itemType);
            console.log(`📌 ${itemType} sélectionné`);
        } else {
            this.inventory.selectedItem = null;
        }
    }

    /**
     * Rendre la hotbar
     */
    _render() {
        const items = Array.from(this.inventory.getItems().entries());
        
        this.slotElements.forEach((slotEl, index) => {
            const contentDiv = slotEl.querySelector('.slot-content');
            
            if (!contentDiv) {
                console.warn(`⚠️ Slot ${index} n'a pas de .slot-content`);
                return;
            }
            
            contentDiv.innerHTML = '';
            
            if (index < items.length) {
                const [itemType, quantity] = items[index];
                const itemInfo = this.resourceManager.getItemInfo(itemType);
                
                if (itemInfo) {
                    // Créer une img pour l'icône SVG
                    const img = document.createElement('img');
                    img.src = itemInfo.icon;
                    img.alt = itemInfo.name;
                    img.title = itemInfo.name;
                    contentDiv.appendChild(img);
                    
                    // Ajouter la quantité
                    const qtyDiv = document.createElement('div');
                    qtyDiv.className = 'slot-quantity';
                    qtyDiv.textContent = quantity;
                    contentDiv.appendChild(qtyDiv);
                }
            }
            
            // Marquer le slot sélectionné
            slotEl.classList.toggle('selected', index === this.selectedSlot);
        });
    }

    /**
     * Setup des événements
     */
    _setupEvents() {
        // Écouter les updates d'inventaire
        this.game.eventBus.on('inventory:update', () => {
            this._render();
        });
        
        // Clavier - numéros 1-5 pour sélectionner les slots
        window.addEventListener('keydown', (e) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= this.slots) {
                this._selectSlot(key - 1);
            }
        });
    }
}

export default HotbarUI;
