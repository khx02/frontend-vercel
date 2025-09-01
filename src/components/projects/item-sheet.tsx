import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon, HashIcon, Trash2Icon } from "lucide-react";
import type { KanbanItemProps } from "./index";
import type { Column } from "@/types/projects";
import { formatDateParts } from "@/utils/dateFormat";
import { ItemSheetAvatar } from "@/components/ui/user-avatar";
import { ItemSheetStatusBadge } from "@/utils/statusBadge";

type KanbanItemSheetProps = {
  item: KanbanItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (itemId: string) => void;
  columns?: Column[];
};

export function KanbanItemSheet({
  item,
  open,
  onOpenChange,
  onDelete,
  columns = [],
}: KanbanItemSheetProps) {
  const getColumnName = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-4">
        {item && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="border-b-2 p-6">
              <SheetTitle className="text-2xl font-semibold leading-tight">
                {item.name}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-2">
                <span className="text-base text-muted-foreground">Status:</span>
                <ItemSheetStatusBadge
                  status={getColumnName(item.column ?? "")}
                />
              </SheetDescription>
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 pt-6 space-y-6 p-4">
              {/* Owner Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-base font-medium text-foreground">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Owner</span>
                </div>
                <div className="pl-6">
                  <ItemSheetAvatar owner={item.owner} />
                </div>
              </div>

              {/* Date Range Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-base font-medium text-foreground">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Date Range</span>
                </div>
                <div className="pl-6">
                  {(() => {
                    const { startDate, endDate, isValid } = formatDateParts(
                      item.startAt,
                      item.endAt
                    );

                    return isValid ? (
                      <div className="space-y-1">
                        <div className="text-base">
                          <span className="font-medium">{startDate}</span>
                          <span className="text-muted-foreground mx-2">→</span>
                          <span className="font-medium">{endDate}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No dates set
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* ID Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <HashIcon className="h-4 w-4 text-muted-foreground" />
                  <span>ID</span>
                </div>
                <div className="pl-6">
                  <code className="px-2 py-1 text-xs bg-muted rounded font-mono">
                    {item.id}
                  </code>
                </div>
              </div>
            </div>

            {/* Delete Button - Full Width Bar at Bottom */}
            {onDelete && (
              <div className="border-t border-border p-4 mt-auto">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    onDelete(item.id);
                    onOpenChange(false);
                  }}
                  className="w-full"
                >
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
