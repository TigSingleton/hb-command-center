export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: 'active' | 'idle' | 'working' | 'error' | 'spawning';
  description: string;
  tasksCompleted: number;
  currentTask?: string;
  uptime: string;
  metrics: Record<string, number>;
}

export interface Project {
  id: string;
  title: string;
  shortCode: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  department: string;
  departmentId?: string;
  leadAgentId?: string;
  targetDate?: string;
  taskCount: number;
  completedTaskCount: number;
  notes?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  deadline?: string;
  createdAt: string;
  tags: string[];
  projectId?: string;
  projectName?: string;
  projectShortCode?: string;
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'directive' | 'report' | 'alert' | 'system';
}

export interface KPI {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

export interface ActivityItem {
  id: string;
  agent: string;
  agentEmoji: string;
  action: string;
  detail: string;
  timestamp: string;
  type: 'task' | 'decision' | 'report' | 'spawn' | 'alert';
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'ahead' | 'behind';
  ownerAgentId?: string;
  ownerName: string;
  ownerEmoji: string;
  targetDate?: string;
  initiatives: { name: string; status: string; due: string }[];
}

export interface FeatureRequest {
  id: string;
  title: string;
  description?: string;
  screenshotUrl?: string;
  sourceView?: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'done' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export type ViewType = 'dashboard' | 'agents' | 'agent-detail' | 'tasks' | 'projects' | 'project-detail' | 'chat' | 'strategy' | 'ideas';
