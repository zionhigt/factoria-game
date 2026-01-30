class Sprite {
    constructor(texture, width = null, height = null, offsetX = 0, offsetY = 0) {
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}

export default Sprite;