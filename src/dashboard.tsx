import { StatsCards } from "./components/dashboard/stats-cards";
import { EventsCards } from "./components/dashboard/events-cards";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div>
        <h1 className="text-3xl font-bold text-left mb-8">Dashboard</h1>
          <div className="@container/main flex flex-1 flex-col gap-8">
              <StatsCards />
              <EventsCards />
        </div>
      </div>
    </div>
  );
}
