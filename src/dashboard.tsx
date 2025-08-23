import { StatsCards } from "./components/dashboard/stats-cards";
import { EventsCards } from "./components/dashboard/events-cards";
import { TasksCards } from "./components/dashboard/tasks-cards";
import { AnnouncementCard } from "./components/dashboard/announcement-card";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-full">
        <h1 className="text-3xl font-bold text-left mb-8">Dashboard</h1>
          <div className="@container/main flex flex-1 gap-4 lg:gap-8 flex-col xl:flex-row">
            <div className="flex-1 min-w-0 space-y-6 lg:space-y-8 overflow-hidden">
              <StatsCards />
              <EventsCards />
              <AnnouncementCard />
            </div>
            <div className="w-full xl:w-72 2xl:w-80 flex-shrink-0">
              <TasksCards />
            </div>
        </div>
      </div>
    </div>
  );
}
