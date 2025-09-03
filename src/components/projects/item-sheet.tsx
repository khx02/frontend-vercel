import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  UserIcon,
  HashIcon,
  Trash2Icon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { KanbanItemProps } from "./index";
import type { Column, User } from "@/types/projects";
import { formatDateParts } from "@/utils/dateFormat";
import { ItemSheetAvatar } from "@/components/ui/user-avatar";
import { ItemSheetStatusBadge } from "@/utils/statusBadge";

// Reusable editable wrapper component
const EditableField = ({
  children,
  onClick,
  canEdit,
  className = "cursor-pointer hover:bg-muted/70 hover:shadow-sm rounded-lg px-2 py-1 transition-all duration-200 border-2 border-transparent hover:border-muted-foreground/20",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  canEdit?: boolean;
  className?: string;
}) => {
  if (!canEdit) return <>{children}</>;

  return (
    <div className={className} onClick={onClick} title="Edit">
      {children}
    </div>
  );
};

type KanbanItemSheetProps = {
  item: KanbanItemProps | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (itemId: string) => void;
  onUpdate?: (itemId: string, updates: Partial<KanbanItemProps>) => void;
  columns?: Column[];
  users?: User[];
};

export function KanbanItemSheet({
  item,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
  columns = [],
  users = [],
}: KanbanItemSheetProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    name?: string;
    column?: string;
    startAt?: string;
    endAt?: string;
    owner?: User;
  }>({});

  // Reset editing state when sheet opens/closes
  useEffect(() => {
    if (!open) {
      setEditingField(null);
      setEditValues({});
    }
  }, [open]);

  const getColumnName = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    return column?.name || columnId;
  };

  const startEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({ [field]: currentValue });
  };

  const saveEdit = (field: string) => {
    if (
      onUpdate &&
      item &&
      editValues[field as keyof typeof editValues] !== undefined
    ) {
      const value = editValues[field as keyof typeof editValues];
      onUpdate(item.id, { [field]: value });
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const formatDateForInput = (date: unknown) => {
    if (!date) return "";
    const d = new Date(date as string);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-2">
        {item && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="border-b-4 p-4">
              <div className="space-y-4">
                {/* Title Section */}
                {editingField === "name" ? (
                  <Input
                    value={editValues.name || ""}
                    onChange={(e) => setEditValues({ name: e.target.value })}
                    className="text-2xl font-semibold"
                    autoFocus
                    onBlur={() => saveEdit("name")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit("name");
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                ) : (
                  <EditableField
                    canEdit={!!onUpdate}
                    onClick={() => startEdit("name", item.name)}
                    className="text-2xl font-semibold leading-tight cursor-pointer hover:bg-muted/70 hover:shadow-sm rounded-lg px-2 py-1 transition-all duration-200 border-2 border-transparent hover:border-muted-foreground/20"
                  >
                    {item.name}
                  </EditableField>
                )}

                {/* Status Section */}
                <div className="flex items-center gap-2 text-base">
                  <span className="text-base text-muted-foreground">
                    Status:
                  </span>
                  {editingField === "column" ? (
                    <Select
                      value={editValues.column || ""}
                      onValueChange={(value) => {
                        if (onUpdate && item) {
                          onUpdate(item.id, { column: value });
                        }
                        cancelEdit();
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <EditableField
                      canEdit={!!onUpdate}
                      onClick={() => startEdit("column", item.column)}
                    >
                      <ItemSheetStatusBadge
                        status={getColumnName(item.column ?? "")}
                      />
                    </EditableField>
                  )}
                </div>
              </div>
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
                  {editingField === "owner" ? (
                    <Select
                      defaultValue={(item.owner as any)?.id || ""}
                      onValueChange={(value) => {
                        const selectedUser = users.find((u) => u.id === value);
                        if (selectedUser && onUpdate && item) {
                          onUpdate(item.id, { owner: selectedUser });
                        }
                        cancelEdit();
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-6 h-6 rounded-full"
                              />
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <EditableField
                      canEdit={!!onUpdate}
                      onClick={() => startEdit("owner", item.owner)}
                    >
                      <ItemSheetAvatar owner={item.owner} />
                    </EditableField>
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
                  {editingField === "dates" ? (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          type="date"
                          value={editValues.startAt || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              startAt: e.target.value,
                            })
                          }
                          className="flex-1 min-w-0"
                        />
                        <span className="text-muted-foreground px-2">→</span>
                        <Input
                          type="date"
                          value={editValues.endAt || ""}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              endAt: e.target.value,
                            })
                          }
                          className="flex-1 min-w-0"
                        />
                      </div>
                      <div className="flex gap-2 justify-evenly p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (onUpdate && item) {
                              onUpdate(item.id, {
                                startAt: editValues.startAt
                                  ? new Date(editValues.startAt)
                                  : undefined,
                                endAt: editValues.endAt
                                  ? new Date(editValues.endAt)
                                  : undefined,
                              });
                            }
                            cancelEdit();
                          }}
                          className="border-green-500 hover:bg-green-50 hover:text-green-700"
                        >
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="border-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <XIcon className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EditableField
                      canEdit={!!onUpdate}
                      onClick={() => {
                        setEditingField("dates");
                        setEditValues({
                          startAt: formatDateForInput(item.startAt),
                          endAt: formatDateForInput(item.endAt),
                        });
                      }}
                      className="cursor-pointer hover:bg-muted/70 hover:shadow-sm rounded-lg px-2 py-1 transition-all duration-200 border-2 border-transparent hover:border-muted-foreground/20 inline-block"
                    >
                      {(() => {
                        const { startDate, endDate, isValid } = formatDateParts(
                          item.startAt,
                          item.endAt
                        );
                        return isValid ? (
                          <div className="text-base">
                            <span className="font-medium">{startDate}</span>
                            <span className="text-muted-foreground mx-2">
                              →
                            </span>
                            <span className="font-medium">{endDate}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No dates set - click to add
                          </span>
                        );
                      })()}
                    </EditableField>
                  )}
                </div>
              </div>

              {/* ID Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-base font-medium text-foreground">
                  <HashIcon className="h-4 w-4 text-muted-foreground" />
                  <span>ID</span>
                </div>
                <div className="pl-6">
                  <div className="px-2 py-1 text-sm bg-muted rounded-md">
                    {item.id}
                  </div>
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
