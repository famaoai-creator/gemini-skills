import * as path from 'node:path';

import { listApprovalRequests } from './approval-store.js';
import { listAgentRuntimeLeaseSummaries, listAgentRuntimeSnapshots } from './agent-runtime-supervisor.js';
import { listGovernedArtifacts, readGovernedArtifactJson, resolveGovernedArtifactPath } from './artifact-store.js';
import { loadSurfaceManifest, loadSurfaceState, normalizeSurfaceDefinition } from './surface-runtime.js';
import { pathResolver } from './path-resolver.js';
import { safeExistsSync, safeReadFile, safeReaddir, safeStat } from './secure-io.js';

export type LocalReadToolName =
  | 'load_mission_overview'
  | 'load_runtime_topology'
  | 'load_pending_approvals'
  | 'read_governed_artifact'
  | 'list_governed_dir';

export interface LocalReadToolDefinition {
  name: LocalReadToolName;
  description: string;
  readOnly: true;
  params: string[];
}

export type LocalReadToolCall =
  | { tool: 'load_mission_overview'; missionId: string }
  | { tool: 'load_runtime_topology' }
  | { tool: 'load_pending_approvals'; kind?: 'channel-approval' | 'secret_mutation' }
  | { tool: 'read_governed_artifact'; path: string }
  | { tool: 'list_governed_dir'; path: string };

export function listLocalReadToolDefinitions(): LocalReadToolDefinition[] {
  return [
    {
      name: 'load_mission_overview',
      description: 'Load mission status, task board summary, and next-task counts for one mission.',
      readOnly: true,
      params: ['missionId'],
    },
    {
      name: 'load_runtime_topology',
      description: 'Load managed runtime, lease, and surface summary information.',
      readOnly: true,
      params: [],
    },
    {
      name: 'load_pending_approvals',
      description: 'Load pending approval requests, optionally filtered by kind.',
      readOnly: true,
      params: ['kind?'],
    },
    {
      name: 'read_governed_artifact',
      description: 'Read one governed artifact or mission-safe artifact file.',
      readOnly: true,
      params: ['path'],
    },
    {
      name: 'list_governed_dir',
      description: 'List entries in an allowed governed or mission-safe directory.',
      readOnly: true,
      params: ['path'],
    },
  ];
}

export async function executeLocalReadTool(call: LocalReadToolCall): Promise<unknown> {
  switch (call.tool) {
    case 'load_mission_overview':
      return loadMissionOverview(call.missionId);
    case 'load_runtime_topology':
      return loadRuntimeTopologySummary();
    case 'load_pending_approvals':
      return loadPendingApprovals(call.kind);
    case 'read_governed_artifact':
      return readGovernedArtifact(call.path);
    case 'list_governed_dir':
      return listGovernedDir(call.path);
    default: {
      const exhaustive: never = call;
      throw new Error(`Unsupported local read tool: ${String(exhaustive)}`);
    }
  }
}

function parseTaskBoard(taskBoard: string) {
  const statusMatch = taskBoard.match(/^## Status:\s+(.+)$/m);
  const stepLines = taskBoard.match(/^- \[(?: |x|~)\] Step .+$/gm) || [];
  let done = 0;
  let active = 0;
  let pending = 0;

  for (const line of stepLines) {
    if (line.includes('[x]')) done += 1;
    else if (line.includes('[~]')) active += 1;
    else pending += 1;
  }

  return {
    status: statusMatch?.[1]?.trim() || 'Unknown',
    steps_total: stepLines.length,
    steps_done: done,
    steps_active: active,
    steps_pending: pending,
  };
}

function summarizeNextTasks(tasks: Array<{ status?: string }>) {
  let pending = 0;
  let completed = 0;
  for (const task of tasks) {
    const status = task.status || 'planned';
    if (status === 'completed' || status === 'done' || status === 'accepted') completed += 1;
    else pending += 1;
  }
  return {
    total: tasks.length,
    pending,
    completed,
  };
}

function loadMissionOverview(missionId: string) {
  const missionPath = pathResolver.findMissionPath(missionId);
  if (!missionPath) {
    throw new Error(`Mission not found: ${missionId}`);
  }

  const statePath = path.join(missionPath, 'mission-state.json');
  const taskBoardPath = path.join(missionPath, 'TASK_BOARD.md');
  const nextTasksPath = path.join(missionPath, 'NEXT_TASKS.json');

  const state = safeExistsSync(statePath)
    ? JSON.parse(safeReadFile(statePath, { encoding: 'utf8' }) as string) as Record<string, unknown>
    : {};
  const taskBoard = safeExistsSync(taskBoardPath)
    ? String(safeReadFile(taskBoardPath, { encoding: 'utf8' }) || '')
    : '';
  const nextTasks = safeExistsSync(nextTasksPath)
    ? JSON.parse(safeReadFile(nextTasksPath, { encoding: 'utf8' }) as string) as Array<{ status?: string }>
    : [];

  return {
    mission_id: missionId,
    status: String(state.status || 'unknown'),
    tier: String(state.tier || 'unknown'),
    mission_type: typeof state.mission_type === 'string' ? state.mission_type : undefined,
    plan_ready: safeExistsSync(path.join(missionPath, 'PLAN.md')),
    task_board: parseTaskBoard(taskBoard),
    next_tasks: summarizeNextTasks(nextTasks),
  };
}

function loadRuntimeTopologySummary() {
  const runtimeSnapshots = listAgentRuntimeSnapshots();
  const runtimeLeases = listAgentRuntimeLeaseSummaries();
  const surfaceManifest = loadSurfaceManifest();
  const surfaceState = loadSurfaceState();

  return {
    runtime: {
      total: runtimeSnapshots.length,
      ready: runtimeSnapshots.filter((entry) => entry.agent.status === 'ready').length,
      busy: runtimeSnapshots.filter((entry) => entry.agent.status === 'busy').length,
      error: runtimeSnapshots.filter((entry) => entry.agent.status === 'error').length,
    },
    surfaces: surfaceManifest.surfaces
      .map(normalizeSurfaceDefinition)
      .map((surface) => {
        const record = surfaceState.surfaces[surface.id];
        return {
          id: surface.id,
          kind: surface.kind,
          running: Boolean(record),
          startup_mode: surface.startupMode,
          pid: record?.pid,
        };
      }),
    runtimes: runtimeSnapshots.map((snapshot) => ({
      agent_id: snapshot.agent.agentId,
      provider: snapshot.agent.provider,
      model_id: snapshot.agent.modelId,
      status: snapshot.agent.status,
      mission_id: snapshot.agent.missionId || null,
      session_id: snapshot.agent.sessionId,
    })),
    leases: runtimeLeases.map((lease) => ({
      agent_id: lease.agent_id,
      owner_id: lease.owner_id,
      owner_type: lease.owner_type,
      metadata: lease.metadata || {},
    })),
  };
}

function loadPendingApprovals(kind?: 'channel-approval' | 'secret_mutation') {
  const requests = listApprovalRequests({
    status: 'pending',
    ...(kind ? { kind } : {}),
  });
  return {
    count: requests.length,
    requests: requests.map((request) => ({
      request_id: request.id,
      kind: request.kind,
      storage_channel: request.storageChannel,
      title: request.title,
      summary: request.summary,
      status: request.status,
      requested_at: request.requestedAt,
      requested_by: request.requestedBy,
      service_id: request.target?.serviceId,
      secret_key: request.target?.secretKey,
      mutation: request.target?.mutation,
      risk_level: request.risk?.level,
      pending_roles: request.workflow?.approvals.filter((approval) => approval.status === 'pending').map((approval) => approval.role) || [],
    })),
  };
}

function isMissionSafePath(logicalPath: string): boolean {
  const normalized = logicalPath.replace(/\\/g, '/');
  return /^active\/missions\/(?:public|confidential|personal)\/[^/]+\/(?:mission-state\.json|PLAN\.md|TASK_BOARD\.md|NEXT_TASKS\.json|deliverables\/.+|artifacts\/.+|outputs\/.+|evidence\/.+)$/.test(normalized);
}

function isMissionSafeDir(logicalPath: string): boolean {
  const normalized = logicalPath.replace(/\\/g, '/').replace(/\/$/, '');
  return /^active\/missions\/(?:public|confidential|personal)\/[^/]+\/(?:deliverables|artifacts|outputs|evidence)$/.test(normalized);
}

function resolveReadablePath(logicalPath: string): { kind: 'governed' | 'mission'; resolved: string } {
  if (logicalPath.startsWith('active/shared/coordination/') || logicalPath.startsWith('active/shared/observability/') || logicalPath.startsWith('active/shared/runtime/')) {
    return { kind: 'governed', resolved: resolveGovernedArtifactPath(logicalPath) };
  }
  if (isMissionSafePath(logicalPath) || isMissionSafeDir(logicalPath)) {
    return { kind: 'mission', resolved: pathResolver.resolve(logicalPath) };
  }
  throw new Error(`Path is not readable through local provider tools: ${logicalPath}`);
}

function readGovernedArtifact(logicalPath: string) {
  const target = resolveReadablePath(logicalPath);
  if (!safeExistsSync(target.resolved)) {
    throw new Error(`Artifact not found: ${logicalPath}`);
  }

  const ext = path.extname(target.resolved).toLowerCase();
  if (ext === '.json' && target.kind === 'governed') {
    return {
      path: logicalPath,
      content: readGovernedArtifactJson(logicalPath),
    };
  }

  const content = safeReadFile(target.resolved, { encoding: 'utf8' }) as string;
  return {
    path: logicalPath,
    content,
  };
}

function listGovernedDir(logicalPath: string) {
  const target = resolveReadablePath(logicalPath.endsWith('/') ? logicalPath.slice(0, -1) : logicalPath);
  if (target.kind === 'governed') {
    const relative = logicalPath.replace(/\/$/, '');
    return {
      path: relative,
      entries: listGovernedArtifacts(relative),
    };
  }
  if (!safeExistsSync(target.resolved)) {
    throw new Error(`Directory not found: ${logicalPath}`);
  }
  return {
    path: logicalPath,
    entries: safeReaddir(target.resolved).sort().map((entry) => {
      const full = path.join(target.resolved, entry);
      const stats = safeStat(full);
      return {
        name: entry,
        type: stats.isDirectory() ? 'dir' : 'file',
        size_bytes: stats.size,
      };
    }),
  };
}
