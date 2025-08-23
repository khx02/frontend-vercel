import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StatsCards() {
  return (
    <div
      className="
      text-5xl
      flex gap-6 justify-start
      [&>*[data-slot=card]]:from-primary/15 
      [&>*[data-slot=card]]:to-card 
      [&>*[data-slot=card]]:bg-gradient-to-t
      dark:[&>*[data-slot=card]]:bg-card  
      [&>*[data-slot=card]]:shadow-lg
      [&>*[data-slot=card]]:min-w-[200px]
      [&>*[data-slot=card]]:border-primary/10"
    >
      <Card className="flex flex-col" data-slot="card">
        <CardHeader className="flex flex-col min-h-[40px] py-1">
          <CardDescription>Upcoming Events</CardDescription>
          <CardTitle className="mt-auto">api</CardTitle>
        </CardHeader>
      </Card>

      <Card className="flex flex-col" data-slot="card">
        <CardHeader className="flex flex-col min-h-[40px] py-1">
          <CardDescription>Completed Events</CardDescription>
          <CardTitle className="mt-auto">api</CardTitle>
        </CardHeader>
      </Card>

      <Card className="flex flex-col" data-slot="card">
        <CardHeader className="flex flex-col min-h-[40px] py-1">
          <CardDescription>Members</CardDescription>
          <CardTitle className="mt-auto">api</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
