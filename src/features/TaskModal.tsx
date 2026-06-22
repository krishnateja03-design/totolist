import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { Priority, Status } from '../types';

export function TaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addTask = useAppStore(s => s.addTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('backlog');
  const [assignees, setAssignees] = useState('KT');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [progress, setProgress] = useState(10);
  const [comments, setComments] = useState(0);
  const [attachments, setAttachments] = useState(0);

  function resetForm() {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('backlog');
    setAssignees('KT');
    setDueDate('');
    setTags('');
    setProgress(10);
    setComments(0);
    setAttachments(0);
  }

  function submit() {
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      status,
      priority,
      assignees: assignees
        .split(',')
        .map(a => a.trim())
        .filter(Boolean),
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      comments,
      attachments,
      progress,
      tags: tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
    });

    resetForm();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Create New Task</h2>

              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-100"
                type="button"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
              />

              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Task description"
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Status)}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <option value="backlog">Backlog</option>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>

                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <input
                value={assignees}
                onChange={e => setAssignees(e.target.value)}
                placeholder="Assignees, comma separated e.g. KT, AR"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
              />

              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
              />

              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Tags, comma separated e.g. Design, Bug, New"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
              />

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Progress: {progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={e => setProgress(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="0"
                  value={comments}
                  onChange={e => setComments(Number(e.target.value))}
                  placeholder="Comments"
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
                />

                <input
                  type="number"
                  min="0"
                  value={attachments}
                  onChange={e => setAttachments(Number(e.target.value))}
                  placeholder="Attachments"
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
                />
              </div>

              <Button
                onClick={submit}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-white"
              >
                Create Task
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}