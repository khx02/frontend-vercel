import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TasksCards() {
  const tasks = [
    {
      id: 1,
      title: "Edit profile",
      description: "Make changes to your profile here. Click save when you're done.",
      priority: "High",
      dueDate: "D-12",
      assignees: ["Ch", "Ci", "CN"]
    },
    {
      id: 2,
      title: "Edit profile",
      description: "Make changes to your profile here. Click save when you're done.",
      priority: "High",
      dueDate: "D-12",
      assignees: ["Ch", "Ci", "CN"]
    },
    {
      id: 3,
      title: "Review documentation",
      description: "Review and update project documentation for the new features.",
      priority: "Medium",
      dueDate: "D-5",
      assignees: ["Ch", "CN"]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold">Tasks</h2>
      <div className="space-y-3
                      [&>*[data-slot=task-card]]:from-primary/15 
                      [&>*[data-slot=task-card]]:to-card 
                      [&>*[data-slot=task-card]]:bg-gradient-to-t
                      dark:[&>*[data-slot=task-card]]:bg-card  
                      [&>*[data-slot=task-card]]:shadow-lg
                      [&>*[data-slot=task-card]]:border-primary/10">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4" data-slot="task-card">
            <CardHeader className="p-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-md border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-muted-foreground">{task.dueDate}</span>
                  </div>
                  <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </CardDescription>
                </div>
              </div>
              
              {/* Assignees */}
              <div className="flex gap-1 pt-2">
                {task.assignees.map((assignee, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-muted rounded">
                    {assignee}
                  </span>
                ))}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}