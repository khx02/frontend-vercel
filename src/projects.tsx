import { Kanban } from "@/components/projects/kanban";
import { useState, useEffect } from "react";
import { ListView } from "./components/projects/list-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  Column,
  UserDetails,
  Feature,
  Project,
  ToDoItem,
  TodoStatus,
} from "@/types/projects";
import { CreateTask } from "./components/projects/create-task";
import { KanbanItemSheet } from "@/components/projects/item-sheet";
import type { KanbanItemProps } from "@/components/projects";
import { projectsApi } from "@/api/projects";
import { ProgressLoading } from "@/components/ProgressLoading";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "./lib/store";
import { fetchTeams } from "./features/teams/teamSlice";
import { authApi } from "@/api/auth";

export default function Projects() {
  const { teams, isFetchingTeams, selectedTeam } = useSelector(
    (state: RootState) => state.teams
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(
    null
  );
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const loadingStages = [
    "Fetching user teams...",
    "Loading available projects...",
    "Setting up project data...",
    "Loading project details...",
    "Fetching todo items...",
    "Preparing workspace...",
  ];

  const DUMMY_USER: UserDetails = {
    id: "no-user-found",
    first_name: "No",
    last_name: "User",
    email: "",
  };

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchTeams());
  }, []); // run on mount to prevent redux team stale data

  useEffect(() => {
    (async () => {
      if (!teams.length) return;

      try {
        const teamMembers = teams.flatMap((team) => team.member_ids);
        const uniqueMemberIds = [...new Set(teamMembers)];

        const userPromises = uniqueMemberIds.map((id) =>
          authApi.getUserById(id)
        );
        const userResponses = await Promise.all(userPromises);

        const validUsers = userResponses.map((u) => u.user);

        setUsers(validUsers);
      } catch (err) {
        console.log("Failed to fetch users:", err);
      }
    })();
  }, [project, teams]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setLoadingStage(1);

        if (teams.length === 0) {
          throw new Error("No teams found for current user");
        }

        if (selectedTeam == null) {
          throw new Error("No team selected");
        }

        setLoadingStage(2);
        const projectPromises = selectedTeam.project_ids.map(
          async (projectId) => {
            return await projectsApi.getProject(projectId);
          }
        );

        const projectResponses = await Promise.all(projectPromises);
        const validProjects = projectResponses
          .filter((response) => response && response.project)
          .map((response) => response!.project);
        setAvailableProjects(validProjects);

        if (validProjects.length <= 0) {
          throw new Error("No valid projects could be loaded");
        }
        const firstProjectId = validProjects[0].id;
        setSelectedProjectId(firstProjectId);
        await loadProjectData(firstProjectId);
      } catch (err) {
        console.log(
          err instanceof Error ? err.message : "Failed to fetch project data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!isFetchingTeams && teams.length > 0) {
      fetchProjects();
    }
  }, [isFetchingTeams, teams, selectedTeam]);

  useEffect(() => {
    if (selectedTeam && selectedTeam.project_ids.length === 0) {
      setIsCreateDialogOpen(true);
    }
  }, [selectedTeam]);

  const loadProjectData = async (projectId: string) => {
    try {
      setLoadingStage(3);

      const [projectResponse, todoItemsResponse] = await Promise.all([
        projectsApi.getProject(projectId),
        (async () => {
          setLoadingStage(4);
          return await projectsApi.getTodoItems(projectId);
        })(),
      ]);

      setLoadingStage(5);

      if (projectResponse.project) {
        setProject(projectResponse.project);

        // todo : make status columns customisable
        const statusColumns: Column[] =
          projectResponse.project.todo_statuses.map(
            (status: TodoStatus, index: number) => ({
              id: status.id,
              name: status.name,
              color: ["#6B7280", "#F59E0B", "#10B981"][index % 3],
            })
          );

        setColumns(
          statusColumns.length > 0
            ? statusColumns
            : [
                { id: "1", name: "To Do", color: "#6B7280" },
                { id: "2", name: "In Progress", color: "#F59E0B" },
                { id: "3", name: "Done", color: "#10B981" },
              ]
        );
      }

      if (todoItemsResponse.todos) {
        const convertedFeatures: Feature[] = todoItemsResponse.todos.map(
          (item: ToDoItem) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            startAt: new Date(),
            endAt: new Date(),
            column: item.status_id,
            owner: users.find((u) => u.id === item.assignee_id) || DUMMY_USER,
          })
        );
        setFeatures(convertedFeatures);
      }
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to load project data"
      );
      throw err;
    }
  };

  // Handle project selection change
  const handleProjectChange = async (projectId: string) => {
    try {
      setSelectedProjectId(projectId);
      setLoading(true);
      setLoadingStage(3); // Loading project details
      await loadProjectData(projectId);
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new project
  const handleCreateProject = async () => {
    if (!selectedTeam && teams.length === 0) {
      console.log("No team available to create project");
      return;
    }

    if (!newProjectName.trim()) {
      return;
    }

    try {
      setLoading(true);
      setLoadingStage(1); // Creating project

      const teamId = selectedTeam?.id || "";
      const response = await projectsApi.createProject(
        teamId,
        newProjectName.trim(),
        newProjectDescription.trim()
      );

      if (response.project) {
        setAvailableProjects([...availableProjects, response.project]);
        setSelectedProjectId(response.project.id);
        await loadProjectData(response.project.id);
        setNewProjectName("");
        setNewProjectDescription("");
        setIsCreateDialogOpen(false);
      }
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!project) return;

    try {
      // Call backend API to delete the todo item
      await projectsApi.deleteTodo(project.id, itemId);

      // Update UI state after successful backend deletion
      setFeatures((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== itemId)
      );
      setSelectedItem(null);
    } catch (err) {
      console.log(err instanceof Error ? err.message : "Failed to delete item");
      // Optionally show an error message to the user
    }
  };

  const handleUpdateItem = (
    itemId: string,
    updates: Partial<KanbanItemProps>
  ) => {
    const currentFeature = features.find((f) => f.id === itemId);
    if (!currentFeature) return;

    // Update frontend state
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === itemId ? { ...feature, ...updates } : feature
      )
    );
    // Update selectedItem if it's the one being edited
    if (selectedItem?.id === itemId) {
      setSelectedItem({ ...selectedItem, ...updates });
    }

    // Update backend
    if (project) {
      const apiData = {
        id: itemId,
        name: updates.name ?? currentFeature.name,
        description: updates.description ?? currentFeature.description,
        status_id: updates.column ?? currentFeature.column,
        assignee_id: (updates as any).owner?.id ?? currentFeature.owner.id,
      };
      projectsApi.updateTodo(project.id, apiData).catch((err) => {
        console.error("Failed to update todo:", err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 py-2">
      {loading ? (
        <ProgressLoading stages={loadingStages} currentStage={loadingStage} />
      ) : (
        <>
          <div className="flex items-start justify-between mb-4 py-2">
            <div className="flex-1">
              <div className="space-y-2">
                <div className="text-lg font-medium mb-2">Project</div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Team: {selectedTeam?.name} • {availableProjects.length}{" "}
                    project(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProjectId || ""}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger className="flex-initial py-6">
                      <SelectValue placeholder="Create a Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          <div className="grid grid-rows-2">
                            <div className="font-medium">{proj.name}</div>
                            {proj.description && (
                              <div className="text-left text-xs text-muted-foreground">
                                {proj.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="py-5 px-4">
                        +
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 items-center gap-4">
                          <Label htmlFor="project-name" className="text-right">
                            Project Name:
                          </Label>
                          <Input
                            id="project-name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter project name"
                          />
                        </div>
                        <div className="grid grid-cols-1 items-center gap-4">
                          <Label
                            htmlFor="project-description"
                            className="text-right"
                          >
                            Project Description:
                          </Label>
                          <Input
                            id="project-description"
                            value={newProjectDescription}
                            onChange={(e) =>
                              setNewProjectDescription(e.target.value)
                            }
                            className="col-span-3"
                            placeholder="Enter project description"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewProjectName("");
                            setNewProjectDescription("");
                            setIsCreateDialogOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateProject}
                          disabled={
                            !newProjectName.trim() ||
                            !newProjectDescription.trim()
                          }
                        >
                          Create Project
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <CreateTask
                project={project}
                statuses={columns.map((c) => ({ id: c.id, name: c.name }))}
                users={users}
                onCreated={() => loadProjectData(selectedProjectId || "")}
              />
              <div className="flex items-center space-x-2 mt-4">
                <Label htmlFor="view-switch" className="text-sm font-medium">
                  Kanban
                </Label>
                <Switch
                  id="view-switch"
                  checked={view === "list"}
                  onCheckedChange={(checked) =>
                    setView(checked ? "list" : "kanban")
                  }
                />
                <Label htmlFor="view-switch" className="text-sm font-medium">
                  List
                </Label>
              </div>
            </div>
          </div>

          {view === "kanban" ? (
            <Kanban
              columns={columns}
              features={features}
              project={project}
              onFeaturesChange={setFeatures}
              onSelect={setSelectedItem}
            />
          ) : (
            <ListView
              items={features}
              columns={columns}
              onSelect={setSelectedItem}
            />
          )}

          <KanbanItemSheet
            item={selectedItem}
            open={!!selectedItem}
            onOpenChange={(open) => !open && setSelectedItem(null)}
            onDelete={handleDeleteItem}
            onUpdate={handleUpdateItem}
            columns={columns}
            users={users}
          />
        </>
      )}
    </div>
  );
}
