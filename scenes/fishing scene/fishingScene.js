import { mouseX, mouseY, mouseClicked, keyPressed } from "../../core/input.js";
import { loadWaterBoundary, isInWater, getLurePlacement } from "./waterGeometry.js";

// Water boundaries (pixel cords)
const WATER_BOUNDARY = [
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
    sequence: "aaaaaa",
    baseTime: 3,
    name: "Redgill",
};

let state = "placement";

export const fishingScene = {
    onEnter() {
        loadWaterBoundary({ boundaryPoints: WATER_BOUNDARY });
    },

    update(deltaTime) {
        isMouseInWater = isInWater(mouseX, mouseY);

        switch (state) {
            case "placement":
                updatePlacement(deltaTime);
                break;
            case "waiting":
                updateWaiting(deltaTime);
                break;
            case "minigame":
                updateMinigame(deltaTime);
                break;
            case "result":
                updateResult(deltaTime);
                break;
        }
    },

    draw(ctx) {
        drawEnvironment(ctx);

        switch (state) {
            case "placement":
                drawPlacement(ctx);
                break;
            case "waiting":
                drawWaiting(ctx);
                break;
            case "minigame":
                drawMinigame(ctx);
                break;
            case "result":
                drawResult(ctx);
                break;
        }
    }
};

// #region PLACEMENT STATE

const MAX_CAST_DISTANCE = 60;

const CURSOR_RADIUS = 5;
const LURE_RING_RADIUS = 7; 

let lurePos = { x: 0, y: 0 };
let closestPointOnShore = null;
let isMouseInWater = false;

function startPlacement() {
    state = "placement";
}

function updatePlacement(deltaTime) {
    if (isMouseInWater) {
        ({ lurePos, closestPointOnShore } = getLurePlacement(mouseX, mouseY, MAX_CAST_DISTANCE));
        if (mouseClicked) startWaiting();
    }
}

function drawPlacement(ctx) {
    drawCursor(ctx);
    if (isMouseInWater) {
        drawFishingLine(ctx);
        drawLure(ctx);
    }
}

// #endregion

// #region WAITING STATE

const WAIT_TIME_MIN = 2;
const WAIT_TIME_MAX = 10;

const BITING_FONT_SIZE = 20;
const BITING_Y_OFFSET = 25;

let waitTimer = 0;
let fishBiting = false;

function startWaiting() {
    // Sets wait timer to an int between min and max
    waitTimer = Math.floor(Math.random() * (WAIT_TIME_MAX - WAIT_TIME_MIN + 1)) + WAIT_TIME_MIN;
    state = "waiting";
}

function updateWaiting(deltaTime) {
    if (fishBiting) {
        if (mouseClicked || keyPressed === "ArrowUp") {
            startMinigame();
            return;
        }
    }

    waitTimer -= deltaTime;
    if (waitTimer <= 0) {
        fishBiting = true;
    }
    if (mouseClicked) startPlacement();
}

function drawWaiting(ctx) {
    drawLure(ctx);
    if (fishBiting) {
        drawBiting(ctx);
    }
}

// #endregion

// #region MINIGAME STATE

const OVERLAY_OPACITY = 0.5;
const ARROW_SPACING = 100;
const ARROW_Y = 0.5; // proportional to canvas height
const ARROW_FONT_SIZE = 80;
const TIMER_Y = 0.2;
const TIMER_FONT_SIZE = 60;

let currentFish = null;
let arrowSequence = [];
let currentArrowIndex = 0;
let minigameTimer = 0;
let resultType = null; // Either timeout, wrongInput, or successful

function startMinigame() {
    fishBiting = false;

    currentFish = PLACEHOLDER_FISH;
    arrowSequence = resolveArrowSequence(currentFish.sequence);
    currentArrowIndex = 0;

    minigameTimer = currentFish.baseTime;

    state = "minigame";
}

function updateMinigame(deltaTime) {
    minigameTimer -= deltaTime;
    if (minigameTimer <= 0) startResult("timeout");

    if (keyPressed) {
        if (keyPressed === arrowSequence[currentArrowIndex]) {
            currentArrowIndex++;
            if (currentArrowIndex >= arrowSequence.length) startResult("successful");
        } else {
            startResult("wrongInput");
        }
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

function drawMinigame(ctx) {
    drawDarkout(ctx);
    drawTimer(ctx, false);
    drawArrows(ctx, false);
}

// #endregion

// #region RESULT STATE

// On Successful catch
const RESULT_UPPER_TEXT = "Congrats, you caught a"
const RESULT_UPPER_FONT_SIZE = 30;
const RESULT_UPPER_Y = 0.2;
const RESULT_FISH_FONT_SIZE = 50;
const RESULT_FISH_Y = 0.5;

function startResult(type) {
    resultType = type;

    state = "result";
}

function updateResult(deltaTime) {
    if (mouseClicked) startPlacement();
}

function drawResult(ctx) {
    drawDarkout(ctx);
    if (resultType === "successful") {
        drawSuccess(ctx);
        return;
    }

    // Failure
    if (resultType === "timeout") {
        drawTimer(ctx, true);
        drawArrows(ctx, false);
    } else {
        drawTimer(ctx, false);
        drawArrows(ctx, true);
    }
}

// #endregion

// #region DRAW WORLD

function drawEnvironment(ctx) {
    // Shore
    ctx.fillStyle = "#78ab46";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Water
    ctx.fillStyle = "#4a90d9";
    ctx.beginPath();
    ctx.moveTo(WATER_BOUNDARY[0].x, WATER_BOUNDARY[0].y);
    for (let i = 1; i < WATER_BOUNDARY.length; i++) {
        ctx.lineTo(WATER_BOUNDARY[i].x, WATER_BOUNDARY[i].y);
    }
    ctx.closePath();
    ctx.fill();
}

function drawCursor(ctx) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, CURSOR_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = !isMouseInWater && state === "placement" ? "#ff0000" : "#ffffff";
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

function drawBiting(ctx) {
    ctx.font = `${BITING_FONT_SIZE}px 'Courier New'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("↑", lurePos.x, lurePos.y - BITING_Y_OFFSET);
}


// #endregion

// #region DRAW MINIGAME

function drawDarkout(ctx) {
    ctx.fillStyle = `rgba(0, 0, 0, ${OVERLAY_OPACITY})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawTimer(ctx, failed) {
    ctx.fillStyle = (failed) ? "#ff0000" : "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `${TIMER_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(`${Math.max(0, minigameTimer).toFixed(1)}`, ctx.canvas.width / 2, ctx.canvas.height * TIMER_Y);
}

function arrowToSymbol(arrow) {
    switch (arrow) {
        case "ArrowUp": return "↑";
        case "ArrowDown": return "↓";
        case "ArrowLeft": return "←";
        case "ArrowRight": return "→";
    }
}

function drawArrows(ctx, failed) {
    ctx.font = `${ARROW_FONT_SIZE}px 'Courier New'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height * ARROW_Y;

    for (let i = 0; i < arrowSequence.length; i++) {
        const offset = (i - currentArrowIndex) * ARROW_SPACING;
        const x = centerX + offset;

        // Arrows grayed out if already pressed, red if this arrow was failed
        let arrow_color = (i < currentArrowIndex) ? "#888888" : "#ffffff";
        if (i === currentArrowIndex && failed) {
            arrow_color = "#ff0000";
        }
        ctx.fillStyle = arrow_color;
        ctx.fillText(arrowToSymbol(arrowSequence[i]), x, centerY);
    }
}

function drawSuccess(ctx) {
    // Upper text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `${RESULT_UPPER_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(RESULT_UPPER_TEXT, ctx.canvas.width / 2, ctx.canvas.height * RESULT_UPPER_Y);

    // Fish text
    ctx.font = `${RESULT_FISH_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(currentFish.name, ctx.canvas.width / 2, ctx.canvas.height * RESULT_FISH_Y);
}

// #endregion