import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SF Narrative Battlefield",
  description: "Timeline of SF trending topics with LLM-powered narrative analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}

