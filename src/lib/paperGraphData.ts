import { GraphData, GraphLink, GraphNode, MockRef, Paper } from "../types/paper-graph";
import { PaperNode } from "../types/graph";
import { fieldColor } from "./paperGraphUtils";

export async function fetchGraph(
    query: string,
    maxNodes: number,
    minYear: number,
    maxYear: number,
    minCitations: number,
    authorFilter: string,
    fieldFilter: string,
    offset: number,
): Promise<GraphData> {
    return fetchNeo4jGraph(
        query,
        maxNodes,
        minYear,
        maxYear,
        minCitations,
        authorFilter,
        fieldFilter,
        offset,
    );
}

async function fetchNeo4jGraph(
    query: string,
    maxNodes: number,
    minYear: number,
    maxYear: number,
    minCitations: number,
    authorFilter: string,
    fieldFilter: string,
    offset: number,
): Promise<GraphData> {
    const params = new URLSearchParams({
        limit: String(maxNodes),
        offset: String(offset),
    });
    if (query.trim()) params.set("keyword", query.trim());
    if (minYear > 0) params.set("publication_year_start", String(minYear));
    if (maxYear > 0) params.set("publication_year_end", String(maxYear));
    if (authorFilter.trim()) params.set("author", authorFilter.trim());
    if (fieldFilter.trim()) params.set("field", fieldFilter.trim());
    const res = await fetch(`/api/graph?${params}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error((err as { error: string }).error || `Server error ${res.status}`);
    }
    const data = await res.json();

    const nodes: GraphNode[] = (data.nodes || []).map((n: PaperNode) => ({
        id: n.id,
        title: n.metadata?.title || n.label || "Untitled",
        year: n.metadata?.publication_year ?? null,
        citations: n.metadata?.cited_by_count ?? 0,
        fields: n.metadata?.field ? [n.metadata.field] : [],
        abstract: n.metadata?.keywords?.join(", ") || "",
        authors: n.metadata?.authorships || [],
        institution: n.metadata?.institution || undefined,
        topic: n.metadata?.primary_topic || undefined,
        percentile: n.metadata?.citation_normalized_percentile ?? undefined,
        publishedDate: n.metadata?.publication_date || undefined,
        doi: n.metadata?.doi ?? undefined,
        openAlexId: n.metadata?.open_alex_id || n.id,
        color: fieldColor(n.metadata?.field ? [n.metadata.field] : []),
        isPrimary: true,
    }));
    const links: GraphLink[] = (data.edges || []).map((e: { source: string; target: string }) => ({
        source: e.source,
        target: e.target,
    }));
    return { nodes, links };
}

export function buildGraph(primaries: Paper[], allRefs: MockRef[], allPapers: Paper[]): GraphData {
    const nodeMap = new Map<string, GraphNode>();

    primaries.forEach((p) => {
        nodeMap.set(p.paperId, {
            id: p.paperId,
            title: p.title,
            year: p.year,
            citations: p.citationCount,
            fields: p.fieldsOfStudy,
            abstract: p.abstract,
            color: fieldColor(p.fieldsOfStudy),
            isPrimary: true,
        });
    });

    const links: GraphLink[] = [];
    const primaryIds = new Set(nodeMap.keys());

    allRefs.forEach(({ sourceId, targets }) => {
        if (!primaryIds.has(sourceId)) return;
        targets.forEach((tid) => {
            const ref = allPapers.find((p) => p.paperId === tid);
            if (!ref) return;
            if (!nodeMap.has(tid)) {
                nodeMap.set(tid, {
                    id: ref.paperId,
                    title: ref.title,
                    year: ref.year,
                    citations: ref.citationCount,
                    fields: ref.fieldsOfStudy,
                    abstract: ref.abstract,
                    color: fieldColor(ref.fieldsOfStudy),
                    isPrimary: false,
                });
            }
            links.push({ source: sourceId, target: tid });
        });
    });

    return { nodes: Array.from(nodeMap.values()), links };
}
