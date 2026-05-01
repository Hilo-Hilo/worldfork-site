import type { Metadata, Viewport } from "next";
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

const SITE_URL = "https://worldfork-site.vercel.app";
const TITLE = "WorldFork — Fork the world.";
const DESCRIPTION =
  "Open-source branching social simulation infrastructure. Spin up a Big Bang scenario, let agents tick it forward, branch on consequential decisions, audit every timeline, and read the structured report. Built with FastAPI, LangGraph, and OpenRouter. 1st place at HackTech '26.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · WorldFork",
  },
  description: DESCRIPTION,
  applicationName: "WorldFork",
  authors: [{ name: "Hilo-Hilo", url: "https://github.com/Hilo-Hilo" }],
  generator: "Next.js",
  keywords: [
    "WorldFork",
    "branching simulation",
    "social simulation",
    "multiverse simulation",
    "agent simulation",
    "LangGraph",
    "FastAPI",
    "OpenRouter",
    "open source",
    "HackTech 2026",
    "AI agents",
    "auditable AI",
    "counterfactual simulation",
    "Big Bang scenario",
  ],
  category: "technology",
  alternates: {
    canonical: "/",
    types: {
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "WorldFork",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Open-source branching social simulation infrastructure. One scenario, many auditable timelines. HackTech '26 1st place.",
    creator: "@worldfork",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "WorldFork",
      description: DESCRIPTION,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Simulation",
      operatingSystem: "Linux, macOS, Windows (Docker)",
      programmingLanguage: ["Python"],
      codeRepository: "https://github.com/Hilo-Hilo/WorldFork",
      license:
        "https://github.com/Hilo-Hilo/WorldFork/blob/main/LICENSE",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: {
        "@type": "Organization",
        name: "Hilo-Hilo",
        url: "https://github.com/Hilo-Hilo",
      },
      award: "HackTech '26 — 1st place",
      keywords:
        "branching simulation, multiverse, agent infrastructure, LangGraph, FastAPI, OpenRouter, auditable AI",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "WorldFork",
      description: DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": `${SITE_URL}/#software` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is WorldFork a SaaS product?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. WorldFork is open-source backend infrastructure that you self-host. There is no hosted service, no login, and no data is collected by this site.",
          },
        },
        {
          "@type": "Question",
          name: "What is a Big Bang in WorldFork?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A Big Bang is the root scenario document that seeds a run. It defines the initial world state, primary simulation question, and the conditions agents tick forward from.",
          },
        },
        {
          "@type": "Question",
          name: "Does WorldFork require a specific LLM?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. WorldFork ships with OpenRouter so any supported model works. You provide an OpenRouter API key during setup.",
          },
        },
        {
          "@type": "Question",
          name: "What license does WorldFork use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "MIT-spirited. See the LICENSE file in the GitHub repository for the full text.",
          },
        },
        {
          "@type": "Question",
          name: "Can I run WorldFork without Docker?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Docker Compose is the supported path. You need Python 3.11+, Docker, and an OpenRouter key. Manual native installs are possible but not the documented happy path.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install WorldFork using a coding agent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Paste this prompt into your agent: \"Run this command to install the WorldFork setup skill, then use it to set up WorldFork: npx skills add Hilo-Hilo/WorldFork/skills/worldfork-setup --all\". The skill handles clone, Docker bring-up, and first-run validation.",
          },
        },
      ],
    },
  ],
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
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://worldfork.readthedocs.io" />
        <link rel="dns-prefetch" href="https://deepwiki.com" />
        <link rel="dns-prefetch" href="https://devpost.com" />
        <link
          rel="alternate"
          type="text/plain"
          title="LLM-friendly site summary"
          href="/llms.txt"
        />
        <noscript>
          <style>{`html:not([data-theme]) { color-scheme: dark; }`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(STRUCTURED_DATA),
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-ink-900 text-bone-100">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
