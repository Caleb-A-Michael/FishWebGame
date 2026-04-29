import { mouseX, mouseY, mouseClicked, arrowPressed } from "../../core/input.js";
import { drawSprite, drawPixelLine, drawTintedSprite } from "../../utils/draw.js";
import { drawButton, isInButton } from "../../utils/UI.js";
import { initDensityMapCanvas, startCatch, updateCatch } from "./catchSystem.js";
import { addMoney, getMoney, initializeMoney, spendMoney } from "./shopSystem.js";
import { isInWater, getLurePlacement } from "./waterGeometry.js";

const POND = new Image();
POND.src = "../../assets/images/enviroment/pond.png";
const BOBBER_FLOATING = new Image();
BOBBER_FLOATING.src = "../../assets/images/enviroment/bobber-floating.png";
const BOBBER_SUNK = new Image();
BOBBER_SUNK.src = "../../assets/images/enviroment/bobber-sunk.png";

const CURSOR_VALID = new Image();
CURSOR_VALID.src = "../../assets/images/worldUI/cursor-valid.png";
const CURSOR_INVALID = new Image();
CURSOR_INVALID.src = "../../assets/images/worldUI/cursor-invalid.png";
const CATCH_ARROW_PROMPT = new Image();
CATCH_ARROW_PROMPT.src = "../../assets/images/worldUI/catch-arrow-prompt.png";

const SIDEBAR_BK = new Image();
SIDEBAR_BK.src = "../../assets/images/sidebar/sidebar-bk.png";
const MONEY_ICON = new Image();
MONEY_ICON.src = "../../assets/images/sidebar/money-icon.png";
const SHOP_BUTTON = new Image();
SHOP_BUTTON.src = "../../assets/images/sidebar/shop-button.png";

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

const ROD_SHOP = new Image();
ROD_SHOP.src = "../../assets/images/shopUI/rod-shop.png";
const UPGRADE_BUTTON = new Image();
UPGRADE_BUTTON.src = "../../assets/images/shopUI/upgrade-button.png";

let currentState = "placement";

export const fishingScene = {
    onEnter(ctx) {
        initDensityMapCanvas(ctx.canvas.width, ctx.canvas.height);
        initializeMoney();

        // load rodLvl
        rodLvl = localStorage.getItem('rod_level');
        if (rodLvl !== null) {
            rodLvl = parseInt(rodLvl, 10); 
        } else {
            rodLvl = 0;
        }
        cast_distance = CAST_DISTANCES[rodLvl];
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
            case "shop":
                updateShop(deltaTime);
                break;
            case "debug":
                updateDebug(deltaTime);
                break;
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
            case "shop":
                drawShop(ctx);
                break;
            case "debug":
                drawDebug(ctx);
                break;
        }
    }
};

// #region PLACEMENT STATE

let cast_distance = 0;

let lurePos = { x: 0, y: 0 };
let closestPointOnShore = null;
let isMouseInWater = false;

function startPlacement() {
    currentState = "placement";

    cast_distance = CAST_DISTANCES[rodLvl];
}

function updatePlacement(deltaTime) {
    if (isMouseInWater) {
        ({ lurePos, closestPointOnShore } = getLurePlacement(mouseX, mouseY, cast_distance));
        if (mouseClicked) startWaiting();
    } else if (mouseClicked) {
        const SIDEBAR_MIDDLE_X = POND.width + (SIDEBAR_BK.width / 2);
        const canvas = document.getElementById("gameCanvas");
        if (isInButton(mouseX, mouseY, SIDEBAR_MIDDLE_X, SHOP_BUTTON_Y * canvas.height, SHOP_BUTTON)) {
            startShop();
        }
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
let animationTimer = 0;

function startWaiting() {
    // Sets wait timer to an int between min and max
    startCatch(lurePos.x, lurePos.y);
    fishBiting = null;
    currentState = "waiting";
}

function updateWaiting(deltaTime) {
    animationTimer += deltaTime; 

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
        if (arrowPressed === "OtherKey") {
            return;
        }
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
    animationTimer += deltaTime; 

    if (mouseClicked) {
        if (resultType === "successful") {
            addMoney(fishBiting.worth);
        }
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

// #region SHOP STATE

const CAST_DISTANCES = [60, 100, 140, 180, 220, 260]
const UPGRADE_COSTS = [10, 15, 25, 50, 100, 200, 250];

// cords are in px!!
const UPGRADE_BUTTON_PX_X = 476;
const UPGRADE_BUTTON_PX_Y = 569;

const UPGRADE_COST_PX_X = 1020;
const UPGRADE_COST_PX_Y = 590;
const UPGRADE_COST_FONT_SIZE = 100;
const UPGRADE_COST_BORDER_SIZE = 6;

let rodLvl = 0;
let upgradeCost = 0;

function startShop() {
    currentState = "shop";
    console.log(rodLvl);
}

function updateShop(deltaTime) {
    upgradeCost = UPGRADE_COSTS[rodLvl];

    if (mouseClicked) {
        if (isInButton(mouseX, mouseY, UPGRADE_BUTTON_PX_X, UPGRADE_BUTTON_PX_Y, UPGRADE_BUTTON)) {
            if (spendMoney(upgradeCost)) {
                rodLvl++;
                localStorage.setItem('rod_level', rodLvl);
            }
        }

        const SIDEBAR_MIDDLE_X = POND.width + (SIDEBAR_BK.width / 2);
        const canvas = document.getElementById("gameCanvas");
        if (isInButton(mouseX, mouseY, SIDEBAR_MIDDLE_X, SHOP_BUTTON_Y * canvas.height, SHOP_BUTTON)) {
            startPlacement();
        }
    }
}

function drawShop(ctx) {
    drawRodShopBk(ctx);
    drawUpgradeButton(ctx);
    drawUpgradeCost(ctx);

    drawCursor(ctx);
}

function drawRodShopBk(ctx) {
    drawSprite(ctx, ROD_SHOP, POND.width / 2, ctx.canvas.height / 2);
}

function drawUpgradeButton(ctx) {
    drawButton(ctx, mouseX, mouseY, UPGRADE_BUTTON, UPGRADE_BUTTON_PX_X, UPGRADE_BUTTON_PX_Y);
}

function drawUpgradeCost(ctx) {
    // upper text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `800 ${UPGRADE_COST_FONT_SIZE}px 'Courier New'`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = UPGRADE_COST_BORDER_SIZE;

    ctx.fillText(`$${upgradeCost}`, UPGRADE_COST_PX_X, UPGRADE_COST_PX_Y);
    ctx.strokeText(`$${upgradeCost}`, UPGRADE_COST_PX_X, UPGRADE_COST_PX_Y);

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
        drawSprite(ctx, BOBBER_SUNK, lurePos.x, lurePos.y);
    } else {
        drawSprite(ctx, BOBBER_FLOATING, lurePos.x, lurePos.y);
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
    let yOffset = BITE_INDICATOR_OFFSET + Math.sin(animationTimer * BITE_INDICATOR_SPEED) * BITE_INDICATOR_AMPLITUDE;
    drawSprite(ctx, CATCH_ARROW_PROMPT, lurePos.x, Math.round(lurePos.y) - yOffset);
}

// #endregion

// #region DRAW SIDEBAR

const MONEY_ICON_Y = .1;
const MONEY_TEXT_Y = .12;
const MONEY_FONT_SIZE = 80;
const MONEY_BORDER_SIZE = 4;

const SHOP_BUTTON_Y = .25;

function drawSidebar(ctx) {
    ctx.drawImage(SIDEBAR_BK, POND.width, 0);

    drawSidebarMoney(ctx);
    drawSidebarShopButton(ctx);
}

function drawSidebarMoney(ctx) {
    const SIDEBAR_MIDDLE_X = POND.width + (SIDEBAR_BK.width / 2);

    drawSprite(ctx, MONEY_ICON, SIDEBAR_MIDDLE_X, ctx.canvas.height * MONEY_ICON_Y);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = `800 ${MONEY_FONT_SIZE}px 'Courier New'`;

    ctx.strokeStyle = "black";
    ctx.lineWidth = MONEY_BORDER_SIZE;

    const money = getMoney();
    ctx.fillText(`${money}`, SIDEBAR_MIDDLE_X, ctx.canvas.height * MONEY_TEXT_Y);
    ctx.strokeText(`${money}`, SIDEBAR_MIDDLE_X, ctx.canvas.height * MONEY_TEXT_Y);
}

function drawSidebarShopButton(ctx) {
    const SIDEBAR_MIDDLE_X = POND.width + (SIDEBAR_BK.width / 2);
    if (currentState === "placement" || currentState === "shop") {
        drawButton(ctx, mouseX, mouseY, SHOP_BUTTON, SIDEBAR_MIDDLE_X, SHOP_BUTTON_Y * ctx.canvas.height);
    } else {
        drawSprite(ctx, SHOP_BUTTON, SIDEBAR_MIDDLE_X, SHOP_BUTTON_Y * ctx.canvas.height);
    }
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
const RESULT_UPPER_Y = 0.25;

const RESULT_FISH_FONT_SIZE = 160;
const RESULT_FISH_BORDER_SIZE = 8;
const RESULT_FISH_Y = 0.53;
const RESULT_FISH_SPEED = -2;
const RESULT_FISH_AMPLITUDE = 5;

const RESULT_MONEY_FONT_SIZE = 160;
const RESULT_MONEY_BORDER_SIZE = 4;
const RESULT_MONEY_Y = 0.75;
const RESULT_MONEY_COLOR = "#ffea00";
const RESULT_MONEY_SPEED = 2;
const RESULT_MONEY_AMPLITUDE = 7.5;

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
    let y = (RESULT_FISH_Y * ctx.canvas.height) + Math.sin(animationTimer * RESULT_FISH_SPEED) * RESULT_FISH_AMPLITUDE;

    ctx.lineWidth = RESULT_FISH_BORDER_SIZE;

    ctx.fillStyle = fishBiting.mainColor;
    ctx.strokeStyle = fishBiting.secondaryColor;
    ctx.font = `800 ${RESULT_FISH_FONT_SIZE}px 'Courier New'`;
    ctx.fillText(fishBiting.name, ctx.canvas.width / 2, y);
    ctx.strokeText(fishBiting.name, ctx.canvas.width / 2, y);

    // money text
    let pulse = RESULT_MONEY_FONT_SIZE + Math.sin(animationTimer * RESULT_MONEY_SPEED) * RESULT_MONEY_AMPLITUDE;

    ctx.fillStyle = RESULT_MONEY_COLOR;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = RESULT_FISH_BORDER_SIZE;

    ctx.font = `bold ${pulse}px 'Courier New'`;
    ctx.fillText(`+$${fishBiting.worth}`, ctx.canvas.width / 2, RESULT_MONEY_Y * ctx.canvas.height);
    ctx.strokeText(`+$${fishBiting.worth}`, ctx.canvas.width / 2, RESULT_MONEY_Y * ctx.canvas.height);

}

// #endregion