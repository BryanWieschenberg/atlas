"use client";

import { GraphNode } from "../../types/paper-graph";
import { PaperGraphTheme } from "../../lib/paperGraphTheme";

interface GraphTooltipProps {
    hoveredNode: GraphNode;
    mousePos: { x: number; y: number };
    dims: { w: number; h: number };
    t: PaperGraphTheme;
}

export default function GraphTooltip({ hoveredNode, mousePos, dims, t }: GraphTooltipProps) {
    return (
        <div
            style={{
                position: "absolute",
                left: Math.min(mousePos.x + 16, dims.w - 300),
                top: Math.max(mousePos.y - 10, 8),
                background: t.tooltipBg,
                border: `1px solid ${hoveredNode.color}44`,
                borderRadius: 8,
                padding: "10px 14px",
                maxWidth: 270,
                pointerEvents: "none",
                zIndex: 30,
                boxShadow: `0 0 24px ${hoveredNode.color}28`,
                fontFamily: '"Space Mono", monospace',
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    color: hoveredNode.color,
                    marginBottom: 5,
                    lineHeight: 1.5,
                    textShadow: `0 0 8px ${hoveredNode.color}`,
                }}
            >
                {hoveredNode.title}
            </div>
            <div style={{ fontSize: 10, color: t.textMuted, marginBottom: 3 }}>
                {hoveredNode.year ? `📅 ${hoveredNode.year}` : ""}
                {hoveredNode.citations
                    ? `  ✦ ${hoveredNode.citations.toLocaleString()} citations`
                    : ""}
            </div>
            {hoveredNode.fields?.length > 0 && (
                <div
                    style={{
                        fontSize: 9,
                        color: t.textFaint,
                        marginBottom: hoveredNode.abstract ? 4 : 0,
                    }}
                >
                    {hoveredNode.fields.join(" · ")}
                </div>
            )}
            {hoveredNode.abstract && (
                <div
                    style={{
                        fontSize: 9,
                        color: t.textFaint,
                        lineHeight: 1.5,
                        marginTop: 4,
                        borderTop: `1px solid ${t.tooltipBorder}`,
                        paddingTop: 4,
                    }}
                >
                    {hoveredNode.abstract.length > 120
                        ? hoveredNode.abstract.slice(0, 120) + "…"
                        : hoveredNode.abstract}
                </div>
            )}
        </div>
    );
}
