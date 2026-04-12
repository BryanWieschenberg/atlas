"use client";

import { PaperGraphTheme } from "../../lib/paperGraphTheme";

interface GraphStatsProps {
    nodeCount: number;
    linkCount: number;
    fieldCount: number;
    t: PaperGraphTheme;
}

export default function GraphStats({ nodeCount, linkCount, fieldCount, t }: GraphStatsProps) {
    return (
        <div
            style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                display: "flex",
                gap: 10,
                zIndex: 10,
            }}
        >
            {[
                { n: nodeCount, l: "Papers" },
                { n: linkCount, l: "Connections" },
                { n: fieldCount, l: "Fields" },
            ].map(({ n, l }) => (
                <div
                    key={l}
                    style={{
                        background: t.statBg,
                        border: `1px solid ${t.divider}`,
                        borderRadius: 6,
                        padding: "7px 13px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontFamily: '"Orbitron", monospace',
                            fontSize: 17,
                            fontWeight: 700,
                            color: t.accent,
                            textShadow: t.accentShadow,
                        }}
                    >
                        {n}
                    </div>
                    <div
                        style={{
                            fontSize: 9,
                            color: t.textMuted,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                        }}
                    >
                        {l}
                    </div>
                </div>
            ))}
        </div>
    );
}
