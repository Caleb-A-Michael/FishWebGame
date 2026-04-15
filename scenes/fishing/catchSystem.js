import { FISH } from "../../data/fish.js";

const RESAMPLE_INTERVAL = 2;
const MIN_BITE_TIME = 2;

const NO_BITE_WEIGHT = 1;

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
    
    pendingFish = rollFish();
    if (pendingFish) console.log("fish rolled: " + pendingFish.name);
    else console.log("Fish rolled: null");
    if (pendingFish !== null) {
        timer = Math.random() * (RESAMPLE_INTERVAL - MIN_BITE_TIME) + MIN_BITE_TIME;
    } else {
        timer = RESAMPLE_INTERVAL;
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

function getFishWeight(fish) {
    return Math.max(0, fish.frequency);
}

function rollFish() {
    let cumulative = 0;
    const entries = [];

    // builds cumulative weights
    for (const fish of Object.values(FISH)) {

        console.log("adding " + fish.name + " to list");
        let weight = getFishWeight(fish);
        if (weight <= 0) continue;

        cumulative += weight;

        entries.push({
            fish,
            cumulative
        });
    }

    // add const chance of no fish
    cumulative += NO_BITE_WEIGHT;
    entries.push({
        fish: null,
        cumulative
    });

    if (cumulative === 0) return null;

    const r = Math.random() * cumulative;

    for (const entry of entries) {
        if (r < entry.cumulative) {
            return entry.fish;
        }
    }

    // fall back for floating point safety

    return null;
}