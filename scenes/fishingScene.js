import { mouseX, mouseY, mouseClicked } from "../core/input.js";

// Pond boundaries (pixel cords)
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

const PLACEHOLDER_FISH = {
    sequence: "udlrvvvvhhhhaaaa",
    baseTime: 5,
};

// Lure placement (in pixels)
const MAX_CAST_DISTANCE = 60;
const TARGET_LURE_RADIUS = 5;
const ACTUAL_LURE_RADIUS = 7;

let state = "placement"

let currentFish = null;
let lurePos = { x: 0, y: 0 };
let closestPointOnShore = null;
let isMouseInPond = false;

// === UPDATE HELPERS ===

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

function updateLurePlacement() {
    closestPointOnShore = getNearestShorePoint(mouseX, mouseY);
    const dist = Math.sqrt((mouseX - closestPointOnShore.x) ** 2 + (mouseY - closestPointOnShore.y) ** 2);

    if (dist > MAX_CAST_DISTANCE) {
        const dx = mouseX - closestPointOnShore.x;
        const dy = mouseY - closestPointOnShore.y;
        lurePos.x = closestPointOnShore.x + (dx / dist) * MAX_CAST_DISTANCE;
        lurePos.y = closestPointOnShore.y + (dy / dist) * MAX_CAST_DISTANCE;
    } else {
        lurePos.x = mouseX;
        lurePos.y = mouseY;
    }
}

// === DRAW HELPERS ===

function drawEnvironment(ctx) {
    // Shore
    ctx.fillStyle = "#78ab46";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Water
    ctx.fillStyle = "#4a90d9";
    ctx.beginPath();
    ctx.moveTo(POND_BOUNDARY[0].x, POND_BOUNDARY[0].y);
    for (let i = 1; i < POND_BOUNDARY.length; i++) {
        ctx.lineTo(POND_BOUNDARY[i].x, POND_BOUNDARY[i].y);
    }
    ctx.closePath();
    ctx.fill();
}

function drawCursor(ctx) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, TARGET_LURE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = !isMouseInPond && state == "placement" ? "#ff0000" : "#ffffff";
    ctx.fill();
}

function drawFishingLine(ctx) {
    const angle = Math.atan2(closestPointOnShore.y - lurePos.y, closestPointOnShore.x - lurePos.x);
    const lineStartX = lurePos.x + Math.cos(angle) * ACTUAL_LURE_RADIUS;
    const lineStartY = lurePos.y + Math.sin(angle) * ACTUAL_LURE_RADIUS;
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(closestPointOnShore.x, closestPointOnShore.y);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
}

function drawLure(ctx) {
    ctx.beginPath();
    ctx.arc(lurePos.x, lurePos.y, ACTUAL_LURE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
}

// === STATE MACHINE HELPERS ===

function startPlacement() {
    state = "placement";
}

function startWaiting() {
    currentFish = PLACEHOLDER_FISH;
    state = "waiting";
}

function startMinigame() {
    state = "minigame";
}

function startResult() {
    state = "result";
}

export const fishingScene = {
    update() {
        isMouseInPond = isInPond(mouseX, mouseY);

        switch (state) {
            case "placement":
                if (isMouseInPond) {
                    updateLurePlacement();
                    if (mouseClicked) startWaiting();
                }
                break;
            case "waiting":
                // TODO: make transation to waiting
                if (mouseClicked) startPlacement();
                break;
            case "minigame":
                break;
            case "result":
                break;
        }
    },

    draw(ctx) {
        drawEnvironment(ctx);

        switch (state) {
            case "placement":
                if (isMouseInPond) {
                drawFishingLine(ctx);
                drawLure(ctx);
                }
                break;
            case "waiting":
                drawFishingLine(ctx);
                drawLure(ctx);
                break;
            case "minigame":
                break;
            case "result":
                break;
            
        }

        drawCursor(ctx);
    }
};