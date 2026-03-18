export let mouseX = 0;
export let mouseY = 0;
export let mouseClicked = false;

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

export function resetInput() {
    mouseClicked = false;
}