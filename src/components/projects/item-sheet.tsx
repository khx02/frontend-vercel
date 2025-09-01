import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, HashIcon } from "lucide-react";
import type { KanbanItemProps } from "./index";
import type { Column } from "@/types/projects";
import { formatDateParts } from "@/utils/dateFormat";

type KanbanItemSheetProps = {
  item: KanbanItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns?: Column[];
};

export function KanbanItemSheet({
  item,
  open,
  onOpenChange,
  columns = [],
}: KanbanItemSheetProps) {
  const getColumnName = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "planned":
      case "todo":
      case "backlog":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in progress":
      case "doing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "done":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
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
                <Badge
                  className={`${getStatusColor(
                    getColumnName(item.column ?? "")
                  )} text-lg`}
                >
                  {getColumnName(item.column ?? "") || "No Status"}
                </Badge>
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
                  {item.owner &&
                  typeof item.owner === "object" &&
                  "name" in item.owner ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            (item.owner as { image?: string }).image ??
                            undefined
                          }
                        />
                        <AvatarFallback className="text-xs">
                          {((item.owner as { name?: string }).name ?? "").slice(
                            0,
                            2
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {(item.owner as { name?: string }).name ?? ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No owner assigned
                    </span>
                  )}
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
