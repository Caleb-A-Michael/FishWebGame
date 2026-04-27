// Water boundaries (pixel cords)
const WATER_BOUNDARY = [
    {"x":370,"y":330},{"x":548,"y":330},{"x":649,"y":306},{"x":719,"y":335},
    {"x":761,"y":306},{"x":760,"y":274},{"x":779,"y":269},{"x":799,"y":289},
    {"x":827,"y":267},{"x":919,"y":267},{"x":994,"y":270},{"x":1068,"y":255},
    {"x":1147,"y":255},{"x":1203,"y":267},{"x":1224,"y":291},{"x":1268,"y":282},
    {"x":1328,"y":310},{"x":1324,"y":329},{"x":1338,"y":341},{"x":1371,"y":334},
    {"x":1455,"y":390},{"x":1484,"y":407},{"x":1545,"y":433},{"x":1598,"y":457},
    {"x":1636,"y":493},{"x":1653,"y":527},{"x":1653,"y":555},{"x":1646,"y":579},
    {"x":1643,"y":601},{"x":1638,"y":625},{"x":1621,"y":654},{"x":1597,"y":657},
    {"x":1590,"y":668},{"x":1590,"y":683},{"x":1559,"y":676},{"x":1550,"y":683},
    {"x":1550,"y":709},{"x":1453,"y":757},{"x":1434,"y":760},{"x":1427,"y":765},
    {"x":1391,"y":777},{"x":1273,"y":779},{"x":1230,"y":791},{"x":1201,"y":796},
    {"x":1165,"y":810},{"x":1133,"y":827},{"x":1123,"y":804},{"x":1073,"y":801},
    {"x":1059,"y":834},{"x":1049,"y":828},{"x":1018,"y":847},{"x":1001,"y":847},
    {"x":951,"y":857},{"x":931,"y":866},{"x":888,"y":871},{"x":868,"y":883},
    {"x":856,"y":895},{"x":833,"y":902},{"x":739,"y":902},{"x":597,"y":842},
    {"x":589,"y":842},{"x":551,"y":820},{"x":539,"y":832},{"x":527,"y":816},
    {"x":489,"y":823},{"x":484,"y":828},{"x":412,"y":772},{"x":347,"y":710},
    {"x":334,"y":707},{"x":323,"y":674},{"x":303,"y":671},{"x":306,"y":659},
    {"x":270,"y":630},{"x":240,"y":649},{"x":207,"y":597},{"x":187,"y":549},
    {"x":187,"y":515},{"x":199,"y":505},{"x":197,"y":500},{"x":181,"y":488},
    {"x":216,"y":469},{"x":217,"y":460},{"x":212,"y":457},{"x":250,"y":421},
    {"x":243,"y":402},{"x":276,"y":401},{"x":284,"y":389},{"x":272,"y":375},
    {"x":322,"y":351},{"x":334,"y":346}
];

/*
export function loadWaterBoundary(config) {
    boundaryPoints = config.boundaryPoints;
}
*/

export function isInWater(x, y) {
    let inside = false;
    for (let i = 0, j = WATER_BOUNDARY.length - 1; i < WATER_BOUNDARY.length; i++) {
        const xi = WATER_BOUNDARY[i].x;
        const yi = WATER_BOUNDARY[i].y;
        const xj = WATER_BOUNDARY[j].x;
        const yj = WATER_BOUNDARY[j].y;

        const intersects = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersects) inside = !inside;

        j = i;
    }
    return inside;
}

export function getNearestShorePoint(x, y) {
    let nearestPoint = null;
    let nearestDist = Infinity;

    for (let i = 0, j = WATER_BOUNDARY.length - 1; i < WATER_BOUNDARY.length; i++) {
        const xi = WATER_BOUNDARY[i].x;
        const yi = WATER_BOUNDARY[i].y;
        const xj = WATER_BOUNDARY[j].x;
        const yj = WATER_BOUNDARY[j].y;

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