/**
 * Entité de base (ID + components)
 */
class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
    }
    
    addComponent(component) {
        const name = component.constructor.name;
        this.components.set(name, component);
        return this;
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    hasComponent(name) {
        return this.components.has(name);
    }
    
    removeComponent(name) {
        this.components.delete(name);
    }
}

export default Entity;