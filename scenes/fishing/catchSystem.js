import { FISH } from "../../data/fish.js";

const RESAMPLE_INTERVAL = 6;
const MIN_BITE_TIME = 2;

const NO_BITE_WEIGHT = 3;

const SHORE_DM = new Image();
SHORE_DM.src = '../../assets/images/densityMaps/testDensityShore.png';
const CENTER_DM = new Image();
CENTER_DM.src = '../../assets/images/densityMaps/testDensityCenter.png';
const RIGHT_DM = new Image();
RIGHT_DM.src = '../../assets/images/densityMaps/testDensityRight.png';
const CONSISTENT_DM = new Image();
CONSISTENT_DM.src = '../../assets/images/densityMaps/testDensityConsistent.png';

const DENSITY_MAPS = {
    shore: SHORE_DM,
    center: CENTER_DM,
    right: RIGHT_DM,
    consistent: CONSISTENT_DM
};

let densityMapCanvas = null;
let densityMapCtx = null;
let scaleX = 0;
let scaleY = 0;

export function initDensityMapCanvas(gameCanvasWidth, gameCanvasHeight) {
    densityMapCanvas = document.createElement('canvas');
    densityMapCtx = densityMapCanvas.getContext('2d', {willReadFrequently: true});
    densityMapCanvas.width = CONSISTENT_DM.width;
    densityMapCanvas.height = CONSISTENT_DM.height;

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

function getDensityValue(x, y, densityMap) {
    densityMapCtx.drawImage(densityMap, 0, 0);

    const scaledX = Math.floor(x * scaleX);
    const scaledY = Math.floor(y * scaleY);
    if (scaledX < 0 || scaledX >= densityMapCanvas.width || scaledY < 0 || scaledY >= densityMapCanvas.height) {
        return 0;
    }
    const pixel = densityMapCtx.getImageData(scaledX, scaledY, 1, 1).data;
    return 1 - (pixel[0] / 255); // invert (black is more weight)
}

function getFishWeight(fish) {
    return Math.max(0, fish.frequency * getDensityValue(x, y, DENSITY_MAPS[fish.densityMap]));
}

function rollFish() {
    let cumulative = 0;
    const entries = [];

    // builds cumulative weights
    for (const fish of Object.values(FISH)) {

        
        let weight = getFishWeight(fish);
        console.log("Adding to list: " + fish.name + " " + weight);
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