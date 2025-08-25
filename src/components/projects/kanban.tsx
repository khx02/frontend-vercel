import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type KanbanItemProps,
} from "@/components/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import type { Column, Feature } from "@/types/projects";

interface KanbanProps {
  columns: Column[];
  features: Feature[];
  setFeatures: React.Dispatch<React.SetStateAction<Feature[]>>;
  dateFormatter: Intl.DateTimeFormat;
  shortDateFormatter: Intl.DateTimeFormat;
  onSelect: React.Dispatch<React.SetStateAction<KanbanItemProps | null>>;
}

export function Kanban({
  columns,
  features,
  setFeatures,
  dateFormatter,
  shortDateFormatter,
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
                  {feature.owner && (
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarImage src={feature.owner.image} />
                      <AvatarFallback>
                        {feature.owner.name?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <p className="m-0 text-muted-foreground text-xs">
                  {shortDateFormatter.format(feature.startAt)} -{" "}
                  {dateFormatter.format(feature.endAt)}
                </p>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}
