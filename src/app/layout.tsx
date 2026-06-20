import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marrai — AI Visibility for Indian Brands",
  description:
    "Discover whether your brand is being mentioned — or replaced — across ChatGPT, Perplexity, and Gemini. India's first AEO monitoring platform.",
  openGraph: {
    title: "Marrai — AI Visibility for Indian Brands",
    description:
      "Your brand is feeding AI answer engines. Are you capturing any credit?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}