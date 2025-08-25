import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { KanbanItemProps } from "./index";

const getDate = (d: unknown): Date | null => {
  if (typeof d === "string" || typeof d === "number") return new Date(d);
  if (d instanceof Date) return d;
  return null;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type KanbanItemSheetProps = {
  item: KanbanItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function KanbanItemSheet({
  item,
  open,
  onOpenChange,
}: KanbanItemSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <SheetTitle>{item.name}</SheetTitle>
              <SheetDescription>Status: {item.column ?? "—"}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Owner:</strong>{" "}
                {item.owner &&
                typeof item.owner === "object" &&
                "name" in item.owner
                  ? (item.owner as { name?: string }).name ?? "—"
                  : "—"}
              </p>
              <p>
                <strong>Date Range:</strong>{" "}
                {getDate(item.startAt) && getDate(item.endAt)
                  ? `${shortDateFormatter.format(
                      getDate(item.startAt) as Date
                    )} - ${dateFormatter.format(getDate(item.endAt) as Date)}`
                  : "—"}
              </p>
              <p>
                <strong>ID:</strong> {item.id}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
