import { mouseX, mouseY } from "../core/input.js";

// Pond boundaries (proportional to canvas size)
const POND_X = 0.2;
const POND_Y = 0.2;
const POND_W = 0.6;
const POND_H = 0.6;

// Lure placement (in pixels)
const MAX_CAST_DISTANCE = 60;
const TARGET_LURE_RADIUS = 5;
const ACTUAL_LURE_RADIUS = 7;

function isInPond(x, y, canvas) {
    const leftEdge = canvas.width * POND_X;
    const rightEdge = leftEdge + (canvas.width * POND_W);
    const topEdge = canvas.height * POND_Y;
    const bottomEdge = topEdge + (canvas.height * POND_H);

    return x > leftEdge && x < rightEdge && y > topEdge && y < bottomEdge;
}

function getNearestShorePoint(x, y, canvas) {
    const leftEdge = canvas.width * POND_X;
    const distToLeftEdge = x - leftEdge;

    const rightEdge = leftEdge + (canvas.width * POND_W);
    const distToRightEdge = rightEdge - x;

    const topEdge = canvas.height * POND_Y;
    const distToTopEdge = y - topEdge;

    const bottomEdge = topEdge + (canvas.height * POND_H);
    const distToBottomEdge = bottomEdge - y;

    const minDist = Math.min(distToLeftEdge, distToRightEdge, distToTopEdge, distToBottomEdge);
    if (minDist === distToLeftEdge) return { x: leftEdge, y };
    if (minDist === distToRightEdge) return { x: rightEdge, y };
    if (minDist === distToTopEdge) return { x, y: topEdge };
    return { x, y: bottomEdge };
}

export const fishingScene = {
    update() {

    },

    draw(ctx) {
        // === POND ===
        // Shore
        ctx.fillStyle = "#78ab46";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Water
        ctx.fillStyle = "#4a90d9";
        ctx.fillRect(ctx.canvas.width * POND_X, ctx.canvas.height * POND_Y, ctx.canvas.width * POND_W, ctx.canvas.height * POND_H);

        // === LURE PLACEMENT ===
        // Target lure
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, TARGET_LURE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = isInPond(mouseX, mouseY, ctx.canvas) ? "#ffffff" : "#ff0000"
        ctx.fill();

        // Valid placement
        if (isInPond(mouseX, mouseY, ctx.canvas)) {
            let lureX = mouseX;
            let lureY = mouseY;
            const shorePoint = getNearestShorePoint(mouseX, mouseY, ctx.canvas);
            const dist = Math.sqrt((mouseX - shorePoint.x) ** 2 + (mouseY - shorePoint.y) ** 2);
            if (dist > MAX_CAST_DISTANCE) {
                const dx = mouseX - shorePoint.x;
                const dy = mouseY - shorePoint.y;
                lureX = shorePoint.x + (dx / dist) * MAX_CAST_DISTANCE;
                lureY = shorePoint.y + (dy / dist) * MAX_CAST_DISTANCE;
            }

            // Fishing line
            ctx.beginPath();
            const angle = Math.atan2(shorePoint.y - lureY, shorePoint.x - lureX);
            const lineStartX = lureX + Math.cos(angle) * ACTUAL_LURE_RADIUS;
            const lineStartY = lureY + Math.sin(angle) * ACTUAL_LURE_RADIUS;
            ctx.moveTo(lineStartX, lineStartY); // Connect to outer radius of actual lure
            ctx.lineTo(shorePoint.x, shorePoint.y);
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // Actual lure preview
            ctx.beginPath();
            ctx.arc(lureX, lureY, ACTUAL_LURE_RADIUS, 0, Math.PI * 2);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
};