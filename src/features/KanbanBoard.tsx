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
import { Plus, Filter } from "lucide-react";
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
      className={isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab"}
    >
      <TaskCard task={task} />
    </div>
  );
}

function Column({
  id,
  title,
  gradient,
  selectedProjectId,
  onOpenTaskModal,
}: {
  id: Status;
  title: string;
  gradient: string;
  selectedProjectId: string;
  onOpenTaskModal: (status: Status) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const allTasks = useAppStore((s) => s.tasks);

  const tasks = allTasks
    .filter((t) => (selectedProjectId === "all" ? true : t.projectId === selectedProjectId))
    .filter((t) => t.status === id);

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[560px] rounded-3xl p-4 transition-all duration-200 border border-black/5 dark:border-white/10 ${
        isOver
          ? "bg-indigo-100/70 dark:bg-indigo-950/40 ring-4 ring-indigo-400/50"
          : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-md"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`rounded-2xl bg-gradient-to-r ${gradient} px-3.5 py-1.5 text-xs font-black text-white shadow-md flex items-center gap-1.5`}
        >
          <span>{title}</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onOpenTaskModal(id)}
          className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title={`Add item to ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3.5">
        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-xs font-semibold text-slate-400">
            Drop work items here
          </div>
        )}

        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export function KanbanBoard({
  selectedProjectId,
  onOpenTaskModal,
}: {
  selectedProjectId: string;
  onOpenTaskModal: (status: Status) => void;
}) {
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
      <div className="thin-scroll grid gap-4 overflow-x-auto pb-4 xl:grid-cols-5">
        {columns.map((column) => (
          <Column
            key={column.id}
            {...column}
            selectedProjectId={selectedProjectId}
            onOpenTaskModal={onOpenTaskModal}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.04 }}
            className="rotate-2 cursor-grabbing shadow-2xl"
          >
            <TaskCard task={activeTask} />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
