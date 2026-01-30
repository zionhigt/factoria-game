import Game from "./core/Game.js";

const mainCanvas = document.getElementById("mainCanvas");
const game = new Game({
    canvas: mainCanvas,
})

game.loadAssets([
    "assets/tiles/grass.png",
    "assets/tiles/water.png",
    "assets/tiles/rock.png",
    "assets/tiles/sand.png",
    "assets/tiles/tree.png",
])
