import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import { safeWriteFile } from '@agent/core';

const API_KEY = process.env.GEMINI_INCIDENT_API_KEY;
const SPACE_URL = process.env.GEMINI_INCIDENT_SPACE_URL;
const PROJECT_ID = process.env.GEMINI_INCIDENT_PROJECT_ID; // NBS_INCIDENT

async function fetchAllIssues(): Promise<void> {
  if (!API_KEY) {
    console.error('ERROR: GEMINI_INCIDENT_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const allIssues: any[] = [];
  let offset = 0;
  const count = 100;

  console.log('Starting full data collection from Backlog...');

  while (true) {
    const url = `${SPACE_URL}/api/v2/issues?apiKey=${API_KEY}&projectId[]=${PROJECT_ID}&count=${count}&offset=${offset}&sort=created&order=desc`;
    try {
      // Use curl via execSync for simple direct API call without extra dependencies
      const response = execSync(`curl -s "${url}"`, { encoding: 'utf8' });
      const issues = JSON.parse(response);

      if (!Array.isArray(issues) || issues.length === 0) break;

      allIssues.push(...issues);
      console.log(`Fetched ${allIssues.length} issues...`);

      if (issues.length < count) break;
      offset += count;
    } catch (e: any) {
      console.error('Fetch failed:', e.message);
      break;
    }
  }

  const outPath = 'active/shared/nbs_incidents_all.json';
  safeWriteFile(outPath, JSON.stringify(allIssues, null, 2));
  console.log(`Total ${allIssues.length} issues saved to ${outPath}`);
}

fetchAllIssues().catch(err => {
  console.error(err);
  process.exit(1);
});
