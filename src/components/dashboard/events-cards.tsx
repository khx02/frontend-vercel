import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EventsCards() {
  const events = [
    { id: 1, date: "02/08/2025", tasksCompleted: 8, totalTasks: 12, progress: 70 },
    { id: 2, date: "02/08/2025", tasksCompleted: 8, totalTasks: 12, progress: 70 },
    { id: 3, date: "02/08/2025", tasksCompleted: 8, totalTasks: 12, progress: 70 },
    { id: 4, date: "02/08/2025", tasksCompleted: 8, totalTasks: 12, progress: 70 },
  ];

  return (
    <Card className="p-6 from-primary/15 to-card bg-gradient-to-t shadow-lg border-primary/10">
      <CardHeader className="p-0">
        <CardTitle className="text-3xl font-semibold">Event Overview</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4
                      [&>*[data-slot=event-card]]:from-primary/10 
                      [&>*[data-slot=event-card]]:to-card 
                      [&>*[data-slot=event-card]]:bg-gradient-to-t
                      dark:[&>*[data-slot=event-card]]:bg-card  
                      [&>*[data-slot=event-card]]:shadow-md
                      [&>*[data-slot=event-card]]:border-primary/5">
        {events.map((event) => (
          <Card key={event.id} className="p-4 min-w-[240px]" data-slot="event-card">
            <CardHeader className="p-0 space-y-3">
              <div>
                <CardTitle className="text-base font-medium">Event {event.id}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {event.date}
                </CardDescription>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tasks done: {event.tasksCompleted}/{event.totalTasks}</span>
                  <span>{event.progress}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${event.progress}%` }}
                  />
                </div>
                
                {/* Status badges */}
                <div className="flex gap-1 pt-2">
                  <span className="px-2 py-1 text-xs bg-muted rounded">name1</span>
                  <span className="px-2 py-1 text-xs bg-muted rounded">name2</span>
                  <span className="px-2 py-1 text-xs bg-muted rounded">name3</span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Card>
  );
}
