import * as fs from 'node:fs';
import * as path from 'node:path';

export function findPlaybook(mission: string, rootDir: string): any {
  const playbooksDir = path.join(rootDir, 'knowledge/orchestration/mission-playbooks');
  if (!fs.existsSync(playbooksDir)) return null;
  try {
    const files = fs.readdirSync(playbooksDir).filter((f) => f.endsWith('.md'));
    const missionLower = mission.toLowerCase();
    for (const file of files) {
      const name = file.replace('.md', '').toLowerCase();
      if (missionLower.includes(name)) {
        return {
          path: 'knowledge/orchestration/mission-playbooks/' + file,
          guidance: 'See playbook: ' + name,
        };
      }
    }
  } catch {}
  return null;
}
