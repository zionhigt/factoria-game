/**
 * Système de communication pub/sub (publish/subscribe)
 * Permet aux modules de communiquer sans dépendances directes
 */
class EventBus {
    constructor() {
        // Map<eventName, Set<callback>>
        this.events = new Map();
        
        // Pour debug
        this.debug = false;
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }
    
    /**
     * S'abonner à un événement
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction à appeler
     * @returns {Function} - Fonction pour se désabonner
     */
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        
        this.events.get(eventName).add(callback);
        
        if (this.debug) {
            console.log(`[EventBus] Subscribed to '${eventName}'`);
        }
        
        // Retourne une fonction pour se désabonner facilement
        return () => this.off(eventName, callback);
    }
    
    /**
     * S'abonner à un événement une seule fois
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction à appeler
     */
    once(eventName, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(eventName, wrapper);
        };
        
        this.on(eventName, wrapper);
    }
    
    /**
     * Se désabonner d'un événement
     * @param {string} eventName - Nom de l'événement
     * @param {Function} callback - Fonction à retirer
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) return;
        
        this.events.get(eventName).delete(callback);
        
        // Nettoyer si plus d'abonnés
        if (this.events.get(eventName).size === 0) {
            this.events.delete(eventName);
        }
        
        if (this.debug) {
            console.log(`[EventBus] Unsubscribed from '${eventName}'`);
        }
    }
    
    /**
     * Émettre un événement
     * @param {string} eventName - Nom de l'événement
     * @param {any} data - Données à passer aux callbacks
     */
    emit(eventName, data = null) {
        if (!this.events.has(eventName)) {
            if (this.debug) {
                console.log(`[EventBus] No subscribers for '${eventName}'`);
            }
            return;
        }
        
        const callbacks = this.events.get(eventName);
        
        if (this.debug) {
            console.log(`[EventBus] Emitting '${eventName}' to ${callbacks.size} subscriber(s)`, data);
        }
        
        // Historique pour debug
        if (this.debug) {
            this.eventHistory.push({
                event: eventName,
                data,
                timestamp: Date.now(),
                subscribers: callbacks.size
            });
            
            if (this.eventHistory.length > this.maxHistorySize) {
                this.eventHistory.shift();
            }
        }
        
        // Appeler tous les callbacks
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in callback for '${eventName}':`, error);
            }
        });
    }
    
    /**
     * Émettre un événement de manière asynchrone
     * @param {string} eventName - Nom de l'événement
     * @param {any} data - Données à passer
     */
    emitAsync(eventName, data = null) {
        setTimeout(() => this.emit(eventName, data), 0);
    }
    
    /**
     * Retirer tous les abonnés d'un événement
     * @param {string} eventName - Nom de l'événement
     */
    clear(eventName = null) {
        if (eventName) {
            this.events.delete(eventName);
            if (this.debug) {
                console.log(`[EventBus] Cleared all subscribers for '${eventName}'`);
            }
        } else {
            this.events.clear();
            if (this.debug) {
                console.log(`[EventBus] Cleared all events`);
            }
        }
    }
    
    /**
     * Vérifie si un événement a des abonnés
     * @param {string} eventName - Nom de l'événement
     * @returns {boolean}
     */
    hasSubscribers(eventName) {
        return this.events.has(eventName) && this.events.get(eventName).size > 0;
    }
    
    /**
     * Compte le nombre d'abonnés pour un événement
     * @param {string} eventName - Nom de l'événement
     * @returns {number}
     */
    getSubscriberCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).size : 0;
    }
    
    /**
     * Liste tous les événements actifs
     * @returns {Array<string>}
     */
    getEventNames() {
        return Array.from(this.events.keys());
    }
    
    /**
     * Active/désactive le mode debug
     * @param {boolean} enabled - Activer le debug
     */
    setDebug(enabled) {
        this.debug = enabled;
        if (enabled) {
            console.log('[EventBus] Debug mode enabled');
        }
    }
    
    /**
     * Récupère l'historique des événements (mode debug)
     * @returns {Array}
     */
    getHistory() {
        return this.eventHistory;
    }
    
    /**
     * Affiche les stats de l'EventBus
     */
    printStats() {
        console.log('=== EventBus Stats ===');
        console.log(`Total events: ${this.events.size}`);
        
        this.events.forEach((subscribers, eventName) => {
            console.log(`  ${eventName}: ${subscribers.size} subscriber(s)`);
        });
        
        if (this.debug && this.eventHistory.length > 0) {
            console.log(`\nRecent events (last ${this.eventHistory.length}):`);
            this.eventHistory.slice(-10).forEach(e => {
                console.log(`  ${e.event} - ${e.subscribers} subscriber(s)`);
            });
        }
    }
}

export default EventBus;


// ==========================================
// EXEMPLE D'UTILISATION
// ==========================================

/*
// Créer un EventBus global
const eventBus = new EventBus();

// S'abonner à des événements
eventBus.on('player:move', (data) => {
    console.log(`Player moved to ${data.x}, ${data.y}`);
});

eventBus.on('building:placed', (data) => {
    console.log(`Building ${data.type} placed at ${data.x}, ${data.y}`);
});

// Abonnement unique (se désabonne auto après premier appel)
eventBus.once('game:start', () => {
    console.log('Game started!');
});

// Émettre des événements
eventBus.emit('player:move', { x: 10, y: 5 });
eventBus.emit('building:placed', { type: 'factory', x: 20, y: 15 });

// Se désabonner
const unsubscribe = eventBus.on('resource:collected', (data) => {
    console.log('Resource collected');
});

// Plus tard...
unsubscribe(); // Se désabonne

// Debug
eventBus.setDebug(true);
eventBus.emit('test:event', { foo: 'bar' });
eventBus.printStats();

// Nettoyer
eventBus.clear(); // Retire tous les abonnés
*/