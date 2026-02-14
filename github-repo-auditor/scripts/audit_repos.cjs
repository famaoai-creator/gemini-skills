#!/usr/bin/env node
const { safeWriteFile } = require('@agent/core/secure-io');

/**
 * github-repo-auditor/scripts/audit_repos.cjs
 * Fetches and classifies organization repositories using GitHub CLI (gh).
 * Enhanced Mapping v2.0
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'knowledge/confidential/context/github-repo-auditor/config.json'),
    'utf8'
  )
);
const ORG = config.org;
const LIMIT = 1000;

function audit() {
  console.log(`Scanning organization: ${ORG}...`);

  try {
    const rawData = execSync(
      `gh repo list ${ORG} --limit ${LIMIT} --json name,description,pushedAt,isArchived`,
      { encoding: 'utf8' }
    );
    const repos = JSON.parse(rawData);

    const mapping = {
      'Internet Banking (IB)': [],
      'TrustIdiom (Auth)': [],
      'eKYC / C-3 Solution': [],
      'IDP / Auth Infrastructure': [],
      'Remit / Wallet / Crypto': [],
      'Financial Cloud (FC)': [],
      'Core Banking': [],
      'Blockchain / DLT': [],
      'Common / Library': [],
      'PoC / Verification': [],
      Unclassified: [],
    };

    const staleRepos = [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    repos.forEach((repo) => {
      const name = repo.name.toLowerCase();
      const lastPush = new Date(repo.pushedAt);

      // Classify
      if (
        name.includes('ib-') ||
        name.includes('sbinbs_') ||
        name.includes('bankingwhitelabel') ||
        name.includes('sbibankingapi')
      ) {
        mapping['Internet Banking (IB)'].push(repo);
      } else if (name.includes('trustid')) {
        mapping['TrustIdiom (Auth)'].push(repo);
      } else if (name.includes('c-3_') || name.includes('ekyc')) {
        mapping['eKYC / C-3 Solution'].push(repo);
      } else if (
        name.includes('idp-') ||
        name.includes('authnz') ||
        name.includes('keycloak') ||
        name.includes('strongauth')
      ) {
        mapping['IDP / Auth Infrastructure'].push(repo);
      } else if (
        name.includes('remit-') ||
        name.includes('wallet-') ||
        name.includes('ripple-') ||
        name.includes('token-')
      ) {
        mapping['Remit / Wallet / Crypto'].push(repo);
      } else if (
        name.includes('fc-') ||
        name.includes('sre-') ||
        name.includes('terraform-') ||
        name.includes('ansible-') ||
        name.includes('infops-')
      ) {
        mapping['Financial Cloud (FC)'].push(repo);
      } else if (name.includes('corebanking')) {
        mapping['Core Banking'].push(repo);
      } else if (name.includes('canton-') || name.includes('agth-')) {
        mapping['Blockchain / DLT'].push(repo);
      } else if (name.includes('common') || name.includes('lib-') || name.includes('utils')) {
        mapping['Common / Library'].push(repo);
      } else if (
        name.includes('mock') ||
        name.includes('sample') ||
        name.includes('test') ||
        name.includes('verif-')
      ) {
        mapping['PoC / Verification'].push(repo);
      } else {
        mapping['Unclassified'].push(repo);
      }

      // Check Maintenance
      if (!repo.isArchived && lastPush < oneYearAgo) {
        staleRepos.push(repo);
      }
    });

    // Generate Report Output
    console.log('\n## Enhanced Audit Results Summary (v2.0)');
    for (const [category, list] of Object.entries(mapping)) {
      console.log(`- **${category}**: ${list.length} repos`);
    }

    console.log(`\n- **Stale Repositories (No push > 1yr)**: ${staleRepos.length} repos`);

    const result = { mapping, staleRepos, timestamp: new Date().toISOString() };
    safeWriteFile('work/github_audit_report.json', JSON.stringify(result, null, 2));
    console.log('\nDetailed report updated in work/github_audit_report.json');
  } catch (_error) {
    console.error('Error during audit:', _error.message);
    process.exit(1);
  }
}

audit();
