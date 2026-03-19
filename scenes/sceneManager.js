let currentScene = null;

export function setScene(scene) {
    currentScene = scene;
}

export function update(deltaTime) {
    if (currentScene) currentScene.update(deltaTime);
}

export function draw(ctx) {
    if (currentScene) currentScene.draw(ctx);
}