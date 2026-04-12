"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { GraphData, GraphNode } from "../../types/paper-graph";
import { fetchGraph } from "../../lib/paperGraphData";

export function usePaperGraph(
    maxNodes: number,
    minYear: number,
    maxYear: number,
    minCitations: number,
    authorFilter: string,
    fieldFilter: string,
    session: {
        user?: { name?: string | null; email?: string | null; image?: string | null };
    } | null,
) {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Connected to Neo4j — enter a topic to explore");
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [fieldsPresent, setFieldsPresent] = useState<string[]>([]);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
    const hoveredRef = useRef<GraphNode | null>(null);
    const [savedRefreshKey, setSavedRefreshKey] = useState(0);
    const [savedOpen, setSavedOpen] = useState(false);

    const adjacencyList = useMemo(() => {
        const adj = new Map<string, Set<string>>();
        graphData.nodes.forEach((n: GraphNode) => adj.set(n.id, new Set()));
        graphData.links.forEach(
            (l: { source: string | { id: string }; target: string | { id: string } }) => {
                const sourceId = typeof l.source === "string" ? l.source : l.source.id;
                const targetId = typeof l.target === "string" ? l.target : l.target.id;
                adj.get(sourceId)?.add(targetId);
                adj.get(targetId)?.add(sourceId);
            },
        );
        graphData.nodes.forEach((n: GraphNode) => {
            n.degree = adj.get(n.id)?.size || 0;
        });
        return adj;
    }, [graphData]);

    const runSearch = useCallback(
        async (query: string, pageOverride?: number) => {
            if (loading) return;
            const targetPage = pageOverride ?? 0;
            setLoading(true);
            setSelectedNode(null);
            setStatus(
                query.trim() || authorFilter.trim() || fieldFilter.trim()
                    ? "Scanning the cosmos…"
                    : "Loading papers…",
            );
            setGraphData({ nodes: [], links: [] });
            try {
                const data = await fetchGraph(
                    query,
                    maxNodes,
                    minYear,
                    maxYear,
                    minCitations,
                    authorFilter,
                    fieldFilter,
                    targetPage * maxNodes,
                );
                if (data.nodes.length === 0) {
                    setStatus(
                        targetPage > 0
                            ? "No more results."
                            : "No results found. Try a different query.",
                    );
                    setHasMore(false);
                    setLoading(false);
                    return;
                }
                const fields = [...new Set(data.nodes.flatMap((n: GraphNode) => n.fields))].filter(
                    Boolean,
                ) as string[];
                setFieldsPresent(fields);
                setPage(targetPage);
                setHasMore(data.nodes.length >= maxNodes);
                setTimeout(() => {
                    setGraphData(data);
                    setStatus(
                        `Page ${targetPage + 1} · ${data.nodes.length} papers · ${data.links.length} connections`,
                    );
                    setLoading(false);
                }, 60);
            } catch (e) {
                setStatus(`Error: ${(e as Error).message}`);
                setLoading(false);
            }
        },
        [loading, maxNodes, minYear, maxYear, minCitations, authorFilter, fieldFilter],
    );

    const handleSavePaper = useCallback(async () => {
        if (!selectedNode || !session?.user) return;
        try {
            const res = await fetch("/api/saved", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paperId: selectedNode.id,
                    title: selectedNode.title,
                    field: selectedNode.fields?.[0] ?? null,
                    publication_year: selectedNode.year ?? null,
                    cited_by_count: selectedNode.citations ?? null,
                    open_alex_id: selectedNode.id ?? null,
                }),
            });
            if (res.ok) {
                setSavedRefreshKey((prev) => prev + 1);
                setSavedOpen(true);
            }
        } catch (err) {
            console.error("Failed to save paper", err);
        }
    }, [selectedNode, session]);

    return {
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
    };
}
