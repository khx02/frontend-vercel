import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AnnouncementCard() {
  const announcements = [
    {
      id: 1,
      author: "John Doe",
      role: "President",
      initials: "CN",
      title: "Consectetur adipiscing elit.",
      content: "Cras interdum ornare lorem, vitae imperdiet ante malesuada quis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent viverra vitae justo id interdum. Suspendisse sit amet nulla suscipit, tempus orci nec, commodo enim. Phasellus porta eleifend condimentum. Vivamus eget enim nec tellus faucibus pulvinar. Donec ullamcorper, metus ac interdum commodo, risus leo placerat orci, vitae mattis velit velit sed est.",
      timestamp: "2 hours ago"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Announcements</h2>
      <div className="space-y-4
                      [&>*[data-slot=announcement-card]]:from-primary/15 
                      [&>*[data-slot=announcement-card]]:to-card 
                      [&>*[data-slot=announcement-card]]:bg-gradient-to-t
                      dark:[&>*[data-slot=announcement-card]]:bg-card  
                      [&>*[data-slot=announcement-card]]:shadow-lg
                      [&>*[data-slot=announcement-card]]:border-primary/10">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="p-6" data-slot="announcement-card">
            <CardHeader className="p-0 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                  {announcement.initials}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{announcement.author}</span>
                    <span className="text-xs text-muted-foreground">{announcement.role}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{announcement.timestamp}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <CardTitle className="text-base font-medium">
                  {announcement.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {announcement.content}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}