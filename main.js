import { startGameLoop } from "./core/gameLoop.js";
import { setScene } from "./scenes/sceneManager.js";
import { fishingScene } from "./scenes/fishingScene.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

setScene(fishingScene);
startGameLoop(ctx);