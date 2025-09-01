import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { KanbanItemProps } from "@/components/projects/index";
import type { Column } from "@/types/projects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { formatDateRange } from "@/utils/dateFormat";

type ListViewProps = {
  items: KanbanItemProps[];
  className?: string;
  columns?: Column[];
  onSelect: React.Dispatch<React.SetStateAction<KanbanItemProps | null>>;
};

export function ListView({
  items,
  className,
  columns = [],
  onSelect,
}: ListViewProps) {
  const getColumnName = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };
  return (
    <ScrollArea className={cn("overflow-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Date Range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: KanbanItemProps) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelect(item)}
            >
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{getColumnName(item.column ?? "") || "—"}</TableCell>
              <TableCell>
                {item.owner &&
                typeof item.owner === "object" &&
                "name" in item.owner &&
                "image" in item.owner ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          (item.owner as { image?: string }).image ?? undefined
                        }
                      />
                      <AvatarFallback>
                        {((item.owner as { name?: string }).name ?? "").slice(
                          0,
                          2
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span>{(item.owner as { name?: string }).name ?? ""}</span>
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {formatDateRange(item.startAt, item.endAt)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
