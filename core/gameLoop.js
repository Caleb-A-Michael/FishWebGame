import { update, draw } from "../scenes/sceneManager.js";

export function startGameLoop(ctx) {
    function gameLoop() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        update();
        draw(ctx);
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}