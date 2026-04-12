import { GraphNode } from "../../types/paper-graph";
import { DEFAULT_COLOR, hexToRgb, getNodeRadius } from "../../lib/paperGraphUtils";

export const drawNode = (
    node: object,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
    hoveredNodeId: string | undefined,
    selectedNodeId: string | undefined,
    adjacencyList: Map<string, Set<string>>,
) => {
    try {
        const n = node as GraphNode;
        if (n.x === null || n.x === undefined || n.y === null || n.y === undefined) return;
        const { x, y, color = DEFAULT_COLOR } = n;
        const isHov = hoveredNodeId === n.id;
        const isSelected = selectedNodeId === n.id;
        let isConnectedToSelected = false;

        if (selectedNodeId) {
            isConnectedToSelected = adjacencyList.get(selectedNodeId)?.has(n.id) || false;
        }

        const opacity = selectedNodeId && !isSelected && !isConnectedToSelected ? 0.2 : 1;
        const radius = getNodeRadius(n.degree ?? 0, isHov || isSelected);
        const { r, g, b } = hexToRgb(color);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(
            0,
            `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(
                255,
                b + 40,
            )},${1 * opacity})`,
        );
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},${1 * opacity})`);
        gradient.addColorStop(
            1,
            `rgba(${Math.max(0, r - 30)},${Math.max(0, g - 30)},${Math.max(
                0,
                b - 30,
            )},${1 * opacity})`,
        );

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.lineWidth = 0.5 * (isSelected ? 2 : 1);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.stroke();
    } catch {
        /* swallow */
    }
};

export const paintNodePointerArea = (
    node: object,
    color: string,
    ctx: CanvasRenderingContext2D,
) => {
    const n = node as GraphNode;
    if (n.x === null || n.x === undefined || n.y === null || n.y === undefined) return;
    const radius = getNodeRadius(n.degree ?? 0, false);
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
};

export const drawLink = (
    link: object,
    ctx: CanvasRenderingContext2D,
    selectedNodeId: string | undefined,
) => {
    try {
        const l = link as { source: GraphNode; target: GraphNode };
        const { source: s, target: t } = l;
        if (!s || !t || s.x === null || s.x === undefined || t.x === null || t.x === undefined)
            return;
        const dx = t.x! - s.x!,
            dy = t.y! - s.y!;
        if (dx * dx + dy * dy < 1) return;

        const isConnectedToSelected =
            selectedNodeId && (s.id === selectedNodeId || t.id === selectedNodeId);

        const opacity = selectedNodeId && !isConnectedToSelected ? 0.05 : 0.22;
        const highlightMultiplier = isConnectedToSelected ? 2.5 : 1;
        const lineWidth = 0.7 * highlightMultiplier;

        const { r, g, b } = hexToRgb(s.color || DEFAULT_COLOR);
        ctx.beginPath();
        ctx.moveTo(s.x!, s.y!);
        ctx.lineTo(t.x!, t.y!);
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * highlightMultiplier})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    } catch {
        /* swallow */
    }
};
