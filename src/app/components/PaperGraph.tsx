"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import AuthButtons from "./AuthButtons";
import AiChatPanel from "./AiChatPanel";
import SavedPapersPanel from "./SavedPapersPanel";
import GraphSidebar from "./GraphSidebar";
import GraphTooltip from "./GraphTooltip";
import GraphStats from "./GraphStats";
import SelectedNodePanel from "./SelectedNodePanel";
import { useTheme } from "./ThemeProvider";
import { useSession } from "next-auth/react";
import { GraphNode } from "../../types/paper-graph";
import { getNodeRadius } from "../../lib/paperGraphUtils";
import { buildPaperGraphTheme } from "../../lib/paperGraphTheme";
import { useColorClusterForce } from "../../hooks/useColorClusterForce";
import { usePaperGraph } from "../hooks/usePaperGraph";
import { drawNode, drawLink, paintNodePointerArea } from "../lib/paperGraphDrawing";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
    loading: () => (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "400px",
            }}
        >
            <p>Loading Graph...</p>
        </div>
    ),
});

export default function PaperGraph() {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<{
        d3Force: (name: string, force: unknown) => void;
        d3ReheatSimulation: () => void;
    } | null>(null);
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { data: session } = useSession();
    const t = useMemo(() => buildPaperGraphTheme(isDark), [isDark]);

    const [dims, setDims] = useState({ w: 1200, h: 800 });
    const [query, setQuery] = useState("");
    const [maxNodes, setMaxNodes] = useState(250);
    const [minYear, setMinYear] = useState(1800);
    const [maxYear, setMaxYear] = useState(new Date().getFullYear());
    const [minCitations, setMinCitations] = useState(0);
    const [authorFilter, setAuthorFilter] = useState("");
    const [fieldFilter, setFieldFilter] = useState("");
    const [aiOpen, setAiOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const {
        graphData,
        loading,
        status,
        page,
        hasMore,
        fieldsPresent,
        selectedNode,
        setSelectedNode,
        hoveredNode,
        setHoveredNode,
        hoveredRef,
        adjacencyList,
        runSearch,
        handleSavePaper,
        savedRefreshKey,
        savedOpen,
        setSavedOpen,
    } = usePaperGraph(maxNodes, minYear, maxYear, minCitations, authorFilter, fieldFilter, session);

    useEffect(() => {
        setDims({ w: window.innerWidth, h: window.innerHeight });
        const obs = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setDims({ w: width, h: height });
        });
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    useColorClusterForce(fgRef, graphData);

    useEffect(() => {
        runSearch(query, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNodeHover = useCallback(
        (node: object | null) => {
            const n = node as GraphNode | null;
            hoveredRef.current = n;
            setHoveredNode(n);
        },
        [hoveredRef, setHoveredNode],
    );

    return (
        <div
            ref={containerRef}
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                background: t.bg,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <button
                    onClick={() => setSavedOpen(!savedOpen)}
                    disabled={!session?.user}
                    style={{
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: 8,
                        border: `1px solid ${session?.user ? (isDark ? "rgba(79,195,247,0.3)" : "rgba(2,132,199,0.25)") : "rgba(255,255,255,0.1)"}`,
                        background: savedOpen
                            ? isDark
                                ? "rgba(79,195,247,0.2)"
                                : "rgba(2,132,199,0.15)"
                            : isDark
                              ? "rgba(79,195,247,0.08)"
                              : "rgba(2,132,199,0.05)",
                        color: session?.user
                            ? isDark
                                ? "#4fc3f7"
                                : "#0284c7"
                            : "rgba(255,255,255,0.3)",
                        cursor: session?.user ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    ✦ Saved
                </button>
                <button
                    onClick={() => setAiOpen(!aiOpen)}
                    disabled={!session?.user}
                    style={{
                        height: "36px",
                        padding: "0 10px",
                        borderRadius: 8,
                        border: `1px solid ${session?.user ? (isDark ? "rgba(79,195,247,0.3)" : "rgba(2,132,199,0.25)") : "rgba(255,255,255,0.1)"}`,
                        background: aiOpen
                            ? isDark
                                ? "rgba(79,195,247,0.2)"
                                : "rgba(2,132,199,0.15)"
                            : isDark
                              ? "rgba(79,195,247,0.08)"
                              : "rgba(2,132,199,0.05)",
                        color: session?.user
                            ? isDark
                                ? "#4fc3f7"
                                : "#0284c7"
                            : "rgba(255,255,255,0.3)",
                        cursor: session?.user ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    ✦ AI
                </button>
                <AuthButtons />
            </div>

            <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                <ForceGraph2D
                    ref={fgRef}
                    width={dims.w}
                    height={dims.h}
                    graphData={graphData}
                    backgroundColor="rgba(0,0,0,0)"
                    nodeCanvasObject={(node, ctx, scale) =>
                        drawNode(node, ctx, scale, hoveredNode?.id, selectedNode?.id, adjacencyList)
                    }
                    nodeCanvasObjectMode={() => "replace"}
                    nodePointerAreaPaint={paintNodePointerArea}
                    onNodeClick={setSelectedNode}
                    linkCanvasObject={(link, ctx) => drawLink(link, ctx, selectedNode?.id)}
                    linkCanvasObjectMode={() => "replace"}
                    onNodeHover={handleNodeHover}
                    nodeLabel=""
                    cooldownTicks={150}
                    d3AlphaDecay={0.025}
                    d3VelocityDecay={0.35}
                    enableNodeDrag={false}
                    enableZoomInteraction
                    onRenderFramePost={(ctx: CanvasRenderingContext2D, globalScale: number) => {
                        if (selectedNode && selectedNode.x !== null && selectedNode.y !== null) {
                            const n = selectedNode as GraphNode;
                            const x = n.x as number,
                                y = n.y as number;
                            const radius = getNodeRadius(n.degree ?? 0, true);
                            const fs = Math.max(2.5, 16.5 / globalScale);
                            ctx.font = `700 ${fs}px "Space Mono", monospace`;
                            ctx.textAlign = "center";
                            ctx.textBaseline = "bottom";
                            ctx.fillStyle = theme === "dark" ? "#ffffff" : "#000000";
                            ctx.fillText(n.title, x, y - radius - 4);
                        }
                    }}
                />
            </div>

            <GraphSidebar
                t={t}
                isDark={isDark}
                query={query}
                setQuery={setQuery}
                runSearch={(p) => runSearch(query, p)}
                loading={loading}
                status={status}
                maxNodes={maxNodes}
                setMaxNodes={setMaxNodes}
                minYear={minYear}
                setMinYear={setMinYear}
                maxYear={maxYear}
                setMaxYear={setMaxYear}
                minCitations={minCitations}
                setMinCitations={setMinCitations}
                authorFilter={authorFilter}
                setAuthorFilter={setAuthorFilter}
                fieldFilter={fieldFilter}
                setFieldFilter={setFieldFilter}
                fieldsPresent={fieldsPresent}
                page={page}
                hasMore={hasMore}
                useMock={false}
            />

            {hoveredNode && (
                <GraphTooltip hoveredNode={hoveredNode} mousePos={mousePos} dims={dims} t={t} />
            )}

            {graphData.nodes.length > 0 && (
                <GraphStats
                    nodeCount={graphData.nodes.length}
                    linkCount={graphData.links.length}
                    fieldCount={fieldsPresent.length}
                    t={t}
                />
            )}

            {selectedNode && (
                <SelectedNodePanel
                    selectedNode={selectedNode}
                    setSelectedNode={setSelectedNode}
                    adjacencyList={adjacencyList}
                    graphData={graphData}
                    t={t}
                    isDark={isDark}
                    session={session}
                    handleSavePaper={handleSavePaper}
                />
            )}

            <AiChatPanel
                open={aiOpen}
                onClose={() => setAiOpen(false)}
                graphContext={{
                    nodes: graphData.nodes,
                    links: graphData.links,
                    fields: fieldsPresent,
                }}
            />
            <SavedPapersPanel
                open={savedOpen}
                onClose={() => setSavedOpen(false)}
                refreshKey={savedRefreshKey}
            />
        </div>
    );
}
