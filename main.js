import { initDisplay } from "./core/display.js";
import { startGameLoop } from "./core/gameLoop.js";
import { setScene } from "./scenes/sceneManager.js";
import { fishingScene } from "./scenes/fishing/fishingScene.js";

const canvas = document.getElementById("gameCanvas");
initDisplay(canvas);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

setScene(fishingScene, ctx);
startGameLoop(ctx);