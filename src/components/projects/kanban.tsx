import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type KanbanItemProps,
} from "@/components/projects";
import type { Column, Feature } from "@/types/projects";
import { formatDateRange } from "@/utils/dateFormat";
import { KanbanAvatar } from "@/components/ui/user-avatar";

interface KanbanProps {
  columns: Column[];
  features: Feature[];
  setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
  onSelect: React.Dispatch<React.SetStateAction<KanbanItemProps | null>>;
}

export function Kanban({
  columns,
  features,
  setFeatures,
  onSelect,
}: KanbanProps) {
  return (
    <KanbanProvider
      columns={columns}
      data={features}
      onDataChange={setFeatures}
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
