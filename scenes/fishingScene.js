import { mouseX, mouseY } from "../core/input.js";

// Pond boundaries (proportional to canvas size)
const POND_X = 0.2;
const POND_Y = 0.2;
const POND_W = 0.6;
const POND_H = 0.6;

const LURE_RADIUS = 5;

function isInPond(x, y, canvas) {
    const leftEdge = canvas.width * POND_X;
    const rightEdge = leftEdge + (canvas.width * POND_W);
    const topEdge = canvas.height * POND_Y;
    const bottomEdge = topEdge + (canvas.height * POND_H);
    return x > leftEdge && x < rightEdge && y > topEdge && y < bottomEdge;
}

export const fishingScene = {
    update() {

    },

    draw(ctx) {
        // Shore
        ctx.fillStyle = "#78ab46";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Water
        ctx.fillStyle = "#4a90d9";
        ctx.fillRect(ctx.canvas.width * POND_X, ctx.canvas.height * POND_Y, ctx.canvas.width * POND_W, ctx.canvas.height * POND_H);
    
        // Lure
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, LURE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = isInPond(mouseX, mouseY, ctx.canvas) ? "#ffffff" : "#ff0000"
        ctx.fill();
    }
};