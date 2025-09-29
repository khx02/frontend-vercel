import { Kanban } from "@/components/projects/kanban";
import { useState } from "react";
import { ListView } from "./components/projects/list-view";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateTask } from "./components/projects/create-task";
import { KanbanItemSheet } from "@/components/projects/item-sheet";
import type { KanbanItemProps } from "@/components/projects";
import { ProgressLoading } from "@/components/ProgressLoading";
import SelectProject from "@/components/projects/select-project";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "./lib/store";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useProjectData } from "./hooks/useProjectData";
import { Trash2Icon } from "lucide-react";
import CreateProject from "./components/projects/create-project";

export default function Projects() {
  const { teams, isFetchingTeams, selectedTeam } = useSelector(
    (state: RootState) => state.teams
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const dispatch = useDispatch<AppDispatch>();
  const { confirm, DialogEl: ConfirmDialog } = useConfirm();

  const {
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
  } = useProjectData({ dispatch, teams, isFetchingTeams, selectedTeam });

  const handleProjectChange = async (projectId: string) => {
    try {
      setSelectedProjectId(projectId);
      await loadProjectData(projectId);
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to load project"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 py-2">
      {ConfirmDialog}
      {loading ? (
        <ProgressLoading stages={loadingStages} currentStage={loadingStage} />
      ) : (
        <>
          <div className="flex items-start justify-between py-1 mb-4">
            <div className="flex-1">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Team: {selectedTeam?.name} • {availableProjects.length}{" "}
                    project(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SelectProject
                    availableProjects={availableProjects}
                    selectedProjectId={selectedProjectId}
                    handleProjectChange={handleProjectChange}
                  />
                  <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="py-6 px-4.5 border-green-400 text-green-600 hover:bg-green-50 text-xl font-bold"
                      >
                        +
                      </Button>
                    </DialogTrigger>
                    <CreateProject
                      onClose={() => setIsCreateDialogOpen(false)}
                      handleCreateProject={handleCreateProject}
                    />
                  </Dialog>
                  <Button
                    size="icon"
                    variant="outline"
                    className="py-6 px-6 border-red-400 text-red-500 hover:bg-red-50"
                    title="Delete project"
                    disabled={!selectedProjectId}
                    onClick={() =>
                      confirm({
                        title: "Delete project?",
                        description:
                          "This will permanently delete the project and its tasks. This action cannot be undone.",
                        onConfirm: handleDeleteProject,
                      })
                    }
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
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
