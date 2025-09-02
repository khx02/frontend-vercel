import { Kanban } from "@/components/projects/kanban";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ListView } from "./components/projects/list-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function Projects() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(
    null
  );
  const [view, setView] = useState<"kanban" | "list">("kanban");

  // Function to load specific project data
  const loadProjectData = async (projectId: string) => {
    try {
      // Fetch project details and todo items in parallel
      const [projectResponse, todoItemsResponse] = await Promise.all([
        projectsApi.getProject(projectId),
        projectsApi.getTodoItems(projectId),
      ]);

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
      setError(
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
        setError(null);

        // Get current user teams to find project IDs
        const teamsResponse = await projectsApi.getCurrentUserTeams();
        if (!teamsResponse || !teamsResponse.teams) {
          throw new Error("Invalid response from teams API");
        }
        setTeams(teamsResponse.teams);

        if (teamsResponse.teams.length === 0) {
          throw new Error("No teams found for current user");
        }

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
        setError(
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
      await loadProjectData(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
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
    <div className="min-h-screen bg-background p-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading project data...</div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-600">Warning: {error}</div>
              <div className="text-xs text-red-500 mt-1">
                Using fallback data below
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              {availableProjects.length > 1 ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Project
                  </label>
                  <Select
                    value={selectedProjectId || ""}
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger className="w-80">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProjects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          <div>
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
                  {teams.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Team: {teams[0].name} • {availableProjects.length}{" "}
                      project(s)
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold">
                    {project?.name || "Projects"}
                  </h1>
                  {teams.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Team: {teams[0].name} • {availableProjects.length}{" "}
                      project(s)
                    </p>
                  )}
                </div>
              )}
            </div>
            <CreateTask
              project={project}
              statuses={columns.map((c) => ({ id: c.id, name: c.name }))}
              users={users}
              onCreated={() => loadProjectData(selectedProjectId || "")}
            />
          </div>

          <div className="mb-4 flex gap-2">
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              onClick={() => setView("kanban")}
            >
              Kanban View
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              onClick={() => setView("list")}
            >
              List View
            </Button>
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
