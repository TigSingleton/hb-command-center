const SUPABASE_URL = 'https://gusdhnpsjmpueevnivsi.supabase.co';
const CEA_API = `${SUPABASE_URL}/functions/v1/cea-api`;
const CEA_BRAIN = `${SUPABASE_URL}/functions/v1/cea-brain`;

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ============ READ ============

export async function fetchDashboard() {
  return apiFetch(`${CEA_API}?action=dashboard`);
}

export async function fetchAgents() {
  return apiFetch(`${CEA_API}?action=agents`);
}

export async function fetchTasks() {
  return apiFetch(`${CEA_API}?action=tasks`);
}

export async function fetchMessages(threadId?: string) {
  const params = threadId ? `&thread_id=${threadId}` : '';
  return apiFetch(`${CEA_API}?action=messages${params}`);
}

export async function fetchKPIs(category?: string) {
  const params = category ? `&category=${category}` : '';
  return apiFetch(`${CEA_API}?action=kpis${params}`);
}

export async function fetchGoals() {
  return apiFetch(`${CEA_API}?action=goals`);
}

export async function fetchActivity(limit = 20) {
  return apiFetch(`${CEA_API}?action=activity&limit=${limit}`);
}

// ============ WRITE ============

export async function updateTaskStatus(taskId: string, status: string) {
  return apiFetch(`${CEA_API}?action=update-task`, {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, status }),
  });
}

export async function createTask(description: string, priority: number, assignedTo?: string, projectId?: string) {
  return apiFetch(`${CEA_API}?action=create-task`, {
    method: 'POST',
    body: JSON.stringify({ description, priority, assigned_to: assignedTo, project_id: projectId }),
  });
}

export async function spawnAgent(handle: string, functionalName: string, systemPrompt: string, deptId?: string) {
  return apiFetch(`${CEA_API}?action=spawn-agent`, {
    method: 'POST',
    body: JSON.stringify({ handle, functional_name: functionalName, system_prompt: systemPrompt, dept_id: deptId }),
  });
}

export async function updateKPI(id: string, value: string, numericValue: number, changePercent: number, trend: string) {
  return apiFetch(`${CEA_API}?action=update-kpi`, {
    method: 'POST',
    body: JSON.stringify({ id, value, numeric_value: numericValue, change_percent: changePercent, trend }),
  });
}

export async function updateProject(projectId: string, updates: { status?: string; description?: string; targetDate?: string; notes?: string }) {
  return apiFetch(`${CEA_API}?action=update-project`, {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      status: updates.status,
      description: updates.description,
      target_date: updates.targetDate,
      notes: updates.notes,
    }),
  });
}

export async function createDirective(title: string, directiveType: string, content: string, targetAgentId?: string, priority?: string) {
  return apiFetch(`${CEA_API}?action=create-directive`, {
    method: 'POST',
    body: JSON.stringify({ title, directive_type: directiveType, content, target_agent_id: targetAgentId, priority }),
  });
}

export async function updateTaskFull(taskId: string, updates: { description?: string; priority?: number; assignedTo?: string; projectId?: string }) {
  return apiFetch(`${CEA_API}?action=update-task-full`, {
    method: 'POST',
    body: JSON.stringify({
      task_id: taskId,
      description: updates.description,
      priority: updates.priority,
      assigned_to: updates.assignedTo,
      project_id: updates.projectId,
    }),
  });
}

export async function deleteTask(taskId: string) {
  return apiFetch(`${CEA_API}?action=delete-task`, {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function updateGoal(goalId: string, updates: { progress?: number; status?: string; title?: string; description?: string; target_date?: string; owner_agent_id?: string; initiatives?: any[] }) {
  return apiFetch(`${CEA_API}?action=update-goal`, {
    method: 'POST',
    body: JSON.stringify({
      goal_id: goalId,
      ...updates,
    }),
  });
}

export async function createGoal(title: string, description?: string, ownerAgentId?: string, targetDate?: string, quarter?: string) {
  return apiFetch(`${CEA_API}?action=create-goal`, {
    method: 'POST',
    body: JSON.stringify({ title, description, owner_agent_id: ownerAgentId, target_date: targetDate, quarter }),
  });
}

export async function deleteGoal(goalId: string) {
  return apiFetch(`${CEA_API}?action=delete-goal`, {
    method: 'POST',
    body: JSON.stringify({ goal_id: goalId }),
  });
}

// ============ CEA BRAIN ============

export async function sendMessageToCEA(message: string, threadId?: string): Promise<{ response: string; thread_id: string }> {
  return apiFetch(CEA_BRAIN, {
    method: 'POST',
    body: JSON.stringify({ message, thread_id: threadId }),
  });
}

// ============ FEATURE REQUESTS ============

export async function fetchFeatureRequests(status?: string) {
  const params = status ? `&status=${status}` : '';
  return apiFetch(`${CEA_API}?action=feature-requests${params}`);
}

export async function createFeatureRequest(title: string, description?: string, screenshotUrl?: string, sourceView?: string, priority?: string) {
  return apiFetch(`${CEA_API}?action=create-feature-request`, {
    method: 'POST',
    body: JSON.stringify({ title, description, screenshot_url: screenshotUrl, source_view: sourceView, priority }),
  });
}

export async function updateFeatureRequest(id: string, updates: { status?: string; priority?: string; title?: string; description?: string }) {
  return apiFetch(`${CEA_API}?action=update-feature-request`, {
    method: 'POST',
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function deleteFeatureRequest(id: string) {
  return apiFetch(`${CEA_API}?action=delete-feature-request`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

// ============ AGENT PROFILES ============

export async function updateAgent(agentId: string, updates: { system_prompt?: string; functional_name?: string; tool_access?: string[]; is_active?: boolean }) {
  return apiFetch(`${CEA_API}?action=update-agent`, {
    method: 'POST',
    body: JSON.stringify({ agent_id: agentId, ...updates }),
  });
}
