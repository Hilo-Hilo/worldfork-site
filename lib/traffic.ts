import { put, get } from "@vercel/blob";
import { unstable_cache } from "next/cache";

export const TRAFFIC_BLOB_KEY = "traffic.json";
export const TRAFFIC_TAG = "traffic";

export type DayCount = { count: number; uniques: number };

export type Referrer = { referrer: string; count: number; uniques: number };
export type PathItem = {
  path: string;
  title: string;
  count: number;
  uniques: number;
};

export type TrafficData = {
  lastUpdated: string;
  repo: string;
  clones: { days: Record<string, DayCount> };
  views: { days: Record<string, DayCount> };
  referrers: Referrer[];
  paths: PathItem[];
};

export const EMPTY_TRAFFIC: TrafficData = {
  lastUpdated: "",
  repo: "Hilo-Hilo/WorldFork",
  clones: { days: {} },
  views: { days: {} },
  referrers: [],
  paths: [],
};

async function fetchBlobJson(): Promise<TrafficData> {
  try {
    const result = await get(TRAFFIC_BLOB_KEY, { access: "private" });
    if (!result || result.statusCode !== 200) return EMPTY_TRAFFIC;
    const text = await new Response(result.stream).text();
    const json = JSON.parse(text) as TrafficData;
    return { ...EMPTY_TRAFFIC, ...json };
  } catch {
    return EMPTY_TRAFFIC;
  }
}

export const getTrafficData = unstable_cache(
  fetchBlobJson,
  ["traffic-data"],
  { tags: [TRAFFIC_TAG], revalidate: 3600 },
);

export async function writeTrafficData(data: TrafficData) {
  await put(TRAFFIC_BLOB_KEY, JSON.stringify(data), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export type TrafficSummary = {
  cloneTotal: number;
  cloneUniqueTotal: number;
  viewTotal: number;
  viewUniqueTotal: number;
  cloneLast14: number;
  viewLast14: number;
  daysTracked: number;
  lastUpdated: string;
  topReferrers: Referrer[];
  topPaths: PathItem[];
  hasData: boolean;
};

export function summarize(data: TrafficData): TrafficSummary {
  const cloneDays = Object.values(data.clones.days);
  const viewDays = Object.values(data.views.days);
  const sum = (arr: DayCount[], k: keyof DayCount) =>
    arr.reduce((a, d) => a + (d[k] || 0), 0);

  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recent = (days: Record<string, DayCount>) =>
    Object.entries(days)
      .filter(([d]) => Date.parse(d) >= cutoff)
      .map(([, v]) => v);

  return {
    cloneTotal: sum(cloneDays, "count"),
    cloneUniqueTotal: sum(cloneDays, "uniques"),
    viewTotal: sum(viewDays, "count"),
    viewUniqueTotal: sum(viewDays, "uniques"),
    cloneLast14: sum(recent(data.clones.days), "count"),
    viewLast14: sum(recent(data.views.days), "count"),
    daysTracked: cloneDays.length,
    lastUpdated: data.lastUpdated,
    topReferrers: data.referrers.slice(0, 5),
    topPaths: data.paths.slice(0, 5),
    hasData: cloneDays.length > 0 || viewDays.length > 0,
  };
}
