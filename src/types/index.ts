export type Status = 'backlog' | 'planned' | 'progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Theme = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignees: string[];
  dueDate: string;
  comments: number;
  attachments: number;
  progress: number;
  tags: string[];
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
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'reminder' | 'team' | 'done';
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
}