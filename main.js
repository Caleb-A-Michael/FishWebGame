import { startGameLoop } from "./core/gameLoop.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

startGameLoop(ctx);