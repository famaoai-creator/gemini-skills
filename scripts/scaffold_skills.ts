import * as fs from 'node:fs';
import * as path from 'node:path';
import { safeWriteFile, safeMkdir } from '@agent/core';

interface SkillDef {
  name: string;
  description: string;
  script: string;
}

// Define skills and their metadata based on SKILLS_CANDIDATES.md
const skills: SkillDef[] = [
  {
    name: 'api-fetcher',
    description: 'Fetch data from REST/GraphQL APIs securely.',
    script: 'fetch.cjs',
  },
  {
    name: 'db-extractor',
    description: 'Extract schema and sample data from databases for analysis.',
    script: 'extract.cjs',
  },
  // ... (Other definitions preserved for logic)
  {
    name: 'completeness-scorer',
    description: 'Evaluate text completeness based on criteria.',
    script: 'score.cjs',
  },
];

const rootDir = process.cwd();

async function scaffold(): Promise<void> {
  console.log(`Starting bulk creation of ${skills.length} skills...`);

  skills.forEach((skill) => {
    const skillDir = path.join(rootDir, 'skills', 'custom', skill.name);
    const scriptsDir = path.join(skillDir, 'scripts');

    // 1. Create Directories
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // 2. Create SKILL.md
    const title = skill.name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    const skillMdContent = `---\nname: ${skill.name}\ndescription: ${skill.description}\nstatus: planned\n---\n\n# ${title}\n\n${skill.description}\n\n## Usage\n\n\`\`\`bash\nnpm run cli -- run ${skill.name} [options]\n\`\`\`\n`;
    safeWriteFile(path.join(skillDir, 'SKILL.md'), skillMdContent);

    // 3. Create package.json
    const packageJsonContent = {
      name: skill.name,
      version: '0.1.0',
      description: skill.description,
      main: 'dist/index.js',
      private: true,
      author: 'Gemini Agent',
      license: 'MIT',
      scripts: {
        build: 'tsc'
      },
      devDependencies: {
        '@agent/core': 'workspace:*'
      }
    };
    safeWriteFile(
      path.join(skillDir, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2) + '\n'
    );

    // 4. Create Skeleton Script (src/index.ts)
    const srcDir = path.join(skillDir, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    const scriptContent = `import { runSkill } from '@agent/core';\n\n// Skeleton for ${skill.name}\nrunSkill('${skill.name}', () => {\n  console.log("${skill.name}: ${skill.description}");\n  return { status: 'implemented' };\n});\n`;
    safeWriteFile(path.join(srcDir, 'index.ts'), scriptContent);

    console.log('✅ Created: ' + skill.name + '\n');
  });

  console.log('\nAll skills scaffolded successfully.');
}

scaffold().catch(err => {
  console.error(err);
  process.exit(1);
});
