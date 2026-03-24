import { afterEach, describe, expect, it } from 'vitest';

import {
  createApprovalRequest,
  pathResolver,
  safeExistsSync,
  safeRmSync,
  safeWriteFile,
  withExecutionContext,
} from './index.js';
import { executeLocalReadTool, listLocalReadToolDefinitions } from './local-provider-tools.js';

describe('local provider tools', () => {
  const missionId = 'MSN-LOCAL-TOOL-001';
  const missionPath = pathResolver.rootResolve(`active/missions/public/${missionId}`);
  const slackCoordination = pathResolver.rootResolve('active/shared/coordination/channels/slack');
  const slackObservability = pathResolver.rootResolve('active/shared/observability/channels/slack');

  afterEach(() => {
    withExecutionContext('software_developer', () => {
      if (safeExistsSync(missionPath)) safeRmSync(missionPath);
    }, 'ecosystem_architect');
    withExecutionContext('slack_bridge', () => {
      if (safeExistsSync(slackCoordination)) safeRmSync(slackCoordination);
      if (safeExistsSync(slackObservability)) safeRmSync(slackObservability);
    });
  });

  it('publishes the expected read-only local tool catalog', () => {
    expect(listLocalReadToolDefinitions().map((tool) => tool.name)).toEqual([
      'load_mission_overview',
      'load_runtime_topology',
      'load_pending_approvals',
      'read_governed_artifact',
      'list_governed_dir',
    ]);
  });

  it('loads mission overview from governed mission artifacts', async () => {
    withExecutionContext('software_developer', () => {
      safeWriteFile(`active/missions/public/${missionId}/mission-state.json`, JSON.stringify({
        mission_id: missionId,
        status: 'active',
        tier: 'public',
        mission_type: 'development',
      }, null, 2));
      safeWriteFile(`active/missions/public/${missionId}/TASK_BOARD.md`, [
        '# Task Board',
        '',
        '## Status: In Progress',
        '- [x] Step 1',
        '- [~] Step 2',
        '- [ ] Step 3',
      ].join('\n'));
      safeWriteFile(`active/missions/public/${missionId}/NEXT_TASKS.json`, JSON.stringify([
        { status: 'planned' },
        { status: 'completed' },
      ], null, 2));
    }, 'ecosystem_architect');

    const result = await executeLocalReadTool({ tool: 'load_mission_overview', missionId }) as any;
    expect(result).toMatchObject({
      mission_id: missionId,
      status: 'active',
      tier: 'public',
      plan_ready: false,
      task_board: {
        status: 'In Progress',
        steps_total: 3,
        steps_done: 1,
        steps_active: 1,
        steps_pending: 1,
      },
      next_tasks: {
        total: 2,
        pending: 1,
        completed: 1,
      },
    });
  });

  it('loads pending secret approvals', async () => {
    withExecutionContext('slack_bridge', () => {
      createApprovalRequest('slack_bridge', {
        channel: 'C123',
        storageChannel: 'slack',
        threadTs: '1.0',
        correlationId: 'corr-secret-local-tool',
        requestedBy: 'slack-bridge',
        draft: {
          title: 'Rotate token',
          summary: 'Need approval to rotate secret',
        },
        kind: 'secret_mutation',
        target: {
          serviceId: 'slack',
          secretKey: 'SLACK_BOT_TOKEN',
          mutation: 'rotate',
        },
        risk: {
          level: 'high',
          restartScope: 'service',
          requiresStrongAuth: true,
        },
        workflow: {
          workflowId: 'wf-secret',
          mode: 'all_required',
          requiredRoles: ['sovereign'],
          stages: [{ stageId: 'primary', requiredRoles: ['sovereign'] }],
          approvals: [{ role: 'sovereign', status: 'pending' }],
        },
      });
    });

    const result = await executeLocalReadTool({ tool: 'load_pending_approvals', kind: 'secret_mutation' }) as any;
    expect(result.count).toBe(1);
    expect(result.requests[0]).toMatchObject({
      kind: 'secret_mutation',
      service_id: 'slack',
      secret_key: 'SLACK_BOT_TOKEN',
      risk_level: 'high',
      pending_roles: ['sovereign'],
    });
  });

  it('lists mission-safe artifact directories and reads artifact files', async () => {
    withExecutionContext('software_developer', () => {
      safeWriteFile(`active/missions/public/${missionId}/deliverables/report.md`, '# Report\n\nhello');
    }, 'ecosystem_architect');

    const listing = await executeLocalReadTool({
      tool: 'list_governed_dir',
      path: `active/missions/public/${missionId}/deliverables`,
    }) as any;
    expect(listing.entries[0]).toMatchObject({
      name: 'report.md',
      type: 'file',
    });

    const content = await executeLocalReadTool({
      tool: 'read_governed_artifact',
      path: `active/missions/public/${missionId}/deliverables/report.md`,
    }) as any;
    expect(content.content).toContain('hello');
  });
});
