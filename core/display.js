export function initDisplay(canvas) {
    canvas.style.position = "absolute";
    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transform = "translate(-50%, -50%)";

    window.addEventListener("resize", () => resizeCanvas(canvas));
    resizeCanvas(canvas);
}

function resizeCanvas(canvas) {
    const windowAspect = window.innerWidth / window.innerHeight;
    const gameAspect = canvas.width / canvas.height;

    if (windowAspect > gameAspect) {
        canvas.style.height = "100vh";
        canvas.style.width = `${window.innerHeight * gameAspect}px`;
    } else {
        canvas.style.width = "100vw"
        canvas.style.height = `${window.innerWidth / gameAspect}px`;
    }
}

export function getScale(canvas) {
    return canvas.offsetWidth / canvas.width;
}