/**
 * Gère les actions de ramassage et les ressources
 */
class ResourceManager {
    constructor() {
        // Définition des ressources ramassables par type de tile
        this.tileResources = {
            'grass': {
                item: 'dirt',
                quantity: 2,
                name: 'Terre'
            },
            'water': {
                item: 'water',
                quantity: 5,
                requiredTool: 'bucket',  // Nécessite un seau
                name: 'Eau'
            },
            'sand': {
                item: 'sand',
                quantity: 3,
                name: 'Sable'
            },
            'rock': {
                item: 'stone',
                quantity: 1,
                requiredTool: 'pickaxe',  // À implémenter plus tard
                name: 'Pierre'
            }
        };

        // Définition des items
        this.itemDefinitions = {
            'dirt': {
                name: 'Terre',
                icon: 'assets/items/dirt.svg',
                description: 'Ressource basique'
            },
            'water': {
                name: 'Eau',
                icon: 'assets/items/water.svg',
                description: 'Ressource liquide'
            },
            'sand': {
                name: 'Sable',
                icon: 'assets/items/sand.svg',
                description: 'Sable fin'
            },
            'stone': {
                name: 'Pierre',
                icon: 'assets/items/stone.svg',
                description: 'Pierre brute'
            },
            'bucket': {
                name: 'Seau',
                icon: 'assets/items/bucket.svg',
                description: 'Outil pour récupérer de l\'eau'
            }
        };
    }

    /**
     * Vérifier si une tile peut être minée
     */
    canMine(tileType, tool = null) {
        const resource = this.tileResources[tileType];
        if (!resource) return false;

        // Vérifier si un outil est requis
        if (resource.requiredTool && resource.requiredTool !== tool) {
            return false;
        }

        return true;
    }

    /**
     * Obtenir la ressource d'une tile
     */
    getResource(tileType, tool = null) {
        if (!this.canMine(tileType, tool)) {
            return null;
        }

        const resource = this.tileResources[tileType];
        return {
            item: resource.item,
            quantity: resource.quantity,
            name: resource.name
        };
    }

    /**
     * Obtenir les informations d'un item
     */
    getItemInfo(itemType) {
        return this.itemDefinitions[itemType] || null;
    }

    /**
     * Obtenir tous les items définies
     */
    getAllItems() {
        return new Map(Object.entries(this.itemDefinitions));
    }

    /**
     * Obtenir tous les outils
     */
    getTools() {
        return ['bucket'];  // À étendre
    }
}

export default ResourceManager;
