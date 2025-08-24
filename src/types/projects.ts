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