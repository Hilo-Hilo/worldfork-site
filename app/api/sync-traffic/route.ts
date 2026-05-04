import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import {
  EMPTY_TRAFFIC,
  TRAFFIC_TAG,
  type DayCount,
  type PathItem,
  type Referrer,
  type TrafficData,
  writeTrafficData,
  getTrafficData,
} from "@/lib/traffic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO = "Hilo-Hilo/WorldFork";

type GhTrafficResponse = {
  count: number;
  uniques: number;
  clones?: Array<{ timestamp: string; count: number; uniques: number }>;
  views?: Array<{ timestamp: string; count: number; uniques: number }>;
};

async function gh<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "worldfork-site-traffic-sync",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function runSync(): Promise<{
  ok: true;
  cloneDays: number;
  viewDays: number;
  newClones: number;
  newViews: number;
}> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");

  const [clones, views, referrers, paths] = await Promise.all([
    gh<GhTrafficResponse>(`/repos/${REPO}/traffic/clones`, token),
    gh<GhTrafficResponse>(`/repos/${REPO}/traffic/views`, token),
    gh<Referrer[]>(`/repos/${REPO}/traffic/popular/referrers`, token),
    gh<PathItem[]>(`/repos/${REPO}/traffic/popular/paths`, token),
  ]);

  const existing: TrafficData = await getTrafficData().catch(
    () => EMPTY_TRAFFIC,
  );

  const merged: TrafficData = {
    lastUpdated: new Date().toISOString(),
    repo: REPO,
    clones: { days: { ...existing.clones.days } },
    views: { days: { ...existing.views.days } },
    referrers: referrers || [],
    paths: paths || [],
  };

  let newClones = 0;
  let newViews = 0;

  for (const d of clones.clones || []) {
    const day = d.timestamp.slice(0, 10);
    const v: DayCount = { count: d.count, uniques: d.uniques };
    if (!merged.clones.days[day]) newClones += v.count;
    else if (merged.clones.days[day].count !== v.count)
      newClones += Math.max(0, v.count - merged.clones.days[day].count);
    merged.clones.days[day] = v;
  }

  for (const d of views.views || []) {
    const day = d.timestamp.slice(0, 10);
    const v: DayCount = { count: d.count, uniques: d.uniques };
    if (!merged.views.days[day]) newViews += v.count;
    else if (merged.views.days[day].count !== v.count)
      newViews += Math.max(0, v.count - merged.views.days[day].count);
    merged.views.days[day] = v;
  }

  await writeTrafficData(merged);
  revalidateTag(TRAFFIC_TAG, "max");

  return {
    ok: true,
    cloneDays: Object.keys(merged.clones.days).length,
    viewDays: Object.keys(merged.views.days).length,
    newClones,
    newViews,
  };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
