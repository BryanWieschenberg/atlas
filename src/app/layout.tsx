import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Stellar Papers",
    description: "Explore academic paper citation networks in a stellar graph visualization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, width: "100vw", height: "100vh", overflow: "hidden" }}>
                {children}
            </body>
        </html>
    );
}
