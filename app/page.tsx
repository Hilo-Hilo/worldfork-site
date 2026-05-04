import Landing from "./_components/landing";
import TrafficStats from "./_components/traffic-stats";

export default function Page() {
  return <Landing trafficStats={<TrafficStats />} />;
}
