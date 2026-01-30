class SystemManager {
    constructor() {
        this.systems = [];
    }
    
    addSystem(system) {
        this.systems.push(system);
    }
    
    update(entities, deltaTime) {
        this.systems.forEach(system => {
            system.update(entities, deltaTime);
        });
    }
    
    clear() {
        this.systems = [];
    }
}

export default SystemManager;