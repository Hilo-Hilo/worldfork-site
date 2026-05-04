import { getTrafficData, summarize } from "@/lib/traffic";

function fmt(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function relTime(iso: string): string {
  if (!iso) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return "—";
  const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60_000));
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.round(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default async function TrafficStrip() {
  const data = await getTrafficData();
  const s = summarize(data);

  return (
    <div className="border hairline-strong bg-ink-850 relative">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--hairline-color)]">
        <Stat
          label="total clones"
          value={s.hasData ? fmt(s.cloneTotal) : "—"}
          sub={
            s.hasData
              ? `${fmt(s.cloneUniqueTotal)} unique · last 14d ${fmt(s.cloneLast14)}`
              : "warming up"
          }
        />
        <Stat
          label="repo views"
          value={s.hasData ? fmt(s.viewTotal) : "—"}
          sub={
            s.hasData
              ? `${fmt(s.viewUniqueTotal)} unique · last 14d ${fmt(s.viewLast14)}`
              : "warming up"
          }
        />
        <Stat
          label="referring sites"
          value={s.topReferrers.length ? `${s.topReferrers.length}+` : "—"}
          sub={
            s.topReferrers[0]
              ? `top: ${truncate(s.topReferrers[0].referrer, 22)}`
              : "no recent traffic"
          }
        />
        <Stat
          label="last sync"
          value={relTime(s.lastUpdated)}
          sub={`${s.daysTracked} day${s.daysTracked === 1 ? "" : "s"} stored`}
        />
      </div>

      {(s.topReferrers.length > 0 || s.topPaths.length > 0) && (
        <div className="grid sm:grid-cols-2 border-t hairline">
          <RankList
            label="top referrers"
            items={s.topReferrers.slice(0, 5).map((r) => ({
              key: r.referrer,
              count: r.count,
              uniques: r.uniques,
            }))}
          />
          <div className="sm:border-l hairline">
            <RankList
              label="popular paths"
              items={s.topPaths.slice(0, 5).map((p) => ({
                key: p.path.replace(/^\/Hilo-Hilo\/WorldFork\/?/, "/") || "/",
                count: p.count,
                uniques: p.uniques,
              }))}
              mono
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-bone-400">
        {label}
      </div>
      <div className="num mt-1.5 text-bone-100 text-[26px] sm:text-[32px] leading-none tracking-[-0.025em]">
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[11px] text-bone-500 truncate">
        {sub}
      </div>
    </div>
  );
}

function RankList({
  label,
  items,
  mono = false,
}: {
  label: string;
  items: { key: string; count: number; uniques: number }[];
  mono?: boolean;
}) {
  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-bone-400 mb-2">
        {label}
      </div>
      {items.length === 0 ? (
        <div className="text-bone-500 text-[12px] font-mono">none yet</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="grid grid-cols-[1fr_auto] gap-3 items-baseline text-[12px]"
            >
              <span
                className={`truncate ${mono ? "font-mono text-bone-200" : "text-bone-200"}`}
                title={it.key}
              >
                {truncate(it.key, 38)}
              </span>
              <span className="num text-bone-400 tabular-nums">
                {fmt(it.count)}
                <span className="text-bone-500"> · </span>
                <span className="text-bone-500">{fmt(it.uniques)}u</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
