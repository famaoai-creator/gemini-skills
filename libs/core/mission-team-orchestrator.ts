import { agentLifecycle } from './agent-lifecycle.js';
import { agentRegistry } from './agent-registry.js';
import { loadAgentProfileIndex, loadMissionTeamPlan, type MissionTeamAssignment } from './mission-team-composer.js';

export interface MissionTeamRuntimeAssignment extends MissionTeamAssignment {
  runtime_status: 'spawned' | 'already_ready' | 'unfilled' | 'failed';
  error?: string;
}

export interface MissionTeamRuntimePlan {
  mission_id: string;
  assignments: MissionTeamRuntimeAssignment[];
}

function isReady(agentId: string): boolean {
  const record = agentRegistry.get(agentId);
  return record?.status === 'ready' || record?.status === 'busy';
}

export async function ensureMissionTeamRuntime(missionId: string): Promise<MissionTeamRuntimePlan> {
  const plan = loadMissionTeamPlan(missionId);
  if (!plan) {
    throw new Error(`Mission team plan not found for ${missionId}`);
  }

  const profiles = loadAgentProfileIndex();
  const assignments: MissionTeamRuntimeAssignment[] = [];

  for (const assignment of plan.assignments) {
    if (assignment.status !== 'assigned' || !assignment.agent_id) {
      assignments.push({
        ...assignment,
        runtime_status: 'unfilled',
      });
      continue;
    }

    if (isReady(assignment.agent_id)) {
      assignments.push({
        ...assignment,
        runtime_status: 'already_ready',
      });
      continue;
    }

    const profile = profiles[assignment.agent_id];
    if (!profile) {
      assignments.push({
        ...assignment,
        runtime_status: 'failed',
        error: `Agent profile not found: ${assignment.agent_id}`,
      });
      continue;
    }

    try {
      await agentLifecycle.spawn({
        agentId: assignment.agent_id,
        provider: profile.provider,
        modelId: profile.modelId,
        capabilities: profile.capabilities,
        missionId: missionId.toUpperCase(),
      });
      assignments.push({
        ...assignment,
        runtime_status: 'spawned',
      });
    } catch (error) {
      assignments.push({
        ...assignment,
        runtime_status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    mission_id: plan.mission_id,
    assignments,
  };
}
