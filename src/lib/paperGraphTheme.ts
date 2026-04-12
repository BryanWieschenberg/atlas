export interface PaperGraphTheme {
    bg: string;
    sidebarBg: string;
    accent: string;
    accentMuted: string;
    accentBorder: string;
    accentBorderStrong: string;
    accentBg: string;
    accentBgMuted: string;
    divider: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textFaint: string;
    textField: string;
    inputBg: string;
    tooltipBg: string;
    statBg: string;
    statusColor: string;
    titleShadow: string;
    accentShadow: string;
    tooltipBorder: string;
}

export function buildPaperGraphTheme(isDark: boolean): PaperGraphTheme {
    return isDark
        ? {
              bg: "#01020d",
              sidebarBg: "linear-gradient(to right, rgba(1,2,13,0.97) 78%, transparent)",
              accent: "#4fc3f7",
              accentMuted: "rgba(79,195,247,0.5)",
              accentBorder: "rgba(79,195,247,0.3)",
              accentBorderStrong: "rgba(79,195,247,0.4)",
              accentBg: "rgba(79,195,247,0.14)",
              accentBgMuted: "rgba(79,195,247,0.06)",
              divider: "rgba(79,195,247,0.18)",
              textPrimary: "#fff",
              textSecondary: "#c8deff",
              textMuted: "rgba(200,222,255,0.45)",
              textFaint: "rgba(200,222,255,0.28)",
              textField: "rgba(200,222,255,0.7)",
              inputBg: "rgba(6,14,50,0.85)",
              tooltipBg: "rgba(2,5,22,0.96)",
              statBg: "rgba(2,5,22,0.9)",
              statusColor: "rgba(79,195,247,0.65)",
              titleShadow: "0 0 28px rgba(79,195,247,0.85)",
              accentShadow: "0 0 10px rgba(79,195,247,0.65)",
              tooltipBorder: "rgba(255,255,255,0.06)",
          }
        : {
              bg: "#f0f4f8",
              sidebarBg: "linear-gradient(to right, rgba(241,245,249,0.97) 78%, transparent)",
              accent: "#0284c7",
              accentMuted: "rgba(2,132,199,0.5)",
              accentBorder: "rgba(2,132,199,0.25)",
              accentBorderStrong: "rgba(2,132,199,0.4)",
              accentBg: "rgba(2,132,199,0.1)",
              accentBgMuted: "rgba(2,132,199,0.04)",
              divider: "rgba(2,132,199,0.15)",
              textPrimary: "#1e293b",
              textSecondary: "#334155",
              textMuted: "rgba(51,65,85,0.6)",
              textFaint: "rgba(51,65,85,0.35)",
              textField: "rgba(51,65,85,0.8)",
              inputBg: "rgba(255,255,255,0.9)",
              tooltipBg: "rgba(255,255,255,0.96)",
              statBg: "rgba(255,255,255,0.92)",
              statusColor: "rgba(2,132,199,0.65)",
              titleShadow: "none",
              accentShadow: "none",
              tooltipBorder: "rgba(0,0,0,0.06)",
          };
}
