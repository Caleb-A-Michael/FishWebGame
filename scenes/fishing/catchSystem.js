const PLACEHOLDER_FISH = {
    sequence: "aaaaaa",
    baseTime: 3,
    name: "Redgill",
};

const RESAMPLE_INTERVAL = 8;
const MIN_BITE_TIME = 2;

let timer = 0;
let pendingFish = null;
let x = 0, y = 0;

export function startCatch(xLurePos, yLurePos) {
    x = xLurePos;
    y = yLurePos;
    if (Math.random() >= 0.5) {
        pendingFish = PLACEHOLDER_FISH;
        timer = Math.random() * (RESAMPLE_INTERVAL - MIN_BITE_TIME) + MIN_BITE_TIME;
    } else {
        timer = RESAMPLE_INTERVAL;
        pendingFish = null;
    }
}

export function updateCatch(deltaTime) {
    timer -= deltaTime;

    if (timer <= 0) {
        if (pendingFish !== null) {
            return pendingFish;
        } else {
            startCatch(x, y);
        }
    }

    return null;
}