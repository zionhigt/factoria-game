class GameLoop {

    constructor(update, render, config={}) {
        this.frameRate = config.frameRate || 60; // FPS
        this.timeDelta = Number.parseInt(1000 / this.frameRate);
        this.running = false;
        this.update = update;
        this.render = render;
        this.timeOut = null;
    }

    start() {
        this.stop();
        this.running = true;
        this.timeOut = setInterval(
            function(update, render, delta) {
                render();
                update(delta);
            }.bind(this),
            this.timeDelta,
            this.update,
            this.render,
            this.timeDelta,
        );
        
    }

    stop() {
        if (this.timeOut) clearInterval(timeout);
        this.running = false;
        this.timeOut = null;
    }

}

export default GameLoop;