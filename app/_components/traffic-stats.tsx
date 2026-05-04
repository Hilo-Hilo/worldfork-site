import { getTrafficData, summarize } from "@/lib/traffic";

function fmt(n: number): string {
  if (!n) return "—";
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export default async function TrafficStats() {
  const data = await getTrafficData();
  const s = summarize(data);

  const items: Array<[string, string]> = [
    [s.hasData ? fmt(s.cloneTotal) : "—", "total installs · clones"],
    [s.hasData ? fmt(s.viewTotal) : "—", "repo views · landing"],
  ];

  return (
    <>
      {items.map(([n, l]) => (
        <div key={l} className="border-l hairline-strong pl-3">
          <div className="num text-[22px] md:text-[24px] text-bone-100 leading-none">
            {n}
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone-400 mt-2 leading-tight">
            {l}
          </div>
        </div>
      ))}
    </>
  );
}
