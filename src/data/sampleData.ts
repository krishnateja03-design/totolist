import { Column, Goal, Notification, Project, Task, TeamMember } from "../types";

export const columns: Column[] = [
  { id: "backlog", title: "Backlog", gradient: "from-slate-400 to-slate-600" },
  { id: "planned", title: "Planned", gradient: "from-indigo-500 to-violet-500" },
  { id: "progress", title: "In Progress", gradient: "from-cyan-500 to-blue-500" },
  { id: "review", title: "Review", gradient: "from-amber-500 to-orange-500" },
  { id: "done", title: "Done", gradient: "from-emerald-500 to-teal-500" },
];

// Clean slate initial state: 0 dummy projects, 0 dummy tasks, 0 dummy notifications
export const sampleProjects: Project[] = [];

export const tasks: Task[] = [];

export const notifications: Notification[] = [];

export const goals: Goal[] = [];

export const team: TeamMember[] = [
  {
    id: "m1",
    name: "Krishna Teja",
    role: "Project Lead",
    avatar: "KT",
    online: true,
    workload: 0,
    ring: "from-indigo-500 to-cyan-500",
    assignedProjects: [],
  },
  {
    id: "m2",
    name: "Ava Morgan",
    role: "Product Designer",
    avatar: "AM",
    online: true,
    workload: 0,
    ring: "from-pink-500 to-rose-500",
    assignedProjects: [],
  },
  {
    id: "m3",
    name: "Sam Kim",
    role: "Software Engineer",
    avatar: "SK",
    online: false,
    workload: 0,
    ring: "from-emerald-500 to-teal-500",
    assignedProjects: [],
  },
  {
    id: "m4",
    name: "Nora Reid",
    role: "Operations & QA",
    avatar: "NR",
    online: true,
    workload: 0,
    ring: "from-amber-500 to-orange-500",
    assignedProjects: [],
  },
];

export const chartData = [
  { name: "Mon", tasks: 0, score: 0, done: 0, hours: 0 },
  { name: "Tue", tasks: 0, score: 0, done: 0, hours: 0 },
  { name: "Wed", tasks: 0, score: 0, done: 0, hours: 0 },
  { name: "Thu", tasks: 0, score: 0, done: 0, hours: 0 },
  { name: "Fri", tasks: 0, score: 0, done: 0, hours: 0 },
  { name: "Sat", tasks: 0, score: 0, done: 0, hours: 0 },
  { name: "Sun", tasks: 0, score: 0, done: 0, hours: 0 },
];
