/**
 * Composant inventaire pour une entité
 */
class Inventory {
    constructor(capacity = 20) {
        this.capacity = capacity;
        this.items = new Map();  // Map<itemType, quantity>
        this.selectedItem = null;
    }

    /**
     * Ajouter un item à l'inventaire
     */
    addItem(itemType, quantity = 1) {
        const current = this.items.get(itemType) || 0;
        const newQuantity = Math.min(current + quantity, this.capacity);
        const added = newQuantity - current;
        
        if (added > 0) {
            this.items.set(itemType, newQuantity);
        }
        
        return added;  // Retourne la quantité réellement ajoutée
    }

    /**
     * Retirer un item
     */
    removeItem(itemType, quantity = 1) {
        const current = this.items.get(itemType) || 0;
        const removed = Math.min(current, quantity);
        
        if (removed > 0) {
            const newQuantity = current - removed;
            if (newQuantity > 0) {
                this.items.set(itemType, newQuantity);
            } else {
                this.items.delete(itemType);
            }
        }
        
        return removed;  // Retourne la quantité réellement retirée
    }

    /**
     * Vérifier la quantité d'un item
     */
    getQuantity(itemType) {
        return this.items.get(itemType) || 0;
    }

    /**
     * Sélectionner un item (pour l'utiliser)
     */
    selectItem(itemType) {
        if (this.getQuantity(itemType) > 0) {
            this.selectedItem = itemType;
            return true;
        }
        return false;
    }

    /**
     * Obtenir l'item sélectionné
     */
    getSelectedItem() {
        return this.selectedItem;
    }

    /**
     * Obtenir tous les items
     */
    getItems() {
        return new Map(this.items);
    }

    /**
     * Vérifier si l'inventaire est plein
     */
    isFull() {
        let total = 0;
        this.items.forEach(qty => total += qty);
        return total >= this.capacity;
    }

    /**
     * Obtenir l'espace disponible
     */
    getAvailableSpace() {
        let total = 0;
        this.items.forEach(qty => total += qty);
        return this.capacity - total;
    }

    /**
     * Reset l'inventaire
     */
    clear() {
        this.items.clear();
        this.selectedItem = null;
    }
}

export default Inventory;
