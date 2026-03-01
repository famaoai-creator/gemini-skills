/**
 * Google Workspace Integrator - CLI Entry Point
 * Implements 'fetch-agenda' and 'auth' actions.
 */

// @ts-ignore
const { runSkillAsync } = require('@agent/core');
const { getGoogleAuth, fetchAgenda, formatAgenda } = require('./lib');
const { logger, safeWriteFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
const path = require('node:path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

async function main() {
  await runSkillAsync('google-workspace-integrator', async () => {
    const argv = yargs(hideBin(process.argv)).argv;
    const action = argv.action || argv._[0] || 'fetch-agenda';
    const auth = await getGoogleAuth();

    if (auth.status === 'missing_creds') {
      throw new Error('Google API Credentials missing. Please place google-credentials.json in knowledge/personal/connections/google/.');
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
        instructions: '1. Visit the URL. 2. Authorize. 3. Save the resulting token.json to knowledge/personal/connections/google/google-token.json'
      };
    }

    switch (action) {
      case 'fetch-agenda':
        logger.info('📅 Fetching CEO Agenda...');
        const events = await fetchAgenda(auth.client, argv.limit || 5);
        const output = formatAgenda(events);
        
        const artifactPath = path.join(pathResolver.active('shared'), `ceo_agenda_${Date.now()}.md`);
        safeWriteFile(artifactPath, output);

        return {
          agenda: output,
          artifact: artifactPath,
          event_count: events.length
        };

      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
