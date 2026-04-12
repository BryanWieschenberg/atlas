declare module "react-force-graph-2d" {
    import { Component } from "react";

    interface ForceGraph2DProps {
        graphData?: { nodes: object[]; links: object[] };
        width?: number;
        height?: number;
        backgroundColor?: string;
        nodeCanvasObject?: (
            node: object,
            ctx: CanvasRenderingContext2D,
            globalScale: number,
        ) => void;
        nodeCanvasObjectMode?: (node: object) => string;
        linkCanvasObject?: (link: object, ctx: CanvasRenderingContext2D) => void;
        linkCanvasObjectMode?: (link: object) => string;
        onNodeHover?: (node: object | null) => void;
        nodeLabel?: string | ((node: object) => string);
        linkDirectionalParticles?: number;
        linkDirectionalParticleWidth?: number | ((link: object) => number);
        linkDirectionalParticleColor?: (link: object) => string;
        linkDirectionalParticleSpeed?: number;
        cooldownTicks?: number;
        d3AlphaDecay?: number;
        d3VelocityDecay?: number;
        enableNodeDrag?: boolean;
        enableZoomInteraction?: boolean;
        [key: string]: unknown;
    }

    export default class ForceGraph2D extends Component<ForceGraph2DProps> {}
}

declare module "d3-force" {
    export function forceCollide(radius?: number | ((node: unknown) => number)): unknown;
    export function forceLink(links?: unknown[]): unknown;
    export function forceManyBody(): unknown;
    export function forceCenter(x?: number, y?: number): unknown;
    export function forceX(x?: number): unknown;
    export function forceY(y?: number): unknown;
}
