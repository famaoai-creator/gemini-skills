/**
 * Google Workspace Integrator - CLI Entry Point
 * Implements 'fetch-agenda' and 'auth' actions.
 */

// @ts-ignore
import { runSkill } from '@agent/core';
import { getGoogleAuth, fetchAgenda, formatAgenda } from './lib';
const { logger, safeWriteFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
import * as path from 'node:path';

interface SkillArgs {
  action?: string;
  limit?: number;
  _: string[];
}

runSkill('google-workspace-integrator', async (args: SkillArgs) => {
  // Ensure args is defined
  const safeArgs = args || { _: [] };
  const action = safeArgs.action || (safeArgs._ && safeArgs._[0]) || 'fetch-agenda';
  const auth = await getGoogleAuth();

  if (auth.status === 'missing_creds') {
    throw new Error('Google API Credentials missing. Please place google-credentials.json in knowledge/personal/.');
  }

  if (auth.status === 'needs_auth') {
    const authUrl = auth.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    return {
      status: 'needs_attention',
      message: 'Authentication required.',
      auth_url: authUrl,
      instructions: '1. Visit the URL. 2. Authorize. 3. Save the resulting token.json to knowledge/personal/google-token.json'
    };
  }

  switch (action) {
    case 'fetch-agenda':
      logger.info('📅 Fetching CEO Agenda...');
      const events = await fetchAgenda(auth.client, safeArgs.limit || 5);
      const output = formatAgenda(events);
      
      const artifactPath = path.join(pathResolver.active('shared'), `ceo_agenda_${Date.now()}.md`);
      safeWriteFile(artifactPath, output);

      return {
        status: 'success',
        data: {
          agenda: output,
          artifact: artifactPath,
          event_count: events.length
        }
      };

    default:
      throw new Error(`Unsupported action: ${action}`);
  }
});
