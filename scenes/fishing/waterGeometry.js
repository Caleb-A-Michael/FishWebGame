let boundaryPoints = [];

export function loadWaterBoundary(config) {
    boundaryPoints = config.boundaryPoints;
}

export function isInWater(x, y) {
    let inside = false;
    for (let i = 0, j = boundaryPoints.length - 1; i < boundaryPoints.length; i++) {
        const xi = boundaryPoints[i].x;
        const yi = boundaryPoints[i].y;
        const xj = boundaryPoints[j].x;
        const yj = boundaryPoints[j].y;

        const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersects) inside = !inside;

        j = i;
    }
    return inside;
}

export function getNearestShorePoint(x, y) {
    let nearestPoint = null;
    let nearestDist = Infinity;

    for (let i = 0, j = boundaryPoints.length - 1; i < boundaryPoints.length; i++) {
        const xi = boundaryPoints[i].x;
        const yi = boundaryPoints[i].y;
        const xj = boundaryPoints[j].x;
        const yj = boundaryPoints[j].y;

        const dx = xi - xj;
        const dy = yi - yj;
        const edgeLengthSq = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((x - xj) * dx + (y - yj) * dy) / edgeLengthSq));

        const closestX = xj + t * dx;
        const closestY = yj + t * dy;
        const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearestPoint = { x: closestX, y: closestY};
        }

        j = i;
    }

    return nearestPoint;
}

export function getLurePlacement(mouseX, mouseY, maxCastDistance) {
    const closestPointOnShore = getNearestShorePoint(mouseX, mouseY);
    const dist = Math.sqrt((mouseX - closestPointOnShore.x) ** 2 + (mouseY - closestPointOnShore.y) ** 2);

    let lurePos;
    if (dist > maxCastDistance) {
        const dx = mouseX - closestPointOnShore.x;
        const dy = mouseY - closestPointOnShore.y;
        lurePos = {
            x: closestPointOnShore.x + (dx / dist) * maxCastDistance,
            y: closestPointOnShore.y + (dy / dist) * maxCastDistance
        };
    } else {
        lurePos = { x: mouseX, y: mouseY };
    }

    return { lurePos, closestPointOnShore };
}