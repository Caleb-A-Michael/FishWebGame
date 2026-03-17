let currentScene = null;

export function setScene(scene) {
    currentScene = scene;
}

export function update() {
    if (currentScene) currentScene.update();
}

export function draw(ctx) {
    if (currentScene) currentScene.draw(ctx);
}