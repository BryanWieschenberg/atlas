export interface Paper {
    paperId: string;
    title: string;
    year: number | null;
    citationCount: number;
    fieldsOfStudy: string[];
    abstract: string;
    _score?: number;
}

export interface GraphNode {
    id: string;
    title: string;
    year: number | null;
    citations: number;
    fields: string[];
    abstract: string;
    doi?: string;
    authors?: string[];
    institution?: string;
    topic?: string;
    percentile?: number;
    publishedDate?: string;
    openAlexId?: string;
    color: string;
    isPrimary: boolean;
    degree?: number;
    x?: number;
    y?: number;
}

export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export interface MockRef {
    sourceId: string;
    targets: string[];
}
