"use client";

import Image from "next/image";
import { fieldColor } from "../../lib/paperGraphUtils";
import { PaperGraphTheme } from "../../lib/paperGraphTheme";

interface GraphSidebarProps {
    t: PaperGraphTheme;
    isDark: boolean;
    query: string;
    setQuery: (q: string) => void;
    runSearch: (page?: number) => void;
    loading: boolean;
    status: string;
    maxNodes: number;
    setMaxNodes: (v: number) => void;
    minYear: number;
    setMinYear: (v: number) => void;
    maxYear: number;
    setMaxYear: (v: number) => void;
    minCitations: number;
    setMinCitations: (v: number) => void;
    authorFilter: string;
    setAuthorFilter: (v: string) => void;
    fieldFilter: string;
    setFieldFilter: (v: string) => void;
    fieldsPresent: string[];
    page: number;
    hasMore: boolean;
    useMock: boolean;
}

export default function GraphSidebar({
    t,
    isDark,
    query,
    setQuery,
    runSearch,
    loading,
    status,
    maxNodes,
    setMaxNodes,
    minYear,
    setMinYear,
    maxYear,
    setMaxYear,
    minCitations,
    setMinCitations,
    authorFilter,
    setAuthorFilter,
    fieldFilter,
    setFieldFilter,
    fieldsPresent,
    page,
    hasMore,
    useMock,
}: GraphSidebarProps) {
    const sliders = [
        {
            label: "Max Papers",
            val: maxNodes,
            set: setMaxNodes,
            min: 1,
            max: 2000,
            step: 1,
        },
        {
            label: "Min Year",
            val: minYear,
            set: setMinYear,
            min: 1800,
            max: new Date().getFullYear(),
            step: 1,
        },
        {
            label: "Max Year",
            val: maxYear,
            set: setMaxYear,
            min: 1900,
            max: new Date().getFullYear(),
            step: 1,
        },
        {
            label: "Min Citations",
            val: minCitations,
            set: setMinCitations,
            min: 0,
            max: 5000,
            step: 100,
        },
    ] as const;

    return (
        <aside
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 300,
                height: "100%",
                zIndex: 10,
                background: t.sidebarBg,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                overflowY: "auto",
                fontFamily: '"Space Mono", monospace',
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    fontFamily: '"Orbitron", monospace',
                    fontSize: 28,
                    textAlign: "center",
                    fontWeight: 900,
                    color: t.textPrimary,
                    lineHeight: 1.1,
                    textShadow: t.titleShadow,
                    marginBottom: 2,
                }}
            >
                {isDark ? (
                    <Image src="/logo_white.svg" alt="Stellar Papers" width={200} height={50} />
                ) : (
                    <Image src="/logo_dark.svg" alt="Stellar Papers" width={200} height={50} />
                )}
            </div>

            <input
                style={{
                    width: "100%",
                    padding: "9px 13px",
                    boxSizing: "border-box",
                    background: t.inputBg,
                    border: `1px solid ${t.accentBorder}`,
                    borderRadius: 6,
                    color: t.textSecondary,
                    fontFamily: '"Space Mono", monospace',
                    fontSize: 12,
                    outline: "none",
                }}
                placeholder={useMock ? "Try: transformer, diffusion…" : "Search papers..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch(0)}
            />
            <button
                onClick={() => runSearch(0)}
                disabled={loading}
                style={{
                    padding: 9,
                    borderRadius: 6,
                    cursor: loading ? "default" : "pointer",
                    background: loading ? t.accentBgMuted : t.accentBg,
                    border: `1px solid ${t.accentBorderStrong}`,
                    color: t.accent,
                    fontFamily: '"Orbitron", monospace',
                    fontSize: 11,
                    letterSpacing: "0.12em",
                }}
            >
                {loading ? "◌  SCANNING…" : "⊕  LAUNCH SEARCH"}
            </button>
            <div style={{ display: "flex", gap: 6 }}>
                <button
                    onClick={() => runSearch(page - 1)}
                    disabled={loading || page === 0}
                    style={{
                        flex: 1,
                        padding: 7,
                        borderRadius: 6,
                        cursor: loading || page === 0 ? "default" : "pointer",
                        background: loading || page === 0 ? t.accentBgMuted : t.accentBg,
                        border: `1px solid ${t.accentBorderStrong}`,
                        color: t.accent,
                        fontFamily: '"Orbitron", monospace',
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        opacity: page === 0 ? 0.5 : 1,
                    }}
                >
                    ‹ PREV
                </button>
                <button
                    onClick={() => runSearch(page + 1)}
                    disabled={loading || !hasMore}
                    style={{
                        flex: 1,
                        padding: 7,
                        borderRadius: 6,
                        cursor: loading || !hasMore ? "default" : "pointer",
                        background: loading || !hasMore ? t.accentBgMuted : t.accentBg,
                        border: `1px solid ${t.accentBorderStrong}`,
                        color: t.accent,
                        fontFamily: '"Orbitron", monospace',
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        opacity: !hasMore ? 0.5 : 1,
                    }}
                >
                    NEXT ›
                </button>
            </div>
            <div
                style={{
                    fontSize: 10,
                    color: t.statusColor,
                    minHeight: 14,
                    lineHeight: 1.5,
                    textAlign: "center",
                    width: "100%",
                }}
            >
                {status}
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${t.divider}`, margin: 0 }} />

            {sliders.map(({ label, val, set, min, max, step }) => (
                <div key={label}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 5,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 10,
                                color: t.textMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                            }}
                        >
                            {label}
                        </span>
                        <span
                            style={{
                                fontFamily: '"Orbitron", monospace',
                                fontSize: 12,
                                color: t.accent,
                            }}
                        >
                            {val.toLocaleString()}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={val}
                        onChange={(e) => (set as (v: number) => void)(+e.target.value)}
                        style={{
                            width: "100%",
                            accentColor: t.accent,
                            cursor: "pointer",
                            display: "block",
                        }}
                    />
                </div>
            ))}

            {!useMock && (
                <>
                    <div style={{ marginTop: 6 }}>
                        <div
                            style={{
                                fontSize: 10,
                                color: t.textMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                marginBottom: 5,
                            }}
                        >
                            Author Filter
                        </div>
                        <input
                            type="text"
                            value={authorFilter}
                            onChange={(e) => setAuthorFilter(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && runSearch(0)}
                            placeholder="Author name..."
                            style={{
                                width: "100%",
                                background: "rgba(0,0,0,0.1)",
                                border: `1px solid ${t.divider}`,
                                borderRadius: 4,
                                padding: "6px 8px",
                                color: t.textField,
                                fontSize: 11,
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                color: t.textMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                marginBottom: 5,
                            }}
                        >
                            Field Filter
                        </div>
                        <input
                            type="text"
                            value={fieldFilter}
                            onChange={(e) => setFieldFilter(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && runSearch(0)}
                            placeholder="Field name..."
                            style={{
                                width: "100%",
                                background: "rgba(0,0,0,0.1)",
                                border: `1px solid ${t.divider}`,
                                borderRadius: 4,
                                padding: "6px 8px",
                                color: t.textField,
                                fontSize: 11,
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                </>
            )}

            {fieldsPresent.length > 0 && (
                <>
                    <hr
                        style={{ border: "none", borderTop: `1px solid ${t.divider}`, margin: 0 }}
                    />
                    <div
                        style={{
                            fontSize: 10,
                            color: "rgba(200,222,255,0.45)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Fields of Study
                    </div>
                    {fieldsPresent.map((f) => {
                        const c = fieldColor([f]);
                        return (
                            <div
                                key={f}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 10,
                                    color: t.textField,
                                }}
                            >
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                        background: c,
                                        boxShadow: `0 0 6px ${c}`,
                                    }}
                                />
                                {f}
                            </div>
                        );
                    })}
                </>
            )}

            <hr style={{ border: "none", borderTop: `1px solid ${t.divider}`, margin: 0 }} />
            <div style={{ fontSize: 12, color: t.textFaint, lineHeight: 1.8 }}>
                Drag nodes · Scroll to zoom
                <br />
                Hover for details · Enter to search
            </div>
        </aside>
    );
}
