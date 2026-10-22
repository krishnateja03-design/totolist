import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Status, Task } from "../types";
import { TaskCard } from "../components/TaskCard";

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
      }}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-30" : ""}
    >
      <TaskCard task={task} />
    </div>
  );
}

function Column({
  id,
  title,
  gradient,
}: {
  id: Status;
  title: string;
  gradient: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const allTasks = useAppStore((s) => s.tasks);
  const add = useAppStore((s) => s.addTask);

  const tasks = allTasks.filter((t) => t.status === id);

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[520px] rounded-[2rem] p-4 transition ${
        isOver
          ? "bg-indigo-100/70 ring-4 ring-indigo-300/60"
          : "bg-white/45 dark:bg-slate-900/40"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`rounded-2xl bg-gradient-to-r ${gradient} px-4 py-2 text-sm font-black text-white shadow-lg`}
        >
          {title} · {tasks.length}
        </div>

        <button
          onClick={() =>
            add({
              title: "New task",
              description: "Created from board.",
              status: id,
              priority: "medium",
              assignees: ["KT"],
              dueDate: new Date().toISOString(),
              comments: 0,
              attachments: 0,
              progress: 10,
              tags: ["New"],
            })
          }
          className="rounded-xl bg-white p-2 shadow"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-bold text-slate-400">
            Drop tasks here
          </div>
        )}

        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export function KanbanBoard() {
  const columns = useAppStore((s) => s.columns);
  const tasks = useAppStore((s) => s.tasks);
  const move = useAppStore((s) => s.moveTask);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === String(event.active.id));
    setActiveTask(task ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    if (event.over) {
      move(String(event.active.id), event.over.id as Status);
    }

    setActiveTask(null);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="thin-scroll grid gap-5 overflow-x-auto pb-4 xl:grid-cols-5">
        {columns.map((column) => (
          <Column key={column.id} {...column} />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.04 }}
            className="rotate-2 cursor-grabbing"
          >
            <TaskCard task={activeTask} />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
