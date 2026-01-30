import Game from "./core/Game.js";

const mainCanvas = document.getElementById("mainCanvas");
const game = new Game({
    canvas: mainCanvas,
})

// Charger les assets et démarrer le jeu
game.loadAssets([
    "assets/tiles/grass.png",
    "assets/tiles/water.png",
    "assets/tiles/rock.png",
    "assets/tiles/sand.png",
    "assets/tiles/tree.png",
    "assets/tiles/tile_059.png",
    // Items
    "assets/items/bucket.svg",
    "assets/items/dirt.svg",
    "assets/items/water.svg",
    "assets/items/sand.svg",
    "assets/items/stone.svg",
]).then(() => {
    console.log('Game initialized and ready to play');
})
