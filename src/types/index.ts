export type Status = "backlog" | "planned" | "progress" | "review" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Theme = "light" | "dark";
export type ProjectHealth = "on-track" | "at-risk" | "delayed";
export type ProjectCategory = "Product" | "Engineering" | "Marketing" | "Design" | "Operations";

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  author: string;
}

export interface ProjectActivity {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  key: string; // e.g. "PRJ", "DES", "ENG"
  description: string;
  color: string;
  icon: string;
  category: ProjectCategory;
  health: ProjectHealth;
  status: "active" | "planning" | "completed" | "on-hold";
  lead: string;
  startDate: string;
  targetDate: string;
  budget?: {
    allocated: number;
    spent: number;
  };
  milestones: ProjectMilestone[];
  notes?: ProjectNote[];
  activity?: ProjectActivity[];
}

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignees: string[];
  dueDate: string;
  startDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  comments: number;
  attachments: number;
  progress: number;
  tags: string[];
  blockedBy?: string[];
}

export interface Column {
  id: Status;
  title: string;
  gradient: string;
}

export interface Goal {
  id: string;
  title: string;
  owner: string;
  progress: number;
  milestones: string[];
  gradient: string;
  projectId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "task" | "reminder" | "team" | "done" | "project";
  read: boolean;
  time: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
  workload: number;
  ring: string;
  assignedProjects?: string[];
}
