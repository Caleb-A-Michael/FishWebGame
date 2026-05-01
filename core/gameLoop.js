import { update, draw } from "../scenes/sceneManager.js";
import { resetInput } from "./input.js";
import { initImages } from "../utils/assetLoading.js";

export async function startGameLoop(ctx) {
    await initImages();

    let lastTime = 0;

    function gameLoop(currentTime) {
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // convert ms to seconds
        lastTime = currentTime;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        update(deltaTime);
        draw(ctx);
        resetInput();

        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}