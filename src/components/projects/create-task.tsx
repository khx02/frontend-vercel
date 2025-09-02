import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { projectsApi } from "@/api/projects";

export function CreateTask({
  project,
  statuses,
  users,
  onCreated,
}: {
  project: { id: string } | null;
  statuses: { id: string; name: string }[];
  users: { id: string; name: string }[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState(statuses[0]?.id || "");
  const [ownerId, setOwnerId] = useState(users[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      await projectsApi.addTodo(project.id, {
        name,
        description,
        status_id: statusId,
        owner_id: ownerId,
      });
      setOpen(false);
      setName("");
      setDescription("");
      setStatusId(statuses[0]?.id || "");
      setOwnerId(users[0]?.id || "");
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Fill in the details for the new task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="task-name-1">Task Name</Label>
              <Input
                id="task-name-1"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Annual Budget Presentation"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-description-1">Task Description</Label>
              <Input
                id="task-description-1"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Prepare the budget slides for the annual meeting."
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-status-1">Task Status</Label>
              <Select
                value={statusId}
                onValueChange={setStatusId}
                name="task-status"
              >
                <SelectTrigger id="task-status-1">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="assignee-1">Assign to</Label>
              <Select
                value={ownerId}
                onValueChange={setOwnerId}
                name="assignee"
              >
                <SelectTrigger id="assignee-1">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-red-500 text-xs">{error}</div>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
