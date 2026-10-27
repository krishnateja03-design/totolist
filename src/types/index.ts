/**
 * @file types/index.ts
 * @description Central TypeScript type definitions for the Nexus PM Enterprise Project Manager.
 *
 * All shared interfaces and union types used across the application are defined here.
 * Import from this file whenever you need shared data shapes.
 *
 * Architecture:
 *  - Task:            A unit of work belonging to a project or standalone
 *  - Project:         A strategic initiative with milestones, notes, budget, and activities
 *  - Column:          Represents a Kanban board stage
 *  - Goal:            A high-level OKR/goal linked to a project
 *  - Notification:    In-app notification items shown in the bell dropdown
 *  - TeamMember:      A person in the company's project team
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitive Union Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Represents the stage of a Task in the delivery pipeline.
 * Used to determine which Kanban column the task appears in.
 *
 * - "backlog"   → Not yet scheduled
 * - "planned"   → Scheduled but not started
 * - "progress"  → Actively being worked on
 * - "review"    → Submitted for code review or QA
 * - "done"      → Completed and accepted
 */
export type Status = "backlog" | "planned" | "progress" | "review" | "done";

/**
 * Urgency level of a Task. Controls badge color, sort order, and alerts.
 *
 * - "low"     → Non-critical, anytime
 * - "medium"  → Should be done this sprint
 * - "high"    → Needs attention this week
 * - "urgent"  → Blocks others; escalate immediately
 */
export type Priority = "low" | "medium" | "high" | "urgent";

/**
 * UI color theme preference for the entire application.
 * Toggled from the top navbar. Persisted in localStorage via Zustand persist.
 */
export type Theme = "light" | "dark";

/**
 * The health status of a Project, determined by the project lead.
 *
 * - "on-track" → Milestones and budget are within expected bounds
 * - "at-risk"  → There are blockers or minor slippage; needs attention
 * - "delayed"  → Significantly behind schedule or over budget
 */
export type ProjectHealth = "on-track" | "at-risk" | "delayed";

/**
 * Organizational department / category for grouping projects in filters and dashboards.
 * Extend this union when new departments are onboarded.
 */
export type ProjectCategory =
  | "Product"
  | "Engineering"
  | "Marketing"
  | "Design"
  | "Operations";

// ─────────────────────────────────────────────────────────────────────────────
// Project Sub-Entities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single milestone within a project. Milestones represent critical deliverable checkpoints.
 * They appear on the Timeline/Gantt page and in the ProjectDetail workspace.
 *
 * @example
 * const milestone: ProjectMilestone = {
 *   id: "m-abc123",
 *   title: "Beta Launch",
 *   dueDate: "2025-03-15",
 *   completed: false,
 * };
 */
export interface ProjectMilestone {
  /** Unique identifier – generated as "m-<random>" by the store */
  id: string;

  /** Short descriptive name of the milestone deliverable */
  title: string;

  /** ISO date string (YYYY-MM-DD) – the target completion date */
  dueDate: string;

  /**
   * Whether this milestone has been marked complete.
   * Toggled via `useAppStore.toggleMilestone(projectId, milestoneId)`.
   */
  completed: boolean;
}

/**
 * A rich-text note document stored inside a project.
 * Notes are used for specs, meeting summaries, or async communication.
 * Displayed in the "Docs" tab of the ProjectDetail workspace.
 */
export interface ProjectNote {
  /** Unique identifier – generated as "n-<random>" by the store */
  id: string;

  /** Short note heading / document title */
  title: string;

  /** Full markdown or plain-text body of the note */
  content: string;

  /** Human-readable relative timestamp (e.g., "2 hours ago", "Just now") */
  updatedAt: string;

  /** Display name of the team member who created or last edited the note */
  author: string;
}

/**
 * An entry in the project's activity log / audit trail.
 * Automatically created when milestones, tasks, or notes are updated.
 * Displayed in the "Activity" section of the ProjectDetail workspace.
 */
export interface ProjectActivity {
  /** Unique identifier – generated via crypto.randomUUID() */
  id: string;

  /** Past-tense verb phrase describing what happened (e.g., "created project", "updated milestone") */
  action: string;

  /** Human-readable relative timestamp (e.g., "Just now", "Yesterday") */
  timestamp: string;

  /** Display name of the actor (current user or team member) */
  user: string;

  /** Optional extra context – typically the name of the affected entity */
  details?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Entities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A Project represents a strategic initiative managed in Nexus PM.
 * Each project has its own workspace, Kanban board, milestones, notes, budget, and activity feed.
 *
 * Projects are stored in `useAppStore.projects[]` and persisted to localStorage.
 *
 * @example
 * const myProject: Project = {
 *   id: "prj-001",
 *   name: "Customer Portal Redesign",
 *   key: "CPR",
 *   description: "...",
 *   color: "#6366f1",
 *   icon: "🚀",
 *   category: "Product",
 *   health: "on-track",
 *   status: "active",
 *   lead: "Krishna Teja",
 *   startDate: "2025-01-01",
 *   targetDate: "2025-06-30",
 *   budget: { allocated: 50000, spent: 18000 },
 *   milestones: [],
 *   notes: [],
 *   activity: [],
 * };
 */
export interface Project {
  /** Unique identifier – generated as "prj-<random>" by the store */
  id: string;

  /** Full human-readable project name shown in the header and cards */
  name: string;

  /**
   * Short uppercase abbreviation used as a prefix for task IDs and quick identification.
   * Examples: "CPR", "ENG", "MKT"
   */
  key: string;

  /** One-paragraph description of the project's purpose and scope */
  description: string;

  /**
   * Hex color string that identifies the project visually across the app.
   * Used in Kanban badges, timeline bars, and project cards.
   * Example: "#6366f1"
   */
  color: string;

  /** Emoji or icon character used as a visual shorthand for the project card */
  icon: string;

  /** Organizational category for grouping and filtering on the Projects Hub page */
  category: ProjectCategory;

  /**
   * Current delivery health set by the project lead.
   * Drives the health badge color on project cards and the dashboard spotlight.
   */
  health: ProjectHealth;

  /**
   * Lifecycle phase of the project.
   * - "planning"   → Not yet kicked off
   * - "active"     → Actively in delivery
   * - "on-hold"    → Temporarily paused
   * - "completed"  → Delivered and closed
   */
  status: "active" | "planning" | "completed" | "on-hold";

  /** Display name of the person accountable for delivery (Project Lead / PM) */
  lead: string;

  /** ISO date string (YYYY-MM-DD) – the project kick-off date */
  startDate: string;

  /** ISO date string (YYYY-MM-DD) – the expected completion / go-live date */
  targetDate: string;

  /**
   * Optional financial budget tracking for this project.
   * Shown on the Dashboard KPI cards and the Projects Hub.
   */
  budget?: {
    /** Total approved budget in USD */
    allocated: number;
    /** Amount already invoiced or committed in USD */
    spent: number;
  };

  /**
   * List of milestone checkpoints. Appears on the Timeline/Gantt and ProjectDetail pages.
   * Each milestone can be toggled complete by the lead.
   */
  milestones: ProjectMilestone[];

  /**
   * Rich-text notes attached to this project (spec docs, meeting notes, etc.).
   * Managed in the "Docs" tab of the ProjectDetail workspace.
   */
  notes?: ProjectNote[];

  /**
   * Immutable audit log of all significant actions taken on this project.
   * New entries are prepended by store actions (add, toggle, update).
   */
  activity?: ProjectActivity[];
}

/**
 * A Task (Work Item) is the atomic unit of work within Nexus PM.
 * Tasks can belong to a project (via `projectId`) or exist standalone.
 * Tasks are tracked through the delivery pipeline using the `Status` union type.
 *
 * Tasks appear on:
 *  - The Kanban Board (/board)
 *  - The Task Manager table (/tasks)
 *  - The Dashboard (upcoming items section)
 *  - The Timeline page (as duration bars)
 *  - The ProjectDetail workspace (tasks tab)
 */
export interface Task {
  /** Unique identifier – generated as "t-<random>" by the store */
  id: string;

  /**
   * Reference to the parent Project.
   * If omitted, the task is shown under "No Project" in the board/tasks views.
   */
  projectId?: string;

  /** Short, actionable title for the task (e.g., "Implement login flow") */
  title: string;

  /** Detailed description of the task's scope, acceptance criteria, or context */
  description: string;

  /**
   * Current stage in the delivery pipeline.
   * Determines the Kanban column and filters on the Tasks page.
   */
  status: Status;

  /** Urgency / importance level – used for badge styling and prioritized sorting */
  priority: Priority;

  /**
   * Array of assignee display initials or names.
   * Example: ["KT", "AM"] – rendered as stacked Avatar circles
   */
  assignees: string[];

  /** ISO date string (YYYY-MM-DD) – the deadline for this task */
  dueDate: string;

  /** ISO date string (YYYY-MM-DD) – when work on this task is expected to begin */
  startDate?: string;

  /**
   * Time budgeted for this task in hours.
   * Shown on TaskCard and used in the time-tracking progress bar.
   */
  estimatedHours?: number;

  /**
   * Actual hours logged against this task.
   * Incremented via the quick log popover on the TaskCard or via `logTaskHours` store action.
   */
  loggedHours?: number;

  /** Number of comments posted on this task (currently a counter; chat UI is future scope) */
  comments: number;

  /** Number of file attachments linked to this task */
  attachments: number;

  /**
   * Completion percentage from 0-100.
   * Automatically set to 100 when the task is moved to "done" via `moveTask`.
   */
  progress: number;

  /**
   * Free-form labels / tags for categorization and filtering.
   * Example: ["frontend", "auth", "p0"]
   */
  tags: string[];

  /**
   * IDs of tasks that block this task from starting.
   * Used on the Timeline to draw dependency arrows (future enhancement).
   */
  blockedBy?: string[];
}

/**
 * Represents a single stage column on the Kanban Board.
 * The five default columns map directly to the `Status` union type values.
 * Each column has a Tailwind gradient for its header accent bar.
 */
export interface Column {
  /** Must match one of the `Status` values – used as the droppable zone ID in DnD */
  id: Status;

  /** Human-readable column heading displayed on the board */
  title: string;

  /**
   * Tailwind CSS gradient class pair applied to the column header strip.
   * Example: "from-indigo-500 to-violet-500"
   */
  gradient: string;
}

/**
 * A high-level organizational goal (OKR-style) visible on the Dashboard.
 * Goals show aggregated progress and link to one or more projects for context.
 */
export interface Goal {
  /** Unique identifier */
  id: string;

  /** Short name of the goal (e.g., "Ship v2.0 Platform") */
  title: string;

  /** Display name of the person or team accountable for this goal */
  owner: string;

  /**
   * Current completion percentage from 0-100.
   * Updated via `useAppStore.updateGoal(id, progress)`.
   */
  progress: number;

  /** Array of milestone labels shown as sub-items under the goal */
  milestones: string[];

  /**
   * Tailwind gradient class pair for the goal card header accent.
   * Example: "from-violet-500 to-indigo-500"
   */
  gradient: string;

  /** Optional reference to an associated project for deep-link navigation */
  projectId?: string;
}

/**
 * An in-app notification item displayed in the bell-icon dropdown.
 * Notifications are auto-generated when tasks or projects are created.
 * Marked read via `useAppStore.markNotification(id)`.
 */
export interface Notification {
  /** Unique identifier generated via crypto.randomUUID() */
  id: string;

  /** Bold heading shown at the top of the notification card */
  title: string;

  /** Descriptive body text with context about the event */
  message: string;

  /**
   * Category of the notification – determines the icon and accent color.
   * - "task"     → A new task was created
   * - "project"  → A new project was initiated
   * - "reminder" → A deadline or follow-up reminder
   * - "team"     → A team member assignment or update
   * - "done"     → A task or milestone was completed
   */
  type: "task" | "reminder" | "team" | "done" | "project";

  /** Whether the user has seen / acknowledged this notification */
  read: boolean;

  /** Human-readable relative time string (e.g., "Just now", "5 min ago") */
  time: string;
}

/**
 * A member of the company team displayed on the Team Matrix page (/team).
 * Shows workload, online status, and assigned project coverage.
 */
export interface TeamMember {
  /** Unique identifier (e.g., "m1", "m2") */
  id: string;

  /** Full display name of the team member */
  name: string;

  /** Job title or role in the company (e.g., "Software Engineer", "Project Lead") */
  role: string;

  /** Two-letter initials string used to render the Avatar component (e.g., "KT", "AM") */
  avatar: string;

  /** Whether the person is currently active/online (used to show the green presence dot) */
  online: boolean;

  /**
   * Workload percentage from 0-100.
   * Visualized as a ProgressBar on the Team Matrix.
   * 0 = free capacity, 100 = fully allocated
   */
  workload: number;

  /**
   * Tailwind gradient class pair applied to the Avatar's ring/border.
   * Example: "from-indigo-500 to-cyan-500"
   */
  ring: string;

  /** Array of project IDs this member is assigned to */
  assignedProjects?: string[];
}
