import { useState, useCallback, useEffect } from 'react';
import { ViewType, Agent, Task, Message, KPI, ActivityItem, Project, Department, Goal, FeatureRequest } from './types';
import { initialAgents, initialTasks, initialMessages, initialKPIs, initialActivity, initialProjects, initialDepartments } from './data';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AgentHub } from './components/AgentHub';
import { AgentDetail } from './components/AgentDetail';
import { TaskBoard } from './components/TaskBoard';
import { ProjectsView } from './components/ProjectsView';
import { ChatInterface } from './components/ChatInterface';
import { Strategy } from './components/Strategy';
import { ProjectDetail } from './components/ProjectDetail';
import { IdeaCaptureModal, IdeaFAB } from './components/IdeaCaptureModal';
import { TaskCaptureModal, TaskFAB } from './components/TaskCaptureModal';
import { IdeasView } from './components/IdeasView';
import { LoginScreen } from './components/LoginScreen';
import * as api from './api';
import { supabase, signOut } from './auth';
import type { Session } from '@supabase/supabase-js';

// Map Supabase agent_personas to our Agent interface
function mapAgent(a: any): Agent {
  const emojiMap: Record<string, string> = {
    '@CEA': '🧠', '@Chief_of_Staff': '📋', '@Editor_in_Chief': '✍️',
    '@Growth_Lead': '📈', '@VP_of_Engineering': '⚙️', '@Meeting_Scribe': '📝',
    '@Clip_Extractor': '🎬', '@Health_Monitor': '💚', '@Workflow_Builder': '🔧',
    '@Project_Lead': '🎯',
  };
  return {
    id: a.id,
    name: a.functional_name,
    role: a.handle,
    emoji: emojiMap[a.handle] || '🤖',
    status: a.is_active ? 'active' : 'idle',
    description: a.system_prompt?.substring(0, 200) || '',
    tasksCompleted: 0,
    currentTask: undefined,
    uptime: 'live',
    metrics: a.tool_access ? { tools: (a.tool_access as any[]).length } : {},
  };
}

// Map Supabase tasks
function mapTask(t: any, agents: any[], projects: any[]): Task {
  const priorityMap: Record<number, Task['priority']> = { 1: 'critical', 2: 'high', 3: 'medium', 4: 'low', 5: 'low' };
  const statusMap: Record<string, Task['status']> = { todo: 'pending', in_progress: 'in_progress', done: 'completed', failed: 'review' };
  const assignedAgent = agents.find((a: any) => a.id === t.assigned_to);
  const project = projects.find((p: any) => p.id === t.project_id);
  const shortCode = project?.title?.match(/^PR\.(\w+)/)?.[1] || '';
  return {
    id: t.id,
    title: t.description?.substring(0, 80) || 'Untitled',
    description: t.description || '',
    assignedTo: assignedAgent?.handle === '@CEA' ? 'cea' : (assignedAgent ? assignedAgent.id : 'tiger'),
    assignedBy: 'cea',
    priority: priorityMap[t.priority] || 'medium',
    status: statusMap[t.status] || 'pending',
    deadline: t.completed_at || undefined,
    createdAt: t.created_at,
    tags: [],
    projectId: t.project_id || undefined,
    projectName: project ? project.title.replace(/^PR\.\w+\s*\|\s*/, '') : undefined,
    projectShortCode: shortCode || undefined,
    parentTaskId: t.parent_task_id || undefined,
  };
}

// Map Supabase projects
function mapProject(p: any, departments: any[], tasks: any[]): Project {
  const dept = departments.find((d: any) => d.id === p.dept_id);
  const projectTasks = tasks.filter((t: any) => t.project_id === p.id);
  const completedTasks = projectTasks.filter((t: any) => t.status === 'done');
  const shortCode = p.title?.match(/^PR\.(\w+)/)?.[1] || p.title?.substring(0, 4) || '';
  return {
    id: p.id,
    title: p.title,
    shortCode,
    description: p.description || undefined,
    status: p.status || 'active',
    department: dept?.name || 'Unknown',
    departmentId: p.dept_id,
    leadAgentId: p.lead_agent_id,
    targetDate: p.target_date || undefined,
    taskCount: projectTasks.length,
    completedTaskCount: completedTasks.length,
    notes: p.metadata?.notes || undefined,
    createdAt: p.created_at,
    parentProjectId: p.parent_project_id || undefined,
  };
}

// Map Supabase goals
function mapGoal(g: any, agents: any[]): Goal {
  const emojiMap: Record<string, string> = {
    '@CEA': '🧠', '@Chief_of_Staff': '📋', '@Editor_in_Chief': '✍️',
    '@Growth_Lead': '📈', '@VP_of_Engineering': '⚙️',
  };
  const ownerAgent = agents.find((a: any) => a.id === g.owner_agent_id);
  return {
    id: g.id,
    title: g.title,
    description: g.description || undefined,
    progress: g.progress || 0,
    status: g.status || 'on-track',
    ownerAgentId: g.owner_agent_id,
    ownerName: ownerAgent?.functional_name || g.owner_name || 'Unassigned',
    ownerEmoji: ownerAgent ? (emojiMap[ownerAgent.handle] || '🤖') : '🎯',
    targetDate: g.target_date || undefined,
    initiatives: g.initiatives || [],
  };
}

// Map Supabase activity
function mapActivity(a: any): ActivityItem {
  const emojiMap: Record<string, string> = {
    '@CEA': '🧠', '@Chief_of_Staff': '📋', '@Editor_in_Chief': '✍️',
    '@Growth_Lead': '📈', '@VP_of_Engineering': '⚙️', '@Tiger': '🐯',
  };
  const timeDiff = Date.now() - new Date(a.created_at).getTime();
  const mins = Math.floor(timeDiff / 60000);
  const timeStr = mins < 1 ? 'Just now' : mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
  return {
    id: a.id,
    agent: a.agent_handle || 'System',
    agentEmoji: emojiMap[a.agent_handle] || '🤖',
    action: a.action,
    detail: a.detail || '',
    timestamp: timeStr,
    type: a.action_type as any,
  };
}

// Map Supabase messages
function mapMessage(m: any): Message {
  return {
    id: m.id,
    from: m.from_type === 'human' ? 'tiger' : 'cea',
    fromName: m.from_name,
    content: m.content,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    type: m.message_type as any,
  };
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auth gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onAuthenticated={() => {}} />;
  }

  return <AuthenticatedApp session={session} />;
}

function AuthenticatedApp({ session }: { session: Session }) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [kpis, setKpis] = useState<KPI[]>(initialKPIs);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [threadId, setThreadId] = useState<string | undefined>();
  const [rawAgents, setRawAgents] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Cmd+I (idea) and Cmd+T (task) shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        setIdeaModalOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setTaskModalOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load live data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.fetchDashboard();

        if (data.agents?.length) {
          setRawAgents(data.agents);
          setAgents(data.agents.map(mapAgent));
        }
        if (data.tasks?.length) {
          setTasks(data.tasks.map((t: any) => mapTask(t, data.agents || [], data.projects || [])));
        }
        if (data.projects?.length) {
          setProjects(data.projects.map((p: any) => mapProject(p, data.departments || [], data.tasks || [])));
        }
        if (data.goals?.length) {
          setGoals(data.goals.map((g: any) => mapGoal(g, data.agents || [])));
        }
        if (data.kpis?.length) {
          setKpis(data.kpis.map((k: any) => ({
            id: k.id,
            label: k.label,
            value: k.value,
            change: k.change_percent,
            trend: k.trend,
            category: k.category,
          })));
        }
        if (data.activity?.length) {
          setActivity(data.activity.map(mapActivity));
        }
        if (data.messages?.length) {
          setMessages(data.messages.map(mapMessage));
        }
        if (data.departments?.length) {
          setDepartments(data.departments.map((d: any) => ({ id: d.id, name: d.name })));
        }

        setIsLive(true);
      } catch (e) {
        console.log('Using mock data (API unavailable):', e);
        setIsLive(false);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Load feature requests
  useEffect(() => {
    async function loadFeatureRequests() {
      try {
        const data = await api.fetchFeatureRequests();
        if (Array.isArray(data)) {
          setFeatureRequests(data.map((fr: any) => ({
            id: fr.id,
            title: fr.title,
            description: fr.description || undefined,
            screenshotUrl: fr.screenshot_url || undefined,
            sourceView: fr.source_view || undefined,
            status: fr.status || 'new',
            priority: fr.priority || 'medium',
            createdAt: fr.created_at,
            updatedAt: fr.updated_at,
          })));
        }
      } catch (e) {
        console.log('Feature requests unavailable:', e);
      }
    }
    loadFeatureRequests();
  }, []);

  const pendingTaskCount = tasks.filter(
    t => t.assignedTo === 'tiger' && t.status !== 'completed'
  ).length;

  const generateCeaResponse = useCallback((userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (lower.includes('focus') || lower.includes('today') || lower.includes('priority')) {
      return "**Three things, in order of impact:**\n\n1. **Sign off on the pricing strategy** — it's been blocking revenue growth for 3 days.\n2. **Review the Editor in Chief's blog drafts** so we can maintain content momentum.\n3. **Prep for the next consultation.**\n\nI've cleared everything else from your plate.";
    }
    if (lower.includes('progress') || lower.includes('week')) {
      return "## This Week's Scorecard\n\n- **Revenue**: Up 12.5% *(meditation content driving it)*\n- **Community**: +34 members\n- **Content**: Editor in Chief published 3 posts\n- **Ops**: VP of Engineering automated broadcast reminders\n\n> **One concern:** Newsletter open rate dipped 2.1%";
    }
    if (lower.includes('revenue') || lower.includes('money') || lower.includes('pricing')) {
      return "### Current MRR: `$4,280`\n\nGrowth Lead's analysis shows three levers:\n\n1. **Tiered pricing** — could add ~$2,400/month\n2. **Increase consultation slots** — adds ~$1,200\n3. **Group workshops** — could generate $800-1,500/month\n\n*Recommendation: Tiered pricing has the highest impact-to-effort ratio.*";
    }
    if (lower.includes('fire') || lower.includes('replace') || lower.includes('quit')) {
      return "I can't fire you, Tiger. **HeartBased.io IS you.**\n\nWhat I *can* do is make sure you only spend time on what **only YOU** can do. Everything else? That's what the agents are for.";
    }
    if (lower.includes('spawn') || lower.includes('agent')) {
      return "### Agent Spawning Options\n\nI can deploy a new specialized agent. What capability do you need?\n\n- **Content Writer** — drafts blog posts, newsletters\n- **Data Analyst** — tracks metrics, generates reports\n- **Community Manager** — handles member onboarding\n- **Ad Specialist** — manages paid campaigns\n\nJust tell me the role and I'll spin one up.";
    }
    const defaults = [
      "Understood. The community is growing, content engagement is strong, and revenue trajectory is positive. **What should I optimize?**",
      "Noted. I'll adjust the operational plan. *Your job is the heart of HeartBased.* My job is everything else.",
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: `m${Date.now()}`,
      from: 'tiger',
      fromName: 'Tiger',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      type: 'message',
    };
    setMessages(prev => [...prev, userMsg]);

    if (isLive) {
      try {
        const result = await api.sendMessageToCEA(content, threadId);
        if (!threadId) setThreadId(result.thread_id);
        const ceaMsg: Message = {
          id: `m${Date.now() + 1}`,
          from: 'cea',
          fromName: 'The CEA',
          content: result.response,
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          type: content.includes('?') ? 'report' : 'directive',
        };
        setMessages(prev => [...prev, ceaMsg]);
      } catch (e) {
        console.error('CEA brain error, falling back:', e);
        setTimeout(() => {
          const response = generateCeaResponse(content);
          setMessages(prev => [...prev, {
            id: `m${Date.now() + 1}`, from: 'cea', fromName: 'The CEA',
            content: response,
            timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            type: 'directive',
          }]);
        }, 1500);
      }
    } else {
      setTimeout(() => {
        const response = generateCeaResponse(content);
        setMessages(prev => [...prev, {
          id: `m${Date.now() + 1}`, from: 'cea', fromName: 'The CEA',
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          type: content.includes('?') ? 'report' : 'directive',
        }]);
      }, 1800);
    }
  }, [isLive, threadId, generateCeaResponse]);

  const handleSpawnAgent = useCallback(async (name: string, emoji: string, role: string, description: string) => {
    if (isLive) {
      try {
        const result = await api.spawnAgent(`@${name.replace(/\s/g, '_')}`, role, description);
        if (result.data) {
          setAgents(prev => [...prev, mapAgent(result.data)]);
          setActivity(prev => [{
            id: `a${Date.now()}`, agent: 'The CEA', agentEmoji: '🧠',
            action: 'Spawned agent', detail: `Deployed "${name}" (${role})`,
            timestamp: 'Just now', type: 'spawn',
          }, ...prev]);
          return;
        }
      } catch (e) { console.error('Spawn error:', e); }
    }

    const newAgent: Agent = {
      id: `agent-${Date.now()}`, name, role, emoji, status: 'spawning',
      description, tasksCompleted: 0, currentTask: 'Initializing...',
      uptime: '0m', metrics: {},
    };
    setAgents(prev => [...prev, newAgent]);
    setActivity(prev => [{
      id: `a${Date.now()}`, agent: 'The CEA', agentEmoji: '🧠',
      action: 'Spawned agent', detail: `Deployed "${name}" (${role})`,
      timestamp: 'Just now', type: 'spawn',
    }, ...prev]);
    setTimeout(() => {
      setAgents(prev => prev.map(a => a.id === newAgent.id ? { ...a, status: 'active', uptime: '1m' } : a));
    }, 3000);
  }, [isLive]);

  const handleUpdateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    const statusMap: Record<string, string> = { pending: 'todo', in_progress: 'in_progress', review: 'in_progress', completed: 'done' };

    if (isLive) {
      try {
        await api.updateTaskStatus(taskId, statusMap[status] || status);
      } catch (e) { console.error('Task update error:', e); }
    }

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: status === 'completed' ? 'Completed' : status === 'in_progress' ? 'Started' : 'Updated',
        detail: task.title, timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, tasks]);

  // Full task update (title, description, priority, assignee, project)
  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

    if (isLive) {
      try {
        const priorityMap: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
        await api.updateTaskFull(taskId, {
          description: updates.title || updates.description,
          priority: updates.priority ? priorityMap[updates.priority] : undefined,
          assignedTo: updates.assignedTo,
          projectId: updates.projectId,
        });
      } catch (e) { console.error('Task full update error:', e); }
    }

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const changes: string[] = [];
      if (updates.title) changes.push('title');
      if (updates.description) changes.push('description');
      if (updates.priority) changes.push(`priority → ${updates.priority}`);
      if (updates.assignedTo) changes.push('assignee');
      if (updates.projectId !== undefined) changes.push('project');

      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: 'Updated task', detail: `${task.title}: ${changes.join(', ')}`,
        timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, tasks]);

  // Create task
  const handleCreateTask = useCallback(async (taskData: { title: string; description: string; priority: Task['priority']; assignedTo: string; projectId?: string; parentTaskId?: string }) => {
    const priorityMap: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
    const project = projects.find(p => p.id === taskData.projectId);

    // Optimistic add
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      assignedBy: 'tiger',
      priority: taskData.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      tags: [],
      projectId: taskData.projectId,
      projectName: project ? project.title.replace(/^PR\.\w+\s*\|\s*/, '') : undefined,
      projectShortCode: project?.shortCode,
      parentTaskId: taskData.parentTaskId,
    };
    setTasks(prev => [tempTask, ...prev]);

    if (isLive) {
      try {
        const result = await api.createTask(taskData.description, priorityMap[taskData.priority] || 3, taskData.assignedTo === 'tiger' ? undefined : taskData.assignedTo, taskData.projectId, taskData.parentTaskId);
        // Replace temp task with real one
        if (result.data?.[0]) {
          setTasks(prev => prev.map(t => t.id === tempTask.id ? { ...tempTask, id: result.data[0].id } : t));
        }
      } catch (e) { console.error('Create task error:', e); }
    }

    setActivity(prev => [{
      id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
      action: 'Created task', detail: taskData.title,
      timestamp: 'Just now', type: 'task',
    }, ...prev]);
  }, [isLive, projects]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));

    if (isLive) {
      try {
        await api.deleteTask(taskId);
      } catch (e) { console.error('Delete task error:', e); }
    }

    if (task) {
      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: 'Deleted task', detail: task.title,
        timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, tasks]);

  const handleUpdateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));

    if (isLive) {
      try {
        await api.updateProject(projectId, {
          status: updates.status,
          description: updates.description,
          targetDate: updates.targetDate,
          notes: updates.notes,
        });
      } catch (e) { console.error('Project update error:', e); }
    }

    const project = projects.find(p => p.id === projectId);
    if (project) {
      const changes: string[] = [];
      if (updates.status) changes.push(`status → ${updates.status}`);
      if (updates.description !== undefined) changes.push('description');
      if (updates.notes !== undefined) changes.push('notes');
      if (updates.targetDate !== undefined) changes.push('target date');

      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: 'Updated project',
        detail: `${project.shortCode}: ${changes.join(', ')}`,
        timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, projects]);

  // Update goal (expanded: supports title, description, target_date too)
  const handleUpdateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));

    if (isLive) {
      try {
        await api.updateGoal(goalId, {
          progress: updates.progress,
          status: updates.status,
          title: updates.title,
          description: (updates as any).description,
          target_date: updates.targetDate,
        });
      } catch (e) { console.error('Goal update error:', e); }
    }

    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const changes: string[] = [];
      if (updates.progress !== undefined) changes.push(`progress → ${updates.progress}%`);
      if (updates.status) changes.push(`status → ${updates.status}`);
      if (updates.title) changes.push('title');
      if ((updates as any).description !== undefined) changes.push('description');
      if (updates.targetDate !== undefined) changes.push('target date');

      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: 'Updated goal', detail: `${updates.title || goal.title}: ${changes.join(', ')}`,
        timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, goals]);

  // Create goal
  const handleCreateGoal = useCallback(async (data: { title: string; description?: string; ownerAgentId?: string; targetDate?: string }) => {
    const ownerAgent = data.ownerAgentId ? agents.find(a => a.id === data.ownerAgentId) : null;
    const emojiMap: Record<string, string> = {
      '@CEA': '🧠', '@Chief_of_Staff': '📋', '@Editor_in_Chief': '✍️',
      '@Growth_Lead': '📈', '@VP_of_Engineering': '⚙️',
    };

    const tempGoal: Goal = {
      id: `temp-${Date.now()}`,
      title: data.title,
      progress: 0,
      status: 'on-track',
      ownerAgentId: data.ownerAgentId,
      ownerName: ownerAgent?.name || 'Unassigned',
      ownerEmoji: ownerAgent ? (emojiMap[ownerAgent.role] || '🤖') : '🎯',
      targetDate: data.targetDate,
      initiatives: [],
    };
    setGoals(prev => [...prev, tempGoal]);

    if (isLive) {
      try {
        const result = await api.createGoal(data.title, data.description, data.ownerAgentId, data.targetDate, 'Q1-2026');
        if (result?.data?.[0]) {
          setGoals(prev => prev.map(g => g.id === tempGoal.id ? { ...tempGoal, id: result.data[0].id } : g));
        }
      } catch (e) { console.error('Create goal error:', e); }
    }

    setActivity(prev => [{
      id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
      action: 'Created goal', detail: data.title,
      timestamp: 'Just now', type: 'task',
    }, ...prev]);
  }, [isLive, agents]);

  // Delete goal
  const handleDeleteGoal = useCallback(async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));

    if (isLive) {
      try {
        await api.deleteGoal(goalId);
      } catch (e) { console.error('Delete goal error:', e); }
    }

    if (goal) {
      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: 'Deleted goal', detail: goal.title,
        timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, goals]);

  // Departments from raw data
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  // Create project
  const handleCreateProject = useCallback(async (data: { title: string; deptId?: string; description?: string; parentProjectId?: string }) => {
    const dept = departments.find(d => d.id === data.deptId);
    const parentProject = data.parentProjectId ? projects.find(p => p.id === data.parentProjectId) : null;

    const tempProject: Project = {
      id: `temp-${Date.now()}`,
      title: data.title,
      shortCode: data.title.match(/^PR\.(\w+)/)?.[1] || data.title.substring(0, 4).toUpperCase(),
      description: data.description,
      status: 'active',
      department: dept?.name || parentProject?.department || 'Unknown',
      departmentId: data.deptId || parentProject?.departmentId,
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: new Date().toISOString(),
      parentProjectId: data.parentProjectId,
    };
    setProjects(prev => [tempProject, ...prev]);

    if (isLive) {
      try {
        const result = await api.createProject(data.title, data.deptId, data.description, undefined, undefined, data.parentProjectId);
        if (result?.data?.[0]) {
          setProjects(prev => prev.map(p => p.id === tempProject.id ? { ...tempProject, id: result.data[0].id } : p));
        }
      } catch (e) { console.error('Create project error:', e); }
    }

    setActivity(prev => [{
      id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
      action: 'Created project', detail: data.title,
      timestamp: 'Just now', type: 'task',
    }, ...prev]);
  }, [isLive, departments, projects]);

  // Delete project
  const handleDeleteProject = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    // Unlink child projects locally
    setProjects(prev => prev.filter(p => p.id !== projectId).map(p => p.parentProjectId === projectId ? { ...p, parentProjectId: undefined } : p));
    // Unlink tasks locally
    setTasks(prev => prev.map(t => t.projectId === projectId ? { ...t, projectId: undefined, projectName: undefined, projectShortCode: undefined } : t));

    if (isLive) {
      try {
        await api.deleteProject(projectId);
      } catch (e) { console.error('Delete project error:', e); }
    }

    if (project) {
      setActivity(prev => [{
        id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
        action: 'Deleted project', detail: project.title,
        timestamp: 'Just now', type: 'task',
      }, ...prev]);
    }
  }, [isLive, projects]);

  // Feature Request handlers
  const handleCreateFeatureRequest = useCallback(async (data: { title: string; description?: string; screenshotUrl?: string; sourceView?: string; priority?: string }) => {
    // Optimistic add
    const tempFr: FeatureRequest = {
      id: `temp-${Date.now()}`,
      title: data.title,
      description: data.description,
      screenshotUrl: data.screenshotUrl,
      sourceView: data.sourceView,
      status: 'new',
      priority: (data.priority as any) || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFeatureRequests(prev => [tempFr, ...prev]);

    if (isLive) {
      try {
        const result = await api.createFeatureRequest(data.title, data.description, data.screenshotUrl, data.sourceView, data.priority);
        if (result?.data?.[0]) {
          setFeatureRequests(prev => prev.map(fr => fr.id === tempFr.id ? {
            ...tempFr,
            id: result.data[0].id,
            createdAt: result.data[0].created_at,
            updatedAt: result.data[0].updated_at,
          } : fr));
        }
      } catch (e) { console.error('Create feature request error:', e); }
    }

    setActivity(prev => [{
      id: `a${Date.now()}`, agent: 'Tiger', agentEmoji: '🐯',
      action: 'Captured idea', detail: data.title,
      timestamp: 'Just now', type: 'task',
    }, ...prev]);
  }, [isLive]);

  const handleUpdateFeatureRequest = useCallback(async (id: string, updates: { status?: string; priority?: string; title?: string; description?: string }) => {
    setFeatureRequests(prev => prev.map(fr => fr.id === id ? { ...fr, ...updates, updatedAt: new Date().toISOString() } as FeatureRequest : fr));
    if (isLive) {
      try {
        await api.updateFeatureRequest(id, updates);
      } catch (e) { console.error('Update feature request error:', e); }
    }
  }, [isLive]);

  const handleDeleteFeatureRequest = useCallback(async (id: string) => {
    setFeatureRequests(prev => prev.filter(fr => fr.id !== id));
    if (isLive) {
      try {
        await api.deleteFeatureRequest(id);
      } catch (e) { console.error('Delete feature request error:', e); }
    }
  }, [isLive]);

  // Agent Profile handler
  const handleUpdateAgent = useCallback(async (agentId: string, updates: { system_prompt?: string; functional_name?: string; tool_access?: string[]; is_active?: boolean }) => {
    if (isLive) {
      try {
        await api.updateAgent(agentId, updates);
      } catch (e) { console.error('Agent update error:', e); }
    }

    // Update local state
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a;
      const updated = { ...a };
      if (updates.functional_name) updated.role = updates.functional_name;
      if (updates.is_active !== undefined) updated.status = updates.is_active ? 'active' : 'idle';
      return updated;
    }));
  }, [isLive]);

  const newIdeaCount = featureRequests.filter(fr => fr.status === 'new').length;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Connection status indicator */}
      <div className="fixed top-2 right-3 z-50">
        <span className={`text-[9px] px-2 py-1 ${isLive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
          {loading ? '◌ Connecting...' : isLive ? '● Live · Media HQ' : '○ Demo Mode'}
        </span>
      </div>

      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        agents={agents}
        pendingTaskCount={pendingTaskCount}
        projectCount={projects.length}
        ideaCount={newIdeaCount}
        onSignOut={() => signOut()}
      />
      {currentView === 'dashboard' && (
        <Dashboard kpis={kpis} activity={activity} tasks={tasks} agents={agents} projects={projects} onNavigate={(v) => setCurrentView(v as ViewType)} />
      )}
      {currentView === 'projects' && (
        <ProjectsView
          projects={projects} tasks={tasks} agents={agents} departments={departments}
          onNavigateToTask={() => setCurrentView('tasks')}
          onUpdateProject={handleUpdateProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onOpenProject={(id) => { setSelectedProjectId(id); setCurrentView('project-detail'); }}
        />
      )}
      {currentView === 'project-detail' && selectedProjectId && (() => {
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return null;
        return (
          <ProjectDetail
            project={project}
            tasks={tasks}
            agents={agents}
            onBack={() => setCurrentView('projects')}
            onUpdateProject={handleUpdateProject}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTask={handleUpdateTask}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      })()}
      {currentView === 'agents' && (
        <AgentHub agents={agents} onSpawnAgent={handleSpawnAgent} onViewAgent={(id) => { setSelectedAgentId(id); setCurrentView('agent-detail'); }} />
      )}
      {currentView === 'agent-detail' && selectedAgentId && (() => {
        const agent = agents.find(a => a.id === selectedAgentId);
        if (!agent) return null;
        return (
          <AgentDetail
            agent={agent}
            onBack={() => setCurrentView('agents')}
            onUpdateAgent={handleUpdateAgent}
          />
        );
      })()}
      {currentView === 'ideas' && (
        <IdeasView
          featureRequests={featureRequests}
          onUpdateFeatureRequest={handleUpdateFeatureRequest}
          onDeleteFeatureRequest={handleDeleteFeatureRequest}
        />
      )}
      {currentView === 'tasks' && (
        <TaskBoard
          tasks={tasks}
          agents={agents}
          projects={projects}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onUpdateTask={handleUpdateTask}
          onCreateTask={handleCreateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
      {currentView === 'chat' && (
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
      )}
      {currentView === 'strategy' && (
        <Strategy kpis={kpis} agents={agents} goals={goals} onUpdateGoal={handleUpdateGoal} onCreateGoal={handleCreateGoal} onDeleteGoal={handleDeleteGoal} />
      )}

      {/* Quick Task FAB + Modal */}
      <TaskFAB onClick={() => setTaskModalOpen(true)} taskCount={pendingTaskCount} />
      <TaskCaptureModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        agents={agents}
        projects={projects}
      />

      {/* Idea Capture FAB + Modal */}
      <IdeaFAB onClick={() => setIdeaModalOpen(true)} ideaCount={newIdeaCount} />
      <IdeaCaptureModal
        isOpen={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        onSubmit={handleCreateFeatureRequest}
        currentView={currentView}
      />
    </div>
  );
}

export default App;
