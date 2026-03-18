import { update, draw } from "../scenes/sceneManager.js";
import { resetInput } from "./input.js";

export function startGameLoop(ctx) {
    function gameLoop() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        update();
        draw(ctx);
        resetInput();
        
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}