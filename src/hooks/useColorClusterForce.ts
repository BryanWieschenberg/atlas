import { useEffect, MutableRefObject } from "react";
import { GraphData, GraphNode } from "../types/paper-graph";
import { getNodeRadius } from "../lib/paperGraphUtils";

const ATTRACT_STRENGTH = 0.005;
const REPEL_STRENGTH = 1.5;
const REPEL_RADIUS = 100;

interface ForceGraphHandle {
    d3Force: (name: string, force: unknown) => void;
    d3ReheatSimulation: () => void;
}

export function useColorClusterForce(
    fgRef: MutableRefObject<ForceGraphHandle | null>,
    graphData: GraphData,
) {
    useEffect(() => {
        if (!fgRef.current || graphData.nodes.length === 0) return;

        function colorClusterForce(alpha: number) {
            const nodes = graphData.nodes as Array<GraphNode & { vx?: number; vy?: number }>;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    if (
                        a.x === null ||
                        a.x === undefined ||
                        a.y === null ||
                        a.y === undefined ||
                        b.x === null ||
                        b.x === undefined ||
                        b.y === null ||
                        b.y === undefined
                    )
                        continue;

                    const dx = b.x - a.x || 0.001;
                    const dy = b.y - a.y || 0.001;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    const minDist =
                        getNodeRadius(a.degree ?? 0, false) +
                        getNodeRadius(b.degree ?? 0, false) +
                        2;
                    if (dist < minDist) {
                        const overlap = ((minDist - dist) / dist) * 1.2;
                        a.vx = (a.vx ?? 0) - nx * overlap;
                        a.vy = (a.vy ?? 0) - ny * overlap;
                        b.vx = (b.vx ?? 0) + nx * overlap;
                        b.vy = (b.vy ?? 0) + ny * overlap;
                        continue;
                    }

                    let fx = 0;
                    let fy = 0;

                    if (a.color === b.color) {
                        const pull = ATTRACT_STRENGTH * alpha * (dist / 200);
                        fx = nx * pull;
                        fy = ny * pull;
                    } else if (dist < REPEL_RADIUS) {
                        const push =
                            REPEL_STRENGTH * alpha * ((REPEL_RADIUS - dist) / REPEL_RADIUS);
                        fx = -nx * push;
                        fy = -ny * push;
                    }

                    a.vx = (a.vx ?? 0) + fx;
                    a.vy = (a.vy ?? 0) + fy;
                    b.vx = (b.vx ?? 0) - fx;
                    b.vy = (b.vy ?? 0) - fy;
                }
            }
        }

        fgRef.current.d3Force("color-clustering", colorClusterForce);
        fgRef.current.d3Force("collision", null);
        fgRef.current.d3ReheatSimulation();
    }, [fgRef, graphData]);
}
