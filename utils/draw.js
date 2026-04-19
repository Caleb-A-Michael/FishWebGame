export function drawSprite(ctx, image, x, y) {
    ctx.drawImage(image, Math.round(x - image.width / 2), Math.round(y - image.height / 2));
}

export function drawOpacitySprite(ctx, image, x, y, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(image, Math.round(x - image.width / 2), Math.round(y - image.height / 2));
    ctx.restore();
}

export function drawTintedSprite(ctx, image, x, y, tintColor) {
    const offscreen = document.createElement('canvas');
    offscreen.width = image.width;
    offscreen.height = image.height;

    const offCtx = offscreen.getContext('2d');

    offCtx.drawImage(image, 0, 0);

    offCtx.globalCompositeOperation = 'source-atop';
    offCtx.fillStyle = tintColor;
    offCtx.fillRect(0, 0, image.width, image.height);

    ctx.drawImage(offscreen, Math.round(x - image.width / 2), Math.round(y - image.height / 2));
}

// Bresenham's line algorithm 
export function drawPixelLine(ctx, x0, y0, x1, y1) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        ctx.fillRect(x0, y0, 1, 1);

        if (x0 === x1 && y0 === y1) break;

        const err2 = err * 2;

        if (err2 > -dy) {
            err -= dy;
            x0 += sx;
        }

        if (err2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}