// Deterministic HSL color from a line number string
const ROUTE_COLORS: Record<string, string> = {};
let hueIndex = 0;

const BASE_HUES = [210, 340, 120, 40, 280, 170, 20, 310, 60, 240, 0, 150, 80, 200, 330];

export function getRouteColor(lineNumber: string): string {
    if (!lineNumber) return 'transparent';
    if (ROUTE_COLORS[lineNumber]) return ROUTE_COLORS[lineNumber];
    const hue = BASE_HUES[hueIndex % BASE_HUES.length];
    hueIndex++;
    const color = `hsl(${hue}, 70%, 55%)`;
    ROUTE_COLORS[lineNumber] = color;
    return color;
}
