import { PaperNode } from "../types/graph";

interface Neo4jInteger {
    toNumber: () => number;
}

export function toNode(properties: Record<string, unknown>): PaperNode {
    const p = properties as Record<string, string | string[] | Neo4jInteger | null | undefined>;
    return {
        id: (p.id as string) || "",
        label: (p.title as string) || "Untitled",
        type: "paper",
        metadata: {
            title: (p.title as string) ?? null,
            authorships: (p.authorships as string[]) ?? [],
            publication_year: p.publication_year
                ? (p.publication_year as Neo4jInteger).toNumber()
                : null,
            publication_date: (p.publication_date as string) ?? null,
            institution: (p.institution as string) ?? null,
            field: (p.field as string) ?? null,
            cited_by_count: p.cited_by_count ? (p.cited_by_count as Neo4jInteger).toNumber() : null,
            citation_normalized_percentile:
                (p.citation_normalized_percentile as unknown as number) ?? null,
            referenced_works_count: p.referenced_works_count
                ? (p.referenced_works_count as Neo4jInteger).toNumber()
                : null,
            primary_topic: (p.primary_topic as string) ?? null,
            primary_location_source: (p.primary_location_source as string) ?? null,
            keywords: (p.keywords as string[]) ?? [],
            doi: (p.doi as string) ?? null,
            open_alex_id: (p.id as string) ?? null,
        },
    };
}
