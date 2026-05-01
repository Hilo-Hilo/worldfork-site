import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "WorldFork — Fork the world.",
  description:
    "Agent-operated branching social simulation. Spin up a Big Bang, let agents tick it forward, branch on consequential decisions, audit each timeline, read the structured report.",
  metadataBase: new URL("https://worldfork-site.vercel.app"),
  openGraph: {
    title: "WorldFork — Fork the world.",
    description:
      "Open-source branching social simulation infrastructure. HackTech '26 1st place.",
    url: "https://worldfork-site.vercel.app",
    siteName: "WorldFork",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', resolved);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-ink-900 text-bone-100">{children}</body>
    </html>
  );
}
