export let mouseX = 0;
export let mouseY = 0;
export let mouseClicked = false;

export let arrowPressed = null;

const canvas = document.getElementById("gameCanvas");

canvas.addEventListener("mousemove", (event) => {
    // Correct for CSS scaling difference between display size and internal resolution
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    mouseX = event.offsetX * scaleX;
    mouseY = event.offsetY * scaleY;
});

canvas.addEventListener("click", () => {
    mouseClicked = true;
});

window.addEventListener("keydown", (event) => {
    switch(event.key) {
        case "ArrowUp":
        case "w":
            arrowPressed = "ArrowUp";
            break;
        case "ArrowDown":
        case "s":
            arrowPressed = "ArrowDown";
            break;
        case "ArrowLeft":
        case "a":
            arrowPressed = "ArrowLeft";
            break;
        case "ArrowRight":
        case "d":
            arrowPressed = "ArrowRight";
            break;
        default:
            arrowPressed = "OtherKey";
    }
});

export function resetInput() {
    mouseClicked = false;
    arrowPressed = null;
}