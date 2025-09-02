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
  User,
  Feature,
  Project,
  ToDoItem,
  Team,
} from "@/types/projects";
import { CreateTask } from "./components/projects/create-task";
import { KanbanItemSheet } from "@/components/projects/item-sheet";
import type { KanbanItemProps } from "@/components/projects";
import { projectsApi } from "@/api/projects";
import { ProgressLoading } from "@/components/ProgressLoading";

export default function Projects() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const loadingStages = [
    "Fetching user teams...",
    "Loading available projects...",
    "Setting up project data...",
    "Loading project details...",
    "Fetching todo items...",
    "Preparing workspace...",
  ];
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(
    null
  );
  const [view, setView] = useState<"kanban" | "list">("kanban");

  // Function to load specific project data
  const loadProjectData = async (projectId: string) => {
    try {
      setLoadingStage(3); // Loading project details

      // Fetch project details and todo items in parallel
      const [projectResponse, todoItemsResponse] = await Promise.all([
        projectsApi.getProject(projectId),
        (async () => {
          setLoadingStage(4); // Fetching todo items
          return await projectsApi.getTodoItems(projectId);
        })(),
      ]);

      setLoadingStage(5); // Preparing workspace

      if (projectResponse.project) {
        setProject(projectResponse.project);

        // Use todo_statuses array to create columns
        const statusColumns: Column[] =
          projectResponse.project.todo_statuses.map((status, index) => ({
            id: status.id,
            name: status.name,
            color: ["#6B7280", "#F59E0B", "#10B981"][index % 3],
          }));

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
        // Convert ToDoItems to Features format
        const convertedFeatures: Feature[] = todoItemsResponse.todos.map(
          (item: ToDoItem) => ({
            id: item.id,
            name: item.name,
            startAt: new Date(),
            endAt: new Date(),
            column: item.status_id,
            owner: {
              id: item.owner_id,
              name: item.owner_id,
              image: "",
            },
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
  // Fetch users whenever project or teams change
  useEffect(() => {
    const fetchUsers = async () => {
      let teamId = null;
      if (project && teams.length > 0) {
        const owningTeam = teams.find((team) =>
          team.project_ids.includes(project.id)
        );
        teamId = owningTeam?.id || teams[0].id;
      } else if (teams.length > 0) {
        teamId = teams[0].id;
      }
      let realUsers: User[] = [];
      if (teamId) {
        try {
          const teamResponse = await projectsApi.getTeam(teamId);
          realUsers = teamResponse.team.member_ids.map((id) => ({
            id,
            name: id,
            image: "",
          }));
        } catch (err) {
          // silently fail
        }
      }
      setUsers(realUsers);
    };
    fetchUsers();
  }, [project, teams]);

  useEffect(() => {
    const fetchTeamsAndProjects = async () => {
      try {
        setLoading(true);
        setLoadingStage(0); // Fetching user teams

        // Get current user teams to find project IDs
        const teamsResponse = await projectsApi.getCurrentUserTeams();
        if (!teamsResponse || !teamsResponse.teams) {
          throw new Error("Invalid response from teams API");
        }
        setTeams(teamsResponse.teams);

        setLoadingStage(1); // Loading available projects

        if (teamsResponse.teams.length === 0) {
          throw new Error("No teams found for current user");
        }

        setLoadingStage(2); // Setting up project data

        // Collect all project IDs from all teams
        const allProjectIds = teamsResponse.teams.flatMap(
          (team) => team.project_ids
        );
        if (allProjectIds.length === 0) {
          throw new Error("No projects found in user teams");
        }

        // Fetch all projects to populate the selector
        const projectPromises = allProjectIds.map(async (projectId) => {
          try {
            const response = await projectsApi.getProject(projectId);
            return response;
          } catch (err) {
            return null;
          }
        });

        const projectResponses = await Promise.all(projectPromises);
        const validProjects = projectResponses
          .filter((response) => response && response.project)
          .map((response) => response!.project);
        setAvailableProjects(validProjects);

        // Auto-select the first available project
        if (validProjects.length > 0) {
          const firstProjectId = validProjects[0].id;
          setSelectedProjectId(firstProjectId);
          await loadProjectData(firstProjectId);
        } else {
          throw new Error("No valid projects could be loaded");
        }
      } catch (err) {
        console.log(
          err instanceof Error ? err.message : "Failed to fetch project data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsAndProjects();
  }, []);

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
    if (teams.length === 0) {
      console.log("No team available to create project");
      return;
    }

    if (!newProjectName.trim()) {
      return;
    }

    try {
      setLoading(true);
      setLoadingStage(1); // Creating project

      const teamId = teams[0].id; // Use the first team
      const response = await projectsApi.createProject(
        teamId,
        newProjectName.trim(),
        newProjectDescription.trim() || undefined
      );

      if (response.project) {
        // Refresh the available projects list
        const updatedTeamsResponse = await projectsApi.getCurrentUserTeams();
        if (updatedTeamsResponse.teams.length > 0) {
          const allProjectIds = updatedTeamsResponse.teams.flatMap(
            (team) => team.project_ids
          );

          const projectPromises = allProjectIds.map(async (projectId) => {
            try {
              const response = await projectsApi.getProject(projectId);
              return response;
            } catch (err) {
              return null;
            }
          });

          const projectResponses = await Promise.all(projectPromises);
          const validProjects = projectResponses
            .filter((response) => response && response.project)
            .map((response) => response!.project);

          setAvailableProjects(validProjects);

          // Auto-select the newly created project
          setSelectedProjectId(response.project.id);
          await loadProjectData(response.project.id);
        }

        // Reset form and close dialog
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

  const handleDeleteItem = (itemId: string) => {
    setFeatures((prevFeatures) =>
      prevFeatures.filter((feature) => feature.id !== itemId)
    );
    setSelectedItem(null);
  };

  const handleUpdateItem = (
    itemId: string,
    updates: Partial<KanbanItemProps>
  ) => {
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === itemId ? { ...feature, ...updates } : feature
      )
    );
    // Update selectedItem if it's the one being edited
    if (selectedItem?.id === itemId) {
      setSelectedItem({ ...selectedItem, ...updates });
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
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Select Project
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProjectId || ""}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger className="flex-initial px-2 space-x-2">
                      <SelectValue placeholder="Create a Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{proj.name}</div>
                            {proj.description && (
                              <div className="text-xs text-muted-foreground">
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
                      <Button size="sm" variant="outline" className="px-3">
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
                            placeholder="Enter project description (optional)"
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
                          disabled={!newProjectName.trim()}
                        >
                          Create Project
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {teams.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Team: {teams[0].name} • {availableProjects.length}{" "}
                    project(s)
                  </p>
                )}
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
