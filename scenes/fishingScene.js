import { mouseX, mouseY, mouseClicked, keyPressed } from "../core/input.js";

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
    sequence: "udlrvha",
    baseTime: 8,
};

// Casting update
const MAX_CAST_DISTANCE = 60;
const WAIT_TIME = 3;

// Casting draw
const CURSOR_RADIUS = 5;
const LURE_RING_RADIUS = 7; 

// Minigame draw
const OVERLAY_OPACITY = 0.5;
const ARROW_SPACING = 100;
const ARROW_Y = 0.5; // proportional to canvas height
const ARROW_FONT_SIZE = 80;
const TIMER_Y = 0.2
const TIMER_FONT_SIZE = 60;


let state = "placement"

// Placement
let lurePos = { x: 0, y: 0 };
let closestPointOnShore = null;
let isMouseInPond = false;

// Waiting
let waitTimer = 0;

// Minigame
let currentFish = null;
let arrowSequence = [];
let currentArrowIndex = 0;
let minigameTimer = 0;

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

function resolveArrowSequence(sequence) {
    return sequence.split("").map(char => {
        switch (char) {
            case "u": return "ArrowUp";
            case "d": return "ArrowDown";
            case "l": return "ArrowLeft";
            case "r": return "ArrowRight";
            case "v": return Math.random() < 0.5 ? "ArrowUp" : "ArrowDown";
            case "h": return Math.random() < 0.5 ? "ArrowLeft" : "ArrowRight";
            case "a": return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"][Math.floor(Math.random() * 4)];
        }
    });
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
    ctx.arc(mouseX, mouseY, CURSOR_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = !isMouseInPond && state === "placement" ? "#ff0000" : "#ffffff";
    ctx.fill();
}

function drawFishingLine(ctx) {
    const angle = Math.atan2(closestPointOnShore.y - lurePos.y, closestPointOnShore.x - lurePos.x);
    const lineStartX = lurePos.x + Math.cos(angle) * LURE_RING_RADIUS;
    const lineStartY = lurePos.y + Math.sin(angle) * LURE_RING_RADIUS;
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(closestPointOnShore.x, closestPointOnShore.y);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
}

function drawLure(ctx) {
    ctx.beginPath();
    ctx.arc(lurePos.x, lurePos.y, LURE_RING_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawMinigame(ctx) {
    // Background overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${OVERLAY_OPACITY})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Arrows
    ctx.font = `${ARROW_FONT_SIZE}px 'Courier New'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height * ARROW_Y;

    for (let i = 0; i < arrowSequence.length; i++) {
        const offset = (i - currentArrowIndex) * ARROW_SPACING;
        const x = centerX + offset;

        // Arrows grayed out if already pressed
        ctx.fillStyle = i < currentArrowIndex ? "#888888" : "#ffffff";
        ctx.fillText(arrowToSymbol(arrowSequence[i]), x, centerY);
    }

    // Timer 
    const timeRemaining = (currentFish.baseTime - minigameTimer).toFixed(1);
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center";
    ctx.font = `${TIMER_FONT_SIZE}px 'Courier New''`;
    ctx.fillText(`${timeRemaining}`, ctx.canvas.width / 2, ctx.canvas.height * TIMER_Y);
}

function arrowToSymbol(arrow) {
    switch (arrow) {
        case "ArrowUp": return "↑";
        case "ArrowDown": return "↓";
        case "ArrowLeft": return "←";
        case "ArrowRight": return "→";
    }
}

// === STATE MACHINE HELPERS ===

function startPlacement() {
    state = "placement";
}

function startWaiting() {
    waitTimer = 0;
    state = "waiting";
}

function startMinigame() {
    currentFish = PLACEHOLDER_FISH;
    arrowSequence = resolveArrowSequence(currentFish.sequence);
    currentArrowIndex = 0;
    console.log(arrowSequence);

    minigameTimer = 0;

    state = "minigame";
}

function startResult(successful) {
    const resultOutput = (successful) ? "You caught the fish!" : "Oh no, the fish got away!";
    console.log(resultOutput);

    state = "result";
}

export const fishingScene = {
    update(deltaTime) {
        isMouseInPond = isInPond(mouseX, mouseY);

        switch (state) {
            case "placement":
                if (isMouseInPond) {
                    updateLurePlacement();
                    if (mouseClicked) startWaiting();
                }
                break;
            case "waiting":
                waitTimer += deltaTime;
                if (waitTimer >= WAIT_TIME) startMinigame();
                if (mouseClicked) startPlacement();
                break;
            case "minigame":
                minigameTimer += deltaTime;
                if (minigameTimer >= currentFish.baseTime) startResult(false);

                if (keyPressed) {
                    if (keyPressed === arrowSequence[currentArrowIndex]) {
                        currentArrowIndex++;
                        if (currentArrowIndex >= arrowSequence.length) startResult(true);
                    } else {
                        startResult(false);
                    }
                }
                break;
            case "result":
                startPlacement();
                break;
        }
    },

    draw(ctx) {
        drawEnvironment(ctx);

        switch (state) {
            case "placement":
                drawCursor(ctx);
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
                drawMinigame(ctx);
                break;
            case "result":
                break;
            
        }
    }
};