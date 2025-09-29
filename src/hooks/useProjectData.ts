import { useState, useEffect, useRef } from "react";
import type {
  Column,
  UserDetails,
  Feature,
  Project,
  ToDoItem,
  TodoStatus,
} from "@/types/projects";
import { projectsApi } from "@/api/projects";
import { authApi } from "@/api/auth";
import { toast } from "sonner";
import { fetchTeams } from "@/features/teams/teamSlice";
import type { AppDispatch } from "@/lib/store";

type UseProjectDataParams = {
  dispatch: AppDispatch;
  teams: any[];
  isFetchingTeams: boolean;
  selectedTeam: any | null | undefined;
};

export function useProjectData({
  dispatch,
  teams,
  isFetchingTeams,
  selectedTeam,
}: UseProjectDataParams) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  const hasFetchedTeamsRef = useRef(false);

  // run on mount to prevent redux team stale data
  useEffect(() => {
    if (hasFetchedTeamsRef.current) return;
    hasFetchedTeamsRef.current = true;
    try {
      dispatch(fetchTeams());
    } catch (err) {
      console.error("Failed to dispatch fetchTeams:", err);
    }
  }, [dispatch]);

  // Load users whenever teams or project change
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
  }, [teams, project]);

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
            owner: users.find((u) => u.id === item.assignee_id) || {
              id: "no-user-found",
              first_name: "No",
              last_name: "User",
              email: "",
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setLoadingStage(1);

        if (teams.length === 0) {
          toast.error("Create a new team", { id: "no-team" });
          throw new Error("No teams found for current user");
        }

        if (selectedTeam == null) {
          throw new Error("No team selected");
        }

        if (selectedTeam.project_ids.length === 0) {
          toast.warning("No project found. Please create a new project", {
            id: "no-projects",
          });

          setAvailableProjects([]);
          return;
        }

        setLoadingStage(2);
        const projectPromises = selectedTeam.project_ids.map(
          async (projectId: string) => {
            return await projectsApi.getProject(projectId);
          }
        );

        const results = await Promise.allSettled(
          projectPromises as Promise<any>[]
        );
        const validProjects = results
          .filter((r) => r.status === "fulfilled" && r.value && r.value.project)
          .map((r: any) => r.value.project);

        setAvailableProjects(validProjects);

        if (validProjects.length <= 0) {
          toast.error("No valid projects could be loaded.", {
            id: "no-projects",
          });
          throw new Error("No valid projects could be loaded");
        }

        const nextId =
          (selectedProjectId &&
            validProjects.some((p: any) => p.id === selectedProjectId) &&
            selectedProjectId) ||
          validProjects[0].id;

        setSelectedProjectId(nextId);
        await loadProjectData(nextId);
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

  const handleCreateProject = async (
    name: string,
    description: string
  ): Promise<boolean> => {
    if (!selectedTeam && teams.length === 0) {
      console.log("No team available to create project");
      return false;
    }

    if (!name.trim()) {
      return false;
    }

    try {
      setLoading(true);
      setLoadingStage(1); // Creating project

      const teamId = selectedTeam?.id || "";
      const response = await projectsApi.createProject(
        teamId,
        name.trim(),
        description.trim()
      );

      if (response.project) {
        setAvailableProjects((prev) => [...prev, response.project]);
        setSelectedProjectId(response.project.id);

        // Load project data in background; resolve true immediately so callers can close dialogs
        loadProjectData(response.project.id).catch((e) => {
          console.error("Failed to load project after create:", e);
        });

        try {
          await dispatch(fetchTeams()).unwrap();
        } catch (e) {
          console.log("Failed to refresh teams", e);
        }

        toast.success("New Project Created", { id: "new-project" });
        return true;
      }
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleDeleteProject = async () => {
    if (!selectedTeam || !selectedProjectId) return;
    try {
      setLoading(true);
      await projectsApi.deleteProject(selectedTeam.id, selectedProjectId);

      // Remove from local list
      setAvailableProjects((prev) =>
        prev.filter((p) => p.id !== selectedProjectId)
      );

      // Choose next project if any
      const remaining = availableProjects.filter(
        (p) => p.id !== selectedProjectId
      );
      const next = remaining[0]?.id || "";
      setSelectedProjectId(next);
      if (next) {
        await loadProjectData(next);
      } else {
        // Clear project-related state when none left
        setProject(null);
        setFeatures([]);
        setColumns([]);
      }

      // Refresh teams so project_ids updates
      try {
        await dispatch(fetchTeams()).unwrap();
      } catch (e) {
        console.log("Failed to refresh teams after delete", e);
      }

      toast.success("Project deleted", { id: "project-deleted" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project", { id: "project-delete-failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!project) return;

    try {
      await projectsApi.deleteTodo(project.id, itemId);

      setFeatures((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== itemId)
      );
      toast.error("Task Deleted", { id: "delete-todo" });
    } catch (err) {
      console.log(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleUpdateItem = (itemId: string, updates: Partial<Feature>) => {
    const currentFeature = features.find((f) => f.id === itemId);
    if (!currentFeature) return;

    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === itemId ? { ...feature, ...updates } : feature
      )
    );

    if (project) {
      const apiData = {
        id: itemId,
        name: (updates as any).name ?? currentFeature.name,
        description: (updates as any).description ?? currentFeature.description,
        status_id: (updates as any).column ?? currentFeature.column,
        assignee_id: (updates as any).owner?.id ?? currentFeature.owner.id,
      };
      projectsApi.updateTodo(project.id, apiData).catch((err) => {
        toast(err, { id: "update-todo-failed" });
        console.error("Failed to update todo:", err);
      });
    }
  };

  return {
    loading,
    loadingStage,
    availableProjects,
    selectedProjectId,
    setSelectedProjectId,
    project,
    features,
    setFeatures,
    columns,
    users,
    loadProjectData,
    handleCreateProject,
    handleDeleteProject,
    handleDeleteItem,
    handleUpdateItem,
  } as const;
}
