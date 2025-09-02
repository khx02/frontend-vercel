import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type KanbanItemProps,
} from "@/components/projects";
import type { Column, Feature, Project } from "@/types/projects";
import { formatDateRange } from "@/utils/dateFormat";
import { KanbanAvatar } from "@/components/ui/user-avatar";
import { useEffect, useRef } from "react";
import { projectsApi } from "@/api/projects";

interface KanbanProps {
  columns: Column[];
  features: Feature[];
  project: Project | null;
  onFeaturesChange: (features: Feature[]) => void;
  onSelect: React.Dispatch<React.SetStateAction<KanbanItemProps | null>>;
}

export function Kanban({
  columns,
  features,
  project,
  onFeaturesChange,
  onSelect,
}: KanbanProps) {
  const prevFeaturesRef = useRef<Feature[]>([]);

  // Track changes in features and detect column moves for backend sync
  useEffect(() => {
    // Skip first render and if there are no previous features
    if (prevFeaturesRef.current.length === 0) {
      prevFeaturesRef.current = features.map((f) => ({ ...f })); // Deep copy
      return;
    }

    // Find any feature that changed columns
    const movedFeature = features.find((newFeature) => {
      const oldFeature = prevFeaturesRef.current.find(
        (old) => old.id === newFeature.id
      );
      return oldFeature && oldFeature.column !== newFeature.column;
    });

    if (movedFeature && project) {
      // Update the todo item status in the backend
      projectsApi
        .updateTodo(project.id, {
          id: movedFeature.id,
          name: movedFeature.name,
          description: movedFeature.name, // Using name as description fallback
          status_id: movedFeature.column,
          owner_id: movedFeature.owner.id,
        })
        .catch((err) => {
          console.error("Failed to update todo status in backend:", err);
        });
    }

    // Update the ref with current features (deep copy to avoid reference issues)
    prevFeaturesRef.current = features.map((f) => ({ ...f }));
  }, [features, project]);

  const handleKanbanChange = (value: React.SetStateAction<Feature[]>) => {
    // Handle both direct values and function updates
    const newFeatures = typeof value === "function" ? value(features) : value;

    // Update the features through the parent callback
    onFeaturesChange(newFeatures);
  };

  return (
    <KanbanProvider
      columns={columns}
      data={features}
      onDataChange={handleKanbanChange}
    >
      {(column) => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span>{column.name}</span>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(feature: Feature) => (
              <KanbanCard
                column={column.id}
                id={feature.id}
                key={feature.id}
                name={feature.name}
                onClick={() => onSelect(feature)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="m-0 flex-1 font-medium text-sm">
                      {feature.name}
                    </p>
                  </div>
                  {feature.owner && <KanbanAvatar owner={feature.owner} />}
                </div>
                <p className="m-0 text-muted-foreground text-xs">
                  {formatDateRange(feature.startAt, feature.endAt)}
                </p>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}
