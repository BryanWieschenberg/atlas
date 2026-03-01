import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
    title: "Atlas",
    description: "Atlas - Paper Graph Explorer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
                <ThemeProvider>
                    <Providers>{children}</Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
