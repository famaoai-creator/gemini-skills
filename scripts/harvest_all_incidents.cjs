const fs = require('fs');
const { execSync } = require('child_process');

const API_KEY = '0BKDgvOMxpOEV4lHx5aaX6L7n5DUwXXmSmv00NsCGyfzPZbuRE6TY8c4hdziivNi';
const SPACE_URL = 'https://sbi-neofs.backlog.com';
const PROJECT_ID = '615565'; // NBS_INCIDENT

async function fetchAllIssues() {
    const allIssues = [];
    let offset = 0;
    const count = 100;

    console.log('Starting full data collection from Backlog...');

    while (true) {
        const url = `${SPACE_URL}/api/v2/issues?apiKey=${API_KEY}&projectId[]=${PROJECT_ID}&count=${count}&offset=${offset}&sort=created&order=desc`;
        try {
            const response = execSync(`curl -s "${url}"`, { encoding: 'utf8' });
            const issues = JSON.parse(response);
            
            if (issues.length === 0) break;
            
            allIssues.push(...issues);
            console.log(`Fetched ${allIssues.length} issues...`);
            
            if (issues.length < count) break;
            offset += count;
        } catch (e) {
            console.error('Fetch failed:', e.message);
            break;
        }
    }

    fs.writeFileSync('work/nbs_incidents_all.json', JSON.stringify(allIssues, null, 2));
    console.log(`Total ${allIssues.length} issues saved to work/nbs_incidents_all.json`);
}

fetchAllIssues();
