"use client";

import { GraphNode, GraphData } from "../../types/paper-graph";
import { PaperGraphTheme } from "../../lib/paperGraphTheme";
import { HiX, HiBookmark } from "react-icons/hi";

interface SelectedNodePanelProps {
    selectedNode: GraphNode;
    setSelectedNode: (node: GraphNode | null) => void;
    adjacencyList: Map<string, Set<string>>;
    graphData: GraphData;
    t: PaperGraphTheme;
    isDark: boolean;
    session: {
        user?: { name?: string | null; email?: string | null; image?: string | null };
    } | null;
    handleSavePaper: () => void;
}

export default function SelectedNodePanel({
    selectedNode,
    setSelectedNode,
    adjacencyList,
    graphData,
    t,
    isDark,
    session,
    handleSavePaper,
}: SelectedNodePanelProps) {
    const connections = Array.from(adjacencyList.get(selectedNode.id) || []);

    return (
        <div
            style={{
                position: "absolute",
                bottom: 80,
                right: 20,
                borderRadius: 12,
                padding: "16px",
                maxWidth: 280,
                maxHeight: "70vh",
                overflowY: "auto",
                zIndex: 20,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${selectedNode.color}33`,
                fontFamily: '"Space Mono", monospace',
                backdropFilter: "blur(12px)",
            }}
        >
            <button
                onClick={() => setSelectedNode(null)}
                style={{
                    background: "none",
                    border: "none",
                    color: isDark ? "rgba(200,222,255,0.5)" : "rgba(51,65,85,0.5)",
                    cursor: "pointer",
                    padding: 0,
                    marginLeft: 4,
                    marginBottom: 4,
                    display: "flex",
                }}
            >
                <HiX size={18} />
            </button>
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: selectedNode.color,
                    marginBottom: 8,
                    lineHeight: 1.4,
                    textShadow: `0 0 12px ${selectedNode.color}88`,
                }}
            >
                {selectedNode.title}
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 12 }}>
                {selectedNode.year ? `📅 ${selectedNode.year}` : ""}
                {selectedNode.citations
                    ? `  ✦ ${selectedNode.citations.toLocaleString()} citations`
                    : ""}
            </div>

            {selectedNode.authors && selectedNode.authors.length > 0 && (
                <div style={{ fontSize: 10, color: t.textFaint, marginBottom: 8, lineHeight: 1.4 }}>
                    <strong>Authors:</strong> {selectedNode.authors.slice(0, 5).join(", ")}
                    {selectedNode.authors.length > 5 ? " et al." : ""}
                </div>
            )}

            {selectedNode.abstract && (
                <div
                    style={{
                        fontSize: 10,
                        color: t.textMuted,
                        marginBottom: 12,
                        lineHeight: 1.5,
                        fontStyle: "italic",
                        borderLeft: `2px solid ${selectedNode.color}66`,
                        paddingLeft: 8,
                    }}
                >
                    {selectedNode.abstract.length > 250
                        ? selectedNode.abstract.slice(0, 250) + "…"
                        : selectedNode.abstract}
                </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                {selectedNode.openAlexId && (
                    <a
                        href={
                            selectedNode.openAlexId.startsWith("http")
                                ? selectedNode.openAlexId
                                : `https://openalex.org/${selectedNode.openAlexId}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: 11,
                            color: t.accent,
                            textDecoration: "none",
                            borderBottom: `1px solid ${t.accent}88`,
                            paddingBottom: 2,
                        }}
                    >
                        Open Link
                    </a>
                )}
                {selectedNode.doi && (
                    <a
                        href={selectedNode.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: 11,
                            color: selectedNode.color,
                            textDecoration: "none",
                            borderBottom: `1px dashed ${selectedNode.color}88`,
                            paddingBottom: 2,
                        }}
                    >
                        View Source ↗
                    </a>
                )}
            </div>

            <button
                onClick={handleSavePaper}
                disabled={!session?.user}
                title={session?.user ? "Save Paper" : "Sign in to save papers"}
                style={{
                    width: "100%",
                    padding: "6px 12px",
                    borderRadius: 6,
                    background: session?.user
                        ? `${selectedNode.color}22`
                        : "rgba(255,255,255,0.05)",
                    border: `1px solid ${session?.user ? `${selectedNode.color}66` : "rgba(255,255,255,0.1)"}`,
                    color: session?.user ? selectedNode.color : "rgba(255,255,255,0.3)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: session?.user ? "pointer" : "not-allowed",
                    opacity: session?.user ? 1 : 0.6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 12,
                }}
            >
                <HiBookmark size={14} />
                Save Paper
            </button>

            {connections.length > 0 && (
                <>
                    <div
                        style={{
                            fontSize: 10,
                            color: t.textFaint,
                            marginBottom: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <span style={{ color: selectedNode.color, fontWeight: "bold" }}>
                            {connections.length}
                        </span>
                        Connected {connections.length === 1 ? "Node" : "Nodes"}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {connections.map((connId: string) => {
                            const connNode = graphData.nodes.find((n) => n.id === connId);
                            if (!connNode) return null;
                            return (
                                <div
                                    key={connId}
                                    style={{
                                        background: "rgba(0,0,0,0.2)",
                                        padding: 8,
                                        borderRadius: 6,
                                        border: `1px solid ${t.divider}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: connNode.color,
                                            fontWeight: "bold",
                                            marginBottom: 6,
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {connNode.title}
                                    </div>
                                    <button
                                        onClick={() => setSelectedNode(connNode)}
                                        style={{
                                            padding: "4px 8px",
                                            borderRadius: 4,
                                            background: `${connNode.color}22`,
                                            border: `1px solid ${connNode.color}55`,
                                            color: connNode.color,
                                            fontSize: 9,
                                            cursor: "pointer",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Select Node
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
