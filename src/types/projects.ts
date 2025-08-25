export interface Project {
    id: string;
    name: string;
    description: string | null;
    todo_statuses: string;
    todo_ids: string;
}

export interface ToDoItem {
    id: string;
    name: string;
    description: string;
    status_id: string;
    owner_id: string;
}

// Kanban view types
export type Column = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  name: string;
  image: string;
};

export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  column: string;
  owner: User;
};