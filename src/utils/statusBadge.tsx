import React from "react";
import { Badge } from "@/components/ui/badge";

// Status color mapping function
export const getStatusColor = (status: string): string => {
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
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Props for the StatusBadge component
export interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Reusable StatusBadge component
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  className = "",
}) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  return (
    <Badge
      className={`${getStatusColor(status)} ${sizeClasses[size]} ${className}`}
    >
      {status || "No Status"}
    </Badge>
  );
};

// Specialized badges for different contexts
export const ListViewStatusBadge: React.FC<{ status: string }> = ({
  status,
}) => <StatusBadge status={status} size="sm" />;

export const ItemSheetStatusBadge: React.FC<{ status: string }> = ({
  status,
}) => <StatusBadge status={status} size="lg" />;

export const KanbanStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <StatusBadge status={status} size="sm" />
);
