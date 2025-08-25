import { Kanban } from "@/components/projects/kanban";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ListView } from "./components/projects/list-view";
import { faker } from "@faker-js/faker";
import type { Column, User, Feature } from "@/types/projects";
import { CreateTask } from "./components/projects/create-task";
import { KanbanItemSheet } from "@/components/ui/shadcn-io/kanban/kanban-item-sheet";
import type { KanbanItemProps } from "@/components/ui/shadcn-io/kanban";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns: Column[] = [
  { id: faker.string.uuid(), name: "Planned", color: "#6B7280" },
  { id: faker.string.uuid(), name: "In Progress", color: "#F59E0B" },
  { id: faker.string.uuid(), name: "Done", color: "#10B981" },
];

const users: User[] = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    image: faker.image.avatar(),
  }));

const exampleFeatures: Feature[] = Array.from({ length: 20 })
  .fill(null)
  .map(() => ({
    id: faker.string.uuid(),
    name: capitalize(faker.company.buzzPhrase()),
    startAt: faker.date.past({ years: 0.5, refDate: new Date() }),
    endAt: faker.date.future({ years: 0.5, refDate: new Date() }),
    column: faker.helpers.arrayElement(columns).id,
    owner: faker.helpers.arrayElement(users),
  }));

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function Projects() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [features, setFeatures] = useState(exampleFeatures);
  const [selectedItem, setSelectedItem] = useState<KanbanItemProps | null>(
    null
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateTask />
      </div>
      <div className="mb-4 flex gap-2">
        <Button
          variant={view === "kanban" ? "default" : "outline"}
          onClick={() => setView("kanban")}
        >
          Kanban View
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          onClick={() => setView("list")}
        >
          List View
        </Button>
      </div>
      {view === "kanban" ? (
        <Kanban
          columns={columns}
          features={features}
          setFeatures={setFeatures}
          dateFormatter={dateFormatter}
          shortDateFormatter={shortDateFormatter}
          onSelect={setSelectedItem}
        />
      ) : (
        <ListView items={features} onSelect={setSelectedItem} />
      )}

      <KanbanItemSheet
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </div>
  );
}
