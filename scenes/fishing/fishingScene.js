import { mouseX, mouseY, mouseClicked, arrowPressed } from "../../core/input.js";
import { drawSprite, drawPixelLine, drawTintedSprite } from "../../utils/draw.js";
import { initDensityMapCanvas, startCatch, updateCatch } from "./catchSystem.js";
import { money, addMoney } from "./shopSystem.js";
import { loadWaterBoundary, isInWater, getLurePlacement } from "./waterGeometry.js";

const POND = new Image();
POND.src = "../../assets/images/enviroment/pond.png";

const CURSOR_VALID = new Image();
CURSOR_VALID.src = "../../assets/images/worldUI/cursor-valid.png";
const CURSOR_INVALID = new Image();
CURSOR_INVALID.src = "../../assets/images/worldUI/cursor-invalid.png";
const CATCH_ARROW_PROMPT = new Image();
CATCH_ARROW_PROMPT.src = "../../assets/images/worldUI/catch-arrow-prompt.png";

const SIDEBAR_BK = new Image();
SIDEBAR_BK.src = "../../assets/images/sidebar/sidebarBk.png"

const MINIGAME_BACKGROUND = new Image();
MINIGAME_BACKGROUND.src = "../../assets/images/minigameUI/minigame-background.png"
const MINIGAME_ARROW_UP = new Image();
MINIGAME_ARROW_UP.src = "../../assets/images/minigameUI/minigame-arrow-up.png";
const MINIGAME_ARROW_DOWN = new Image();
MINIGAME_ARROW_DOWN.src = "../../assets/images/minigameUI/minigame-arrow-down.png";
const MINIGAME_ARROW_LEFT = new Image();
MINIGAME_ARROW_LEFT.src = "../../assets/images/minigameUI/minigame-arrow-left.png";
const MINIGAME_ARROW_RIGHT = new Image();
MINIGAME_ARROW_RIGHT.src = "../../assets/images/minigameUI/minigame-arrow-right.png";

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
    {"x":370,"y":330},{"x":548,"y":330},{"x":649,"y":306},{"x":719,"y":335},
    {"x":761,"y":306},{"x":760,"y":274},{"x":779,"y":269},{"x":799,"y":289},
    {"x":827,"y":267},{"x":919,"y":267},{"x":994,"y":270},{"x":1068,"y":255},
    {"x":1147,"y":255},{"x":1203,"y":267},{"x":1224,"y":291},{"x":1268,"y":282},
    {"x":1328,"y":310},{"x":1324,"y":329},{"x":1338,"y":341},{"x":1371,"y":334},
    {"x":1455,"y":390},{"x":1484,"y":407},{"x":1545,"y":433},{"x":1598,"y":457},
    {"x":1636,"y":493},{"x":1653,"y":527},{"x":1653,"y":555},{"x":1646,"y":579},
    {"x":1643,"y":601},{"x":1638,"y":625},{"x":1621,"y":654},{"x":1597,"y":657},
    {"x":1590,"y":668},{"x":1590,"y":683},{"x":1559,"y":676},{"x":1550,"y":683},
    {"x":1550,"y":709},{"x":1453,"y":757},{"x":1434,"y":760},{"x":1427,"y":765},
    {"x":1391,"y":777},{"x":1273,"y":779},{"x":1230,"y":791},{"x":1201,"y":796},
    {"x":1165,"y":810},{"x":1133,"y":827},{"x":1123,"y":804},{"x":1073,"y":801},
    {"x":1059,"y":834},{"x":1049,"y":828},{"x":1018,"y":847},{"x":1001,"y":847},
    {"x":951,"y":857},{"x":931,"y":866},{"x":888,"y":871},{"x":868,"y":883},
    {"x":856,"y":895},{"x":833,"y":902},{"x":739,"y":902},{"x":597,"y":842},
    {"x":589,"y":842},{"x":551,"y":820},{"x":539,"y":832},{"x":527,"y":816},
    {"x":489,"y":823},{"x":484,"y":828},{"x":412,"y":772},{"x":347,"y":710},
    {"x":334,"y":707},{"x":323,"y":674},{"x":303,"y":671},{"x":306,"y":659},
    {"x":270,"y":630},{"x":240,"y":649},{"x":207,"y":597},{"x":187,"y":549},
    {"x":187,"y":515},{"x":199,"y":505},{"x":197,"y":500},{"x":181,"y":488},
    {"x":216,"y":469},{"x":217,"y":460},{"x":212,"y":457},{"x":250,"y":421},
    {"x":243,"y":402},{"x":276,"y":401},{"x":284,"y":389},{"x":272,"y":375},
    {"x":322,"y":351},{"x":334,"y":346}
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
            case "debug":
                updateDebug(deltaTime);
        }
    },

    draw(ctx) {
        drawEnvironment(ctx);
        drawSidebar(ctx);

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
            case "debug":
                drawDebug(ctx);
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
    }

    if (isMouseInWater || mouseX > POND.width) {
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
        if (arrowPressed === "ArrowUp") startMinigame();
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

    if (arrowPressed && arrowPressed !== null) {
        if (arrowPressed === arrowSequence[currentArrowIndex]) {
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
        addMoney(fishBiting.worth);
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

// #region DEBUG STATE

const DEBUG_CURSOR_RADIUS = 2;
const DEBUG_CURSOR_OUTLINE = 2;

let debug_point_list = [];

function updateDebug(deltaTime) {
    if (mouseClicked) {
        const mousePos = {x: Math.round(mouseX), y: Math.round(mouseY)};
        debug_point_list.push(mousePos);
    } else if (arrowPressed === "ArrowDown") {
        debug_point_list.pop();
    } else if (arrowPressed === "ArrowUp") {
        console.log(JSON.stringify(debug_point_list));
    }
}

function drawDebug(ctx) {
    drawEnvironment(ctx);
    drawDebugBorder(ctx);
    drawDebugCursor(ctx);
}

function drawDebugBorder(ctx) {
    if (debug_point_list.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(debug_point_list[0].x, debug_point_list[0].y);
    for (let i = 1; i < debug_point_list.length; i++) {
        ctx.lineTo(debug_point_list[i].x, debug_point_list[i].y);
    }

    ctx.strokeStyle = "red";
    ctx.stroke();
}

function drawDebugCursor(ctx) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, DEBUG_CURSOR_RADIUS, 0, Math.PI * 2);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = DEBUG_CURSOR_OUTLINE;

    ctx.fill();
    ctx.stroke();
}

// #endregion

// #region DRAW WORLD

// enviroment

const MONEY_Y = .1;
const MONEY_FONT_SIZE = 80;
const MONEY_BORDER_SIZE = 4;

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
    ctx.drawImage(POND, 0, 0);
}

function drawSidebar(ctx) {
    ctx.drawImage(SIDEBAR_BK, POND.width, 0);

    // money text

    const SIDEBAR_MIDDLE_X = POND.width + (SIDEBAR_BK.width / 2);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `bold ${MONEY_FONT_SIZE}px 'Courier New'`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = MONEY_BORDER_SIZE;

    ctx.fillText(`$${money}`, SIDEBAR_MIDDLE_X, ctx.canvas.height * MONEY_Y);
    ctx.strokeText(`$${money}`, SIDEBAR_MIDDLE_X, ctx.canvas.height * MONEY_Y);
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

const RESULT_MONEY_FONT_SIZE = 120;
const RESULT_MONEY_BORDER_SIZE = 4;
const RESULT_MONEY_Y = 0.7;

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
    // upper text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `bold ${RESULT_UPPER_FONT_SIZE}px 'Courier New'`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = RESULT_UPPER_BORDER_SIZE;

    ctx.fillText(RESULT_UPPER_TEXT, ctx.canvas.width / 2, ctx.canvas.height * RESULT_UPPER_Y);
    ctx.strokeText(RESULT_UPPER_TEXT, ctx.canvas.width / 2, ctx.canvas.height * RESULT_UPPER_Y);

    // fish text
    ctx.lineWidth = RESULT_FISH_BORDER_SIZE;

    ctx.font = `800 ${RESULT_FISH_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(fishBiting.name, ctx.canvas.width / 2, ctx.canvas.height * RESULT_FISH_Y);
    ctx.strokeText(fishBiting.name, ctx.canvas.width / 2, ctx.canvas.height * RESULT_FISH_Y);

    // money text
    ctx.lineWidth = RESULT_FISH_BORDER_SIZE;

    ctx.font = `bold ${RESULT_FISH_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(`+$${fishBiting.worth}`, ctx.canvas.width / 2, ctx.canvas.height * RESULT_MONEY_Y);
    ctx.strokeText(`+$${fishBiting.worth}`, ctx.canvas.width / 2, ctx.canvas.height * RESULT_MONEY_Y);

}

// #endregion