


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
import type { KanbanItemProps } from "@/components/ui/shadcn-io/kanban/index";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { KanbanItemSheet } from "@/components/ui/shadcn-io/kanban/kanban-item-sheet";


type ListViewProps = {
  items: KanbanItemProps[];
  className?: string;
};

export function ListView({ items, className }: ListViewProps) {
  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(null);

  return (
    <>
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
              <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedItem(item)}>
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
                  {/* You can move date formatting into the sheet if you want */}
                  —
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <KanbanItemSheet
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </>
  );
}
