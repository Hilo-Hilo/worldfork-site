import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const SITE_URL = "https://worldfork.tech";
const TITLE = "WorldFork — Monte Carlo tree search for reality.";
const DESCRIPTION =
  "Open-source social simulation infrastructure that runs Monte Carlo tree search on reality. Define a Big Bang scenario, let agents expand promising decision points, simulate forward, and let a god-agent back up which paths survive. 1st place at HackTech '26.";

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
    "Monte Carlo tree search",
    "MCTS",
    "MCTS for reality",
    "branching simulation",
    "social simulation",
    "multiverse simulation",
    "agent simulation",
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
      "Open-source Monte Carlo tree search for social reality. One scenario, a searched tree of auditable timelines. HackTech '26 1st place.",
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
      codeRepository: "https://github.com/Hilo-Hilo/WorldFork",
      license: "https://www.apache.org/licenses/LICENSE-2.0",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#author`,
        name: "Hilo-Hilo",
        url: "https://github.com/Hilo-Hilo",
        sameAs: [
          "https://github.com/Hilo-Hilo/WorldFork",
          "https://devpost.com/software/worldfork-tech",
          "https://deepwiki.com/Hilo-Hilo/WorldFork",
        ],
      },
      sameAs: [
        "https://github.com/Hilo-Hilo/WorldFork",
        "https://devpost.com/software/worldfork-tech",
        "https://deepwiki.com/Hilo-Hilo/WorldFork",
        "https://worldfork.readthedocs.io/en/latest/",
      ],
      award: "HackTech '26 — 1st place",
      keywords:
        "branching simulation, multiverse, agent infrastructure, counterfactual reasoning, auditable AI",
    },
    {
      "@type": "HowTo",
      "@id": `${SITE_URL}/#install`,
      name: "Install WorldFork using a coding agent",
      description:
        "Install WorldFork with a single agent prompt that runs the official skill, configures the environment, and runs the onboarding demo.",
      totalTime: "PT15M",
      tool: [
        { "@type": "HowToTool", name: "A coding agent (Claude Code, Cursor, etc.)" },
      ],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Paste the install prompt",
          text: 'Drop this prompt into your coding agent: "Run this command to install the WorldFork skill, then use its setup module to set up WorldFork: npx skills add Hilo-Hilo/WorldFork/skills/worldfork --all".',
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Agent installs the skill",
          text: "The agent runs npx skills add Hilo-Hilo/WorldFork/skills/worldfork --all to install the official skill.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Agent walks through prerequisites",
          text: "The skill validates the local environment, prepares configuration, and confirms readiness before bringing up the runtime.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Agent runs the onboarding demo",
          text: "The skill brings up the runtime, applies migrations, seeds initial state, and executes a short demo run to confirm everything works.",
        },
      ],
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
            text: "No. WorldFork is model-agnostic — bring whichever model you prefer.",
          },
        },
        {
          "@type": "Question",
          name: "What license does WorldFork use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apache License 2.0. See the LICENSE file in the GitHub repository for the full text.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install WorldFork using a coding agent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Paste this prompt into your agent: \"Run this command to install the WorldFork skill, then use its setup module to set up WorldFork: npx skills add Hilo-Hilo/WorldFork/skills/worldfork --all\". The skill handles clone, environment bring-up, and first-run validation.",
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
