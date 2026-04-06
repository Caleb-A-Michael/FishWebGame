import { mouseX, mouseY, mouseClicked, keyPressed } from "../../core/input.js";
import { drawSprite, drawPixelLine } from "../../utils/draw.js";
import { startCatch, updateCatch } from "./catchSystem.js";
import { loadWaterBoundary, isInWater, getLurePlacement } from "./waterGeometry.js";

const pondImage = new Image();
pondImage.src = "../../assets/images/placeholderPond.png";
const cursorImage = new Image();
cursorImage.src = "../../assets/images/cursor.png";
const anchorImage = new Image();
anchorImage.src = "../../assets/images/fishingLineAnchor.png";
const lureRingImage = new Image();
lureRingImage.src = "../../assets/images/lureRing.png";
const bobberFloating = new Image();
bobberFloating.src = "../../assets/images/bobberFloating.png";
const bobberSank = new Image();
bobberSank.src = "../../assets/images/bobberSank.png";
const bitingIndicator = new Image();
bitingIndicator.src = "../../assets/images/bitingIndicator.png";


// Water boundaries (pixel cords)
const WATER_BOUNDARY = [
    { x: 60, y: 16 }, { x: 68, y: 16 }, { x: 69, y: 17 }, { x: 72, y: 17 }, { x: 73, y: 18 },
  { x: 74, y: 18 }, { x: 76, y: 20 }, { x: 77, y: 20 }, { x: 80, y: 23 }, { x: 83, y: 23 },
  { x: 84, y: 22 }, { x: 87, y: 22 }, { x: 88, y: 23 }, { x: 89, y: 23 }, { x: 93, y: 19 },
  { x: 94, y: 19 }, { x: 95, y: 18 }, { x: 107, y: 18 }, { x: 108, y: 19 }, { x: 112, y: 19 },
  { x: 113, y: 20 }, { x: 115, y: 20 }, { x: 116, y: 21 }, { x: 117, y: 21 }, { x: 118, y: 22 },
  { x: 120, y: 22 }, { x: 121, y: 23 }, { x: 122, y: 23 }, { x: 125, y: 26 }, { x: 126, y: 26 },
  { x: 129, y: 29 }, { x: 129, y: 30 }, { x: 130, y: 31 }, { x: 130, y: 33 }, { x: 134, y: 37 },
  { x: 134, y: 38 }, { x: 136, y: 40 }, { x: 136, y: 42 }, { x: 138, y: 44 }, { x: 138, y: 45 },
  { x: 139, y: 46 }, { x: 139, y: 47 }, { x: 140, y: 48 }, { x: 140, y: 55 }, { x: 139, y: 56 },
  { x: 139, y: 57 }, { x: 138, y: 58 }, { x: 138, y: 60 }, { x: 137, y: 61 }, { x: 137, y: 62 },
  { x: 136, y: 63 }, { x: 135, y: 63 }, { x: 134, y: 64 }, { x: 133, y: 64 }, { x: 131, y: 66 },
  { x: 129, y: 66 }, { x: 128, y: 67 }, { x: 127, y: 67 }, { x: 125, y: 65 }, { x: 123, y: 65 },
  { x: 117, y: 71 }, { x: 117, y: 72 }, { x: 116, y: 72 }, { x: 115, y: 73 }, { x: 113, y: 73 },
  { x: 112, y: 74 }, { x: 111, y: 74 }, { x: 110, y: 75 }, { x: 98, y: 75 }, { x: 97, y: 74 },
  { x: 96, y: 74 }, { x: 95, y: 73 }, { x: 80, y: 73 }, { x: 79, y: 74 }, { x: 78, y: 74 },
  { x: 76, y: 72 }, { x: 74, y: 72 }, { x: 70, y: 76 }, { x: 69, y: 76 }, { x: 68, y: 77 },
  { x: 57, y: 77 }, { x: 56, y: 76 }, { x: 54, y: 76 }, { x: 53, y: 75 }, { x: 46, y: 75 },
  { x: 45, y: 74 }, { x: 44, y: 74 }, { x: 43, y: 73 }, { x: 39, y: 73 }, { x: 38, y: 72 },
  { x: 36, y: 72 }, { x: 35, y: 71 }, { x: 31, y: 71 }, { x: 26, y: 66 }, { x: 26, y: 65 },
  { x: 24, y: 63 }, { x: 24, y: 62 }, { x: 23, y: 61 }, { x: 23, y: 60 }, { x: 22, y: 59 },
  { x: 22, y: 57 }, { x: 21, y: 56 }, { x: 21, y: 50 }, { x: 22, y: 49 }, { x: 22, y: 48 },
  { x: 20, y: 46 }, { x: 20, y: 44 }, { x: 22, y: 42 }, { x: 21, y: 41 }, { x: 21, y: 40 },
  { x: 20, y: 39 }, { x: 20, y: 37 }, { x: 22, y: 35 }, { x: 22, y: 34 }, { x: 23, y: 33 },
  { x: 23, y: 32 }, { x: 25, y: 30 }, { x: 25, y: 29 }, { x: 26, y: 29 }, { x: 27, y: 28 },
  { x: 31, y: 28 }, { x: 32, y: 29 }, { x: 33, y: 29 }, { x: 36, y: 26 }, { x: 37, y: 27 },
  { x: 38, y: 27 }, { x: 43, y: 22 }, { x: 44, y: 22 }, { x: 46, y: 20 }, { x: 49, y: 20 },
  { x: 50, y: 19 }, { x: 56, y: 19 }, { x: 57, y: 18 }, { x: 58, y: 18 }, { x: 59, y: 17 }
];

let currentState = "placement";

export const fishingScene = {
    onEnter() {
        loadWaterBoundary({ boundaryPoints: WATER_BOUNDARY });
    },

    update(deltaTime) {
        isMouseInWater = isInWater(mouseX, mouseY);

        switch (currentState) {
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

        switch (currentState) {
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

const MAX_CAST_DISTANCE = 12;

let lurePos = { x: 0, y: 0 };
let closestPointOnShore = null;
let isMouseInWater = false;

function startPlacement() {
    currentState = "placement";
}

function updatePlacement(deltaTime) {
    if (isMouseInWater) {
        ({ lurePos, closestPointOnShore } = getLurePlacement(mouseX, mouseY, MAX_CAST_DISTANCE));
        if (mouseClicked) startWaiting();
    }
}

function drawPlacement(ctx) {
    if (isMouseInWater) drawLureCircle(ctx);
    drawCursor(ctx);
    if (isMouseInWater) {
        drawBobber(ctx);
        drawFishingLine(ctx);
        drawAnchor(ctx);
    }
}

// #endregion

// #region WAITING STATE

const BITING_RESPONSE_TIME = 15;

let bitingTimer = 0;
let fishBiting = null;
let indictorBobTimer = 0;

function startWaiting() {
    // Sets wait timer to an int between min and max
    startCatch(lurePos.x, lurePos.y);
    fishBiting = null;
    currentState = "waiting";
}

function updateWaiting(deltaTime) {
    indictorBobTimer += deltaTime; 

    if (fishBiting === null) {
        fishBiting = updateCatch(deltaTime);
        if (fishBiting !== null) {
            bitingTimer = BITING_RESPONSE_TIME;
        }
    } else {
        bitingTimer -= deltaTime;
        if (bitingTimer <= 0) {
            fishBiting = null;
            startPlacement();
        }
        if (keyPressed === "ArrowUp") startMinigame();
    }

    if (mouseClicked) startPlacement();
}

function drawWaiting(ctx) {
    drawBobber(ctx);
    if (fishBiting !== null) {
        drawBiting(ctx);
    }
}

// #endregion

// #region MINIGAME STATE

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

    currentState = "minigame";
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
            default:
                throw new Error(`Invalid sequence character: ${char}`);
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

function startResult(type) {
    resultType = type;

    currentState = "result";
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

const LURE_RING_RADIUS = 4.1; 

const BITE_INDICATOR_OFFSET = 12;
const BITE_INDICATOR_SPEED = 3;
const BITE_INDICATOR_AMPLITUDE = 1;

function drawEnvironment(ctx) {
    ctx.drawImage(pondImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawCursor(ctx) {
    drawSprite(ctx, cursorImage, mouseX, mouseY);
}

function drawFishingLine(ctx) {
    if (!closestPointOnShore) throw new Error(`closestPointOnShore not defined`); 

    const angle = Math.atan2(closestPointOnShore.y - lurePos.y, closestPointOnShore.x - lurePos.x);
    const lineStartX = lurePos.x + Math.cos(angle) * LURE_RING_RADIUS;
    const lineStartY = lurePos.y + Math.sin(angle) * LURE_RING_RADIUS;
    
    ctx.fillStyle = "#000000";
    drawPixelLine(ctx, lineStartX, lineStartY, closestPointOnShore.x, closestPointOnShore.y);
}

function drawLureCircle(ctx) {
    drawSprite(ctx, lureRingImage, lurePos.x, lurePos.y);
}

function drawBobber(ctx) {
    if (fishBiting) {
        drawSprite(ctx, bobberSank, lurePos.x, lurePos.y);
    } else {
        drawSprite(ctx, bobberFloating, lurePos.x, lurePos.y);
    }
}

function drawAnchor(ctx) {
    drawSprite(ctx, anchorImage, closestPointOnShore.x, closestPointOnShore.y);
}

function drawBiting(ctx) {
    let yOffset = BITE_INDICATOR_OFFSET + Math.sin(indictorBobTimer * BITE_INDICATOR_SPEED) * BITE_INDICATOR_AMPLITUDE;
    drawSprite(ctx, bitingIndicator, lurePos.x, Math.round(lurePos.y) - yOffset);
}

// #endregion

// #region DRAW MINIGAME

// Y values proportional to canvas height
const OVERLAY_OPACITY = 0.5;
const ARROW_SPACING = 40;
const ARROW_Y = 0.5;
const ARROW_FONT_SIZE = 20;
const TIMER_Y = 0.2;
const TIMER_FONT_SIZE = 20;

// On Successful catch
const RESULT_UPPER_TEXT = "Congrats, you caught a"
const RESULT_UPPER_FONT_SIZE = 10;
const RESULT_UPPER_Y = 0.2;
const RESULT_FISH_FONT_SIZE = 20;
const RESULT_FISH_Y = 0.5;

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
        default:
            throw new Error(`Invalid sequence input: ${char}`); 
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