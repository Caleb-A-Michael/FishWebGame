export const fishingScene = {
    update() {

    },

    draw(ctx) {
        // Shore
        ctx.fillStyle = "#78ab46";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Water
        ctx.fillStyle = "#4a90d9";
        ctx.fillRect(ctx.canvas.width * 0.2, ctx.canvas.height * 0.2, ctx.canvas.width * 0.6, ctx.canvas.height * 0.6);
    }
};