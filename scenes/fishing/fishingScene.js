import { mouseX, mouseY, mouseClicked, keyPressed } from "../../core/input.js";
import { drawSprite, drawPixelLine, drawTintedSprite } from "../../utils/draw.js";
import { initDensityMapCanvas, startCatch, updateCatch } from "./catchSystem.js";
import { loadWaterBoundary, isInWater, getLurePlacement } from "./waterGeometry.js";

const CURSOR_VALID = new Image();
CURSOR_VALID.src = "../../assets/images/World UI/cursor-valid.png";
const CURSOR_INVALID = new Image();
CURSOR_INVALID.src = "../../assets/images/World UI/cursor-invalid.png";
const CATCH_ARROW_PROMPT = new Image();
CATCH_ARROW_PROMPT.src = "../../assets/images/World UI/catch-arrow-prompt.png";

const MINIGAME_BACKGROUND = new Image();
MINIGAME_BACKGROUND.src = "../../assets/images/MinigameUI/minigame-background.png"
const MINIGAME_ARROW_UP = new Image();
MINIGAME_ARROW_UP.src = "../../assets/images/MinigameUI/minigame-arrow-up.png";
const MINIGAME_ARROW_DOWN = new Image();
MINIGAME_ARROW_DOWN.src = "../../assets/images/MinigameUI/minigame-arrow-down.png";
const MINIGAME_ARROW_LEFT = new Image();
MINIGAME_ARROW_LEFT.src = "../../assets/images/MinigameUI/minigame-arrow-left.png";
const MINIGAME_ARROW_RIGHT = new Image();
MINIGAME_ARROW_RIGHT.src = "../../assets/images/MinigameUI/minigame-arrow-right.png";

const pondImage = new Image();
pondImage.src = "../../assets/images/placeholderPond.png";

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
  { x: 720, y: 192 }, { x: 816, y: 192 }, { x: 828, y: 204 }, { x: 864, y: 204 }, { x: 876, y: 216 },
  { x: 888, y: 216 }, { x: 912, y: 240 }, { x: 924, y: 240 }, { x: 960, y: 276 }, { x: 996, y: 276 },
  { x: 1008, y: 264 }, { x: 1044, y: 264 }, { x: 1056, y: 276 }, { x: 1068, y: 276 }, { x: 1116, y: 228 },
  { x: 1128, y: 228 }, { x: 1140, y: 216 }, { x: 1284, y: 216 }, { x: 1296, y: 228 }, { x: 1344, y: 228 },
  { x: 1356, y: 240 }, { x: 1380, y: 240 }, { x: 1392, y: 252 }, { x: 1404, y: 252 }, { x: 1416, y: 264 },
  { x: 1440, y: 264 }, { x: 1452, y: 276 }, { x: 1464, y: 276 }, { x: 1500, y: 312 }, { x: 1512, y: 312 },
  { x: 1548, y: 348 }, { x: 1548, y: 360 }, { x: 1560, y: 372 }, { x: 1560, y: 396 }, { x: 1608, y: 444 },
  { x: 1608, y: 456 }, { x: 1632, y: 480 }, { x: 1632, y: 504 }, { x: 1656, y: 528 }, { x: 1656, y: 540 },
  { x: 1668, y: 552 }, { x: 1668, y: 564 }, { x: 1680, y: 576 }, { x: 1680, y: 660 }, { x: 1668, y: 672 },
  { x: 1668, y: 684 }, { x: 1656, y: 696 }, { x: 1656, y: 720 }, { x: 1644, y: 732 }, { x: 1644, y: 744 },
  { x: 1632, y: 756 }, { x: 1620, y: 756 }, { x: 1608, y: 768 }, { x: 1596, y: 768 }, { x: 1572, y: 792 },
  { x: 1548, y: 792 }, { x: 1536, y: 804 }, { x: 1524, y: 804 }, { x: 1500, y: 780 }, { x: 1476, y: 780 },
  { x: 1404, y: 852 }, { x: 1404, y: 864 }, { x: 1392, y: 864 }, { x: 1380, y: 876 }, { x: 1356, y: 876 },
  { x: 1344, y: 888 }, { x: 1332, y: 888 }, { x: 1320, y: 900 }, { x: 1248, y: 900 }, { x: 1236, y: 888 },
  { x: 1224, y: 888 }, { x: 1212, y: 876 }, { x: 960, y: 876 }, { x: 948, y: 888 }, { x: 936, y: 888 },
  { x: 912, y: 864 }, { x: 888, y: 864 }, { x: 840, y: 912 }, { x: 828, y: 912 }, { x: 816, y: 924 },
  { x: 684, y: 924 }, { x: 672, y: 912 }, { x: 648, y: 912 }, { x: 636, y: 900 }, { x: 552, y: 900 },
  { x: 540, y: 888 }, { x: 528, y: 888 }, { x: 516, y: 876 }, { x: 468, y: 876 }, { x: 456, y: 864 },
  { x: 432, y: 864 }, { x: 420, y: 852 }, { x: 372, y: 852 }, { x: 312, y: 792 }, { x: 312, y: 780 },
  { x: 288, y: 756 }, { x: 288, y: 744 }, { x: 276, y: 732 }, { x: 276, y: 720 }, { x: 264, y: 708 },
  { x: 264, y: 684 }, { x: 252, y: 672 }, { x: 252, y: 600 }, { x: 264, y: 588 }, { x: 264, y: 576 },
  { x: 240, y: 552 }, { x: 240, y: 528 }, { x: 264, y: 504 }, { x: 252, y: 492 }, { x: 252, y: 480 },
  { x: 240, y: 468 }, { x: 240, y: 432 }, { x: 264, y: 420 }, { x: 264, y: 408 }, { x: 276, y: 396 },
  { x: 276, y: 384 }, { x: 300, y: 360 }, { x: 300, y: 348 }, { x: 312, y: 348 }, { x: 324, y: 336 },
  { x: 372, y: 336 }, { x: 384, y: 348 }, { x: 396, y: 348 }, { x: 432, y: 336 }, { x: 444, y: 324 },
  { x: 456, y: 324 }, { x: 516, y: 264 }, { x: 528, y: 264 }, { x: 552, y: 240 }, { x: 588, y: 240 },
  { x: 600, y: 228 }, { x: 672, y: 228 }, { x: 684, y: 216 }, { x: 696, y: 216 }, { x: 708, y: 204 }
];

let currentState = "placement";

export const fishingScene = {
    onEnter(ctx) {
        loadWaterBoundary({ boundaryPoints: WATER_BOUNDARY });
        initDensityMapCanvas(ctx.canvas.width, ctx.canvas.height);
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

const MAX_CAST_DISTANCE = 100;

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
    if (isMouseInWater) {
        drawLureCircle(ctx)
        drawFishingLine(ctx);
        drawAnchor(ctx);
        drawCursor(ctx);
    } else {
        drawInvalidCursor(ctx);
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
    drawCursor(ctx);
}

// #endregion

// #region MINIGAME STATE

let arrowSequence = [];
let currentArrowIndex = 0;
let minigameTimer = 0;
let resultType = null; // Either timeout, wrongInput, or successful

function startMinigame() {
    arrowSequence = resolveArrowSequence(fishBiting.catchSequence);
    currentArrowIndex = 0;

    minigameTimer = fishBiting.catchTime;

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
    drawBobber(ctx);

    drawMinigameBackground(ctx);
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
    if (mouseClicked) {
        fishBiting = null;
        startPlacement();
    }
}

function drawResult(ctx) {
    drawBobber(ctx);

    if (resultType === "successful") {
        drawSuccessBackground(ctx);
        drawSuccess(ctx);
        return;
    }

    // Failure
    drawMinigameBackground(ctx);
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

// enviroment

const GRASS_COLOR = "#468255"
const WATER_COLOR = "#4679df"
const WATER_OUTLINE = 8;

// catching

const CURSOR_RADIUS = 14;
const CURSOR_OUTLINE = 6;

const ANCHOR_RADIUS = 12;
const ANCHOR_OUTLINE = 6;

const LINE_WIDTH = 6;

const LURE_RING_RADIUS = 36; 
const LURE_RING_OUTLINE = 8;

const BITE_INDICATOR_OFFSET = 100;
const BITE_INDICATOR_SPEED = 2;
const BITE_INDICATOR_AMPLITUDE = 10;

function drawEnvironment(ctx) {
    ctx.drawImage(pondImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawCursor(ctx) {
    drawSprite(ctx, CURSOR_VALID, mouseX, mouseY);
    return;

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, CURSOR_RADIUS, 0, Math.PI * 2);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = CURSOR_OUTLINE;

    ctx.fill();
    ctx.stroke();
}

function drawInvalidCursor(ctx) {
    drawSprite(ctx, CURSOR_INVALID, mouseX, mouseY);
}

function drawFishingLine(ctx) {
    if (!closestPointOnShore) throw new Error(`closestPointOnShore not defined`); 

    const angle = Math.atan2(closestPointOnShore.y - lurePos.y, closestPointOnShore.x - lurePos.x);
    const lineStartX = lurePos.x + Math.cos(angle) * LURE_RING_RADIUS;
    const lineStartY = lurePos.y + Math.sin(angle) * LURE_RING_RADIUS;
    
    ctx.beginPath();
    ctx.moveTo(lineStartX, lineStartY);
    ctx.lineTo(closestPointOnShore.x, closestPointOnShore.y);

    ctx.strokeStyle = "black";
    ctx.lineWidth = LINE_WIDTH;

    ctx.stroke();
}

function drawLureCircle(ctx) {
    ctx.beginPath();
    ctx.arc(lurePos.x, lurePos.y, LURE_RING_RADIUS, 0, Math.PI * 2);

    ctx.strokeStyle = "black";
    ctx.lineWidth = LURE_RING_OUTLINE;

    ctx.stroke();
}

function drawBobber(ctx) {
    if (fishBiting) {
        drawSprite(ctx, bobberSank, lurePos.x, lurePos.y);
    } else {
        drawSprite(ctx, bobberFloating, lurePos.x, lurePos.y);
    }
}

function drawAnchor(ctx) {
    ctx.beginPath();
    ctx.arc(closestPointOnShore.x, closestPointOnShore.y, ANCHOR_RADIUS, 0, Math.PI * 2);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = ANCHOR_OUTLINE;

    ctx.fill();
    ctx.stroke();
}

function drawBiting(ctx) {
    let yOffset = BITE_INDICATOR_OFFSET + Math.sin(indictorBobTimer * BITE_INDICATOR_SPEED) * BITE_INDICATOR_AMPLITUDE;
    drawSprite(ctx, CATCH_ARROW_PROMPT, lurePos.x, Math.round(lurePos.y) - yOffset);
}

// #endregion

// #region DRAW MINIGAME

// Y values proportional to canvas height
const OVERLAY_COLOR = "#140c2aa1";

const ARROW_SPACING = 400;
const ARROW_Y = 0.65;
const ARROW_TINT_PRESSED = "#03031dbb";
const ARROW_TINT_FAILED = "#ff0000a9";


const TIMER_Y = 0.35;
const TIMER_FONT_SIZE = 250;
const TIMER_BORDER_SIZE = 8;

// On Successful catch
const RESULT_UPPER_TEXT = "Congrats, you caught a"

const RESULT_UPPER_FONT_SIZE = 120;
const RESULT_UPPER_BORDER_SIZE = 4;
const RESULT_UPPER_Y = 0.2;

const RESULT_FISH_FONT_SIZE = 160;
const RESULT_FISH_BORDER_SIZE = 6;
const RESULT_FISH_Y = 0.53;

function drawMinigameBackground(ctx) {
    ctx.drawImage(MINIGAME_BACKGROUND, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawSuccessBackground(ctx) {
    ctx.save();

    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(MINIGAME_BACKGROUND, -ctx.canvas.height / 2, -ctx.canvas.width / 2, ctx.canvas.height, ctx.canvas.width);

    ctx.restore();
}

function drawTimer(ctx, failed) {
    ctx.fillStyle = (failed) ? "#ff0000" : "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `bold ${TIMER_FONT_SIZE}px 'Courier New`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = TIMER_BORDER_SIZE;

    const num = Math.max(0, minigameTimer).toFixed(1);
    ctx.fillText(num, ctx.canvas.width / 2, ctx.canvas.height * TIMER_Y);
    ctx.strokeText(num, ctx.canvas.width / 2, ctx.canvas.height * TIMER_Y);
}

function drawArrows(ctx, failed) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height * ARROW_Y;

    for (let i = 0; i < arrowSequence.length; i++) {
        const offset = (i - currentArrowIndex) * ARROW_SPACING;
        const x = centerX + offset;

        let arrow_image = null;
        switch (arrowSequence[i]) {
            case "ArrowUp": 
                arrow_image = MINIGAME_ARROW_UP;
                break;
            case "ArrowDown":
                arrow_image = MINIGAME_ARROW_DOWN;
                break;
            case "ArrowLeft":
                arrow_image = MINIGAME_ARROW_LEFT;
                break;
            case "ArrowRight":
                arrow_image = MINIGAME_ARROW_RIGHT;
                break;
            default:
            throw new Error(`Invalid sequence input`); 
        }

        // Arrows grayed out if already pressed, red if this arrow was failed
        let arrow_color = (i < currentArrowIndex) ? ARROW_TINT_PRESSED : "#00000000";
        if (i === currentArrowIndex && failed) {
            arrow_color = ARROW_TINT_FAILED;
        }

        drawTintedSprite(ctx, arrow_image, x, centerY, arrow_color);
    }
}

function drawSuccess(ctx) {
    // Upper text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `bold ${RESULT_UPPER_FONT_SIZE}px 'Courier New'`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = RESULT_UPPER_BORDER_SIZE;

    ctx.fillText(RESULT_UPPER_TEXT, ctx.canvas.width / 2, ctx.canvas.height * RESULT_UPPER_Y);
    ctx.strokeText(RESULT_UPPER_TEXT, ctx.canvas.width / 2, ctx.canvas.height * RESULT_UPPER_Y);

    // Fish text
    ctx.lineWidth = RESULT_FISH_BORDER_SIZE;

    ctx.font = `800 ${RESULT_FISH_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(fishBiting.name, ctx.canvas.width / 2, ctx.canvas.height * RESULT_FISH_Y);
    ctx.strokeText(fishBiting.name, ctx.canvas.width / 2, ctx.canvas.height * RESULT_FISH_Y);
}

// #endregion