import { FISH } from "../../data/fish.js";

const RESAMPLE_INTERVAL = 8;
const MIN_BITE_TIME = 2;

const TEST_DENSITY_MAP = new Image();
TEST_DENSITY_MAP.src = '../../assets/images/densityMaps/TestDensity.png'

let densityMapCanvas = null;
let densityMapCtx = null;
let scaleX = 0;
let scaleY = 0;

export function initDensityMapCanvas(gameCanvasWidth, gameCanvasHeight) {
    densityMapCanvas = document.createElement('canvas');
    densityMapCtx = densityMapCanvas.getContext('2d', {willReadFrequently: true});
    densityMapCanvas.width = TEST_DENSITY_MAP.width;
    densityMapCanvas.height = TEST_DENSITY_MAP.height;

    scaleX = densityMapCanvas.width / gameCanvasWidth;
    scaleY = densityMapCanvas.height / gameCanvasHeight;
}

let timer = 0;
let pendingFish = null;
let x = 0, y = 0;

export function startCatch(xLurePos, yLurePos) {
    x = xLurePos;
    y = yLurePos;
    let chance = getDensityValue(x, y);
    console.log(chance);
    if (Math.random() >= chance) {
        pendingFish = FISH.testFish;
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

function getDensityValue(x, y) {
    densityMapCtx.drawImage(TEST_DENSITY_MAP, 0, 0);

    const scaledX = Math.floor(x * scaleX);
    const scaledY = Math.floor(y * scaleY);
    if (scaledX < 0 || scaledX >= densityMapCanvas.width || scaledY < 0 || scaledY >= densityMapCanvas.height) {
        return 0;
    }
    const pixel = densityMapCtx.getImageData(scaledX, scaledY, 1, 1).data;
    return pixel[0] / 255;
}