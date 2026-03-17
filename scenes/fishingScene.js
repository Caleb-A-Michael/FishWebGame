import { mouseX, mouseY } from "../core/input.js";

// Pond boundaries (proportional to canvas size)
const POND_BOUNDARY = [
    { x: 80, y: 140 },
    { x: 160, y: 100 },
    { x: 280, y: 80 },
    { x: 400, y: 90 },
    { x: 500, y: 120 },
    { x: 560, y: 170 },
    { x: 540, y: 230 },
    { x: 460, y: 278 },
    { x: 343, y: 290 },
    { x: 200, y: 280 },
    { x: 100, y: 250 },
    { x: 60, y: 200 }
];

// Lure placement (in pixels)
const MAX_CAST_DISTANCE = 60;
const TARGET_LURE_RADIUS = 5;
const ACTUAL_LURE_RADIUS = 7;

function isInPond(x, y) {
    let inside = false;
    for (let i = 0, j = POND_BOUNDARY.length - 1; i < POND_BOUNDARY.length; i++) {
        const xi = POND_BOUNDARY[i].x;
        const yi = POND_BOUNDARY[i].y;
        const xj = POND_BOUNDARY[j].x;
        const yj = POND_BOUNDARY[j].y;

        const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersects) inside = !inside;

        j = i;
    }
    return inside;
}

function getNearestShorePoint(x, y) {
    let nearestPoint = null;
    let nearestDist = Infinity;

    for (let i = 0, j = POND_BOUNDARY.length - 1; i < POND_BOUNDARY.length; i++) {
        const xi = POND_BOUNDARY[i].x;
        const yi = POND_BOUNDARY[i].y;
        const xj = POND_BOUNDARY[j].x;
        const yj = POND_BOUNDARY[j].y;

        const dx = xi - xj;
        const dy = yi - yj;
        const edgeLengthSq = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((x - xj) * dx + (y - yj) * dy) / edgeLengthSq)); 

        const closestX = xj + t * dx;
        const closestY = yj + t * dy;
        const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearestPoint = { x: closestX, y: closestY};
        }

        j = i;
    }

    return nearestPoint;
}

export const fishingScene = {
    update() {

    },

    draw(ctx) {
        // === ENVIORMENT ===
        // Shore
        ctx.fillStyle = "#78ab46";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Water
        ctx.fillStyle = "#4a90d9";
        ctx.beginPath();
        ctx.moveTo(POND_BOUNDARY[0].x, POND_BOUNDARY[0].y);
        for (let i = 0; i < POND_BOUNDARY.length; i++) {
            ctx.lineTo(POND_BOUNDARY[i].x, POND_BOUNDARY[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // === LURE PLACEMENT ===
        // Target lure
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, TARGET_LURE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = isInPond(mouseX, mouseY) ? "#ffffff" : "#ff0000"
        ctx.fill();

        // Valid placement
        if (isInPond(mouseX, mouseY)) {
            let lureX = mouseX;
            let lureY = mouseY;
            const shorePoint = getNearestShorePoint(mouseX, mouseY);
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