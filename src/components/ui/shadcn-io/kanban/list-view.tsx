


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
import type { KanbanItemProps } from "./index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

type ListViewProps = {
  items: KanbanItemProps[];
  className?: string;
};

export function ListView({ items, className }: ListViewProps) {
  // Helper to format dates (fallback if not provided)
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric',
  });

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
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.column ?? "—"}</TableCell>
              <TableCell>
                {item.owner && typeof item.owner === 'object' && 'name' in item.owner && 'image' in item.owner ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={(item.owner as { image?: string }).image ?? undefined} />
                      <AvatarFallback>
                        {((item.owner as { name?: string }).name ?? '').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{(item.owner as { name?: string }).name ?? ''}</span>
                  </div>
                ) : "—"}
              </TableCell>
              <TableCell>
                {item.startAt && item.endAt && (typeof item.startAt === 'string' || item.startAt instanceof Date) && (typeof item.endAt === 'string' || item.endAt instanceof Date)
                  ? `${shortDateFormatter.format(new Date(item.startAt))} - ${dateFormatter.format(new Date(item.endAt))}`
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
