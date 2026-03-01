/**
 * Google Workspace Integrator - Core Library
 * Provides helpers for Auth and Calendar operations.
 * Strictly uses @agent/core/secure-io for data persistence.
 */

// @ts-ignore
const { google } = require('googleapis');
const { safeReadFile } = require('@agent/core/secure-io');
const pathResolver = require('@agent/core/path-resolver');
import * as fs from 'node:fs';

// --- Auth Paths ---
const CREDENTIALS_PATH = pathResolver.rootResolve('knowledge/personal/connections/google/google-credentials.json');
const TOKEN_PATH = pathResolver.rootResolve('knowledge/personal/connections/google/google-token.json');

export interface GoogleAuthClient {
  client: any;
  status: 'authenticated' | 'needs_auth' | 'missing_creds';
}

/**
 * Initializes the OAuth2 client.
 */
export async function getGoogleAuth(): Promise<GoogleAuthClient> {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return { client: null, status: 'missing_creds' };
  }

  const content = safeReadFile(CREDENTIALS_PATH, { encoding: 'utf8' }) as string;
  const keys = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = keys.installed || keys.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (!fs.existsSync(TOKEN_PATH)) {
    return { client: oAuth2Client, status: 'needs_auth' };
  }

  const token = JSON.parse(safeReadFile(TOKEN_PATH, { encoding: 'utf8' }) as string);
  oAuth2Client.setCredentials(token);
  return { client: oAuth2Client, status: 'authenticated' };
}

/**
 * Lists upcoming calendar events for the CEO.
 */
export async function fetchAgenda(auth: any, maxResults: number = 10) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.data.items || [];
}

/**
 * Formats agenda items for Slack/Terminal consumption.
 */
export function formatAgenda(events: any[]): string {
  if (events.length === 0) return 'CEO, your schedule is clear for now.';
  
  const formatted = events.map((event: any) => {
    const start = event.start.dateTime || event.start.date;
    return `- [${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${event.summary}`;
  });

  return `### 🗓️ CEO Agenda\n\n${formatted.join('\n')}`;
}
