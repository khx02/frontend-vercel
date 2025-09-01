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
import { formatDateRange } from "@/utils/dateFormat";
import { ListViewAvatar } from "@/components/ui/user-avatar";

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
                <ListViewAvatar owner={item.owner} />
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
