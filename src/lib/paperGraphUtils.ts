export const FIELD_COLORS: Record<string, string> = {
    "Computer Science": "#4fc3f7",
    Mathematics: "#a78bfa",
    Physics: "#fb923c",
    Biology: "#34d399",
    Medicine: "#f472b6",
    Chemistry: "#fbbf24",
    Engineering: "#22d3ee",
    Economics: "#f97316",
    Psychology: "#e879f9",
    Sociology: "#2dd4bf",
    "Political Science": "#fb7185",
    History: "#ff6e40",
    Philosophy: "#94a3b8",
    Art: "#e879f9",
    Linguistics: "#818cf8",
    "Environmental Science": "#4ade80",
};

export const DYNAMIC_PALETTE = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
];

export const DEFAULT_COLOR = "#7dd3fc";

const dynamicFieldColors = new Map<string, string>();

export function fieldColor(fields: string[]): string {
    if (!fields || !fields.length) return DEFAULT_COLOR;
    const primaryField = fields[0];

    const matchKey = Object.keys(FIELD_COLORS).find(
        (k) => k.toLowerCase() === primaryField.toLowerCase(),
    );
    if (matchKey) return FIELD_COLORS[matchKey];

    const normalizedDynamic = primaryField.toLowerCase();
    if (!dynamicFieldColors.has(normalizedDynamic)) {
        const nextColor = DYNAMIC_PALETTE[dynamicFieldColors.size % DYNAMIC_PALETTE.length];
        dynamicFieldColors.set(normalizedDynamic, nextColor);
    }

    return dynamicFieldColors.get(normalizedDynamic)!;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    if (!hex || hex.length < 7) return { r: 125, g: 200, b: 255 };
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

export function getNodeRadius(degree: number, isHovered = false): number {
    const base = Math.max(3, Math.min(22, 2.5 + Math.sqrt(degree) * 1.8));
    return isHovered ? base * 1.5 : base;
}
