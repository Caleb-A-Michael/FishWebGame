import { drawTintedSprite } from "./draw.js";

const GRAYOUT_COLOR = "#0000007a";

export function isInButton(x, y, buttonX, buttonY, buttonSprite) {
    const lowerX = buttonX - (buttonSprite.width / 2);
    const upperX = buttonX + (buttonSprite.width / 2);
    const lowerY = buttonY - (buttonSprite.height / 2);
    const upperY = buttonY + (buttonSprite.height / 2);

    return (x >= lowerX && x <= upperX && y >= lowerY && y <= upperY);
}

export function drawButton(ctx, mouseX, mouseY, buttonSprite, buttonX, buttonY) {
    const color = (isInButton(mouseX, mouseY, buttonX, buttonY, buttonSprite)) ? GRAYOUT_COLOR : "#ffffff00";

    drawTintedSprite(ctx, buttonSprite, buttonX, buttonY, color);
}