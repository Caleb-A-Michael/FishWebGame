let currentScene = null;

export function setScene(scene, ctx) {
    currentScene = scene;
    if (currentScene) currentScene.onEnter(ctx);
}

export function update(deltaTime) {
    if (currentScene) currentScene.update(deltaTime);
}

export function draw(ctx) {
    if (currentScene) currentScene.draw(ctx);
}