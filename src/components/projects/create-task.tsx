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

export function CreateTask() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>Create Task</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
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
                placeholder="Annual Budget Presentation"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-description-1">Task Description</Label>
              <Input
                id="task-description-1"
                name="task-description"
                placeholder="Prepare the budget slides for the annual meeting."
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-status-1">Task Status</Label>
              <Select name="task-status" defaultValue="1">
                <SelectTrigger id="task-status-1">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Planned</SelectItem>
                  <SelectItem value="2">In Progress</SelectItem>
                  <SelectItem value="3">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="assignee-1">Assign to</Label>
              <Input id="assignee-1" name="assignee" placeholder="John Doe" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create task</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
