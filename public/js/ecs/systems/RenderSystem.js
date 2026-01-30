class RenderSystem {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
    }
    
    update(entities) {
        // Filtrer entités avec Position + Sprite
        const renderables = entities.filter(e => 
            e.hasComponent('Position') && e.hasComponent('Sprite')
        );
        
        // Trier par profondeur (z-index iso)
        renderables.sort((a, b) => {
            const posA = a.getComponent('Position');
            const posB = b.getComponent('Position');
            return (posA.x + posA.y) - (posB.x + posB.y);
        });
        
        // Dessiner
        renderables.forEach(entity => {
            const pos = entity.getComponent('Position');
            const sprite = entity.getComponent('Sprite');
            
            this.renderer.drawSprite(sprite, pos.x, pos.y);
        });
    }
}

export default RenderSystem;