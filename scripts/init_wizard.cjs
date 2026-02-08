const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { logger } = require('./lib/core.cjs');

const rootDir = path.resolve(__dirname, '..');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

// Role-based recommended skills
const ROLE_SKILLS = {
    Engineer: {
        skills: [
            'codebase-mapper', 'local-reviewer', 'security-scanner', 'quality-scorer',
            'log-analyst', 'bug-predictor', 'refactoring-engine', 'test-genie'
        ],
        playbook: null,
        pipelines: ['code-quality', 'security-audit'],
        firstCommand: 'node codebase-mapper/scripts/map.cjs .',
        description: 'Code, Test, DevOps'
    },
    CEO: {
        skills: [
            'release-note-crafter', 'project-health-check', 'license-auditor', 'cloud-cost-estimator',
            'pr-architect', 'onboarding-wizard', 'token-economist', 'dependency-lifeline'
        ],
        playbook: 'knowledge/orchestration/mission-playbooks/ceo-strategy.md',
        pipelines: ['executive-report', 'cost-analysis'],
        firstCommand: 'node project-health-check/scripts/check.cjs .',
        description: 'Strategy, Finance, Org'
    },
    'PM/Auditor': {
        skills: [
            'project-health-check', 'quality-scorer', 'completeness-scorer', 'schema-validator',
            'requirements-wizard', 'skill-quality-auditor', 'knowledge-auditor', 'doc-sync-sentinel'
        ],
        playbook: 'knowledge/orchestration/mission-playbooks/product-audit.md',
        pipelines: ['quality-gate', 'compliance-check'],
        firstCommand: 'node quality-scorer/scripts/score.cjs --input .',
        description: 'Management, Compliance, QA'
    }
};

async function main() {
    console.clear();
    console.log("Welcome to Gemini Skills Ecosystem Setup Wizard\n");

    // 1. Role Selection
    console.log("Which role best describes you?");
    console.log("1. Software Engineer (Code, Test, DevOps)");
    console.log("2. CEO / Executive (Strategy, Finance, Org)");
    console.log("3. PM / Auditor (Management, Compliance, QA)");

    const roleChoice = await askQuestion("\nEnter number (1-3): ");

    let roleName = "Engineer";
    if (roleChoice === '2') roleName = "CEO";
    if (roleChoice === '3') roleName = "PM/Auditor";

    const roleConfig = ROLE_SKILLS[roleName];

    logger.info("Initializing environment...");

    // 2. Save role config
    const personalDir = path.resolve(rootDir, 'knowledge/personal');
    if (!fs.existsSync(personalDir)) {
        fs.mkdirSync(personalDir, { recursive: true });
    }
    const roleConfigPath = path.join(personalDir, 'role-config.json');
    fs.writeFileSync(roleConfigPath, JSON.stringify({
        role: roleName,
        description: roleConfig.description,
        recommended_skills: roleConfig.skills,
        created_at: new Date().toISOString()
    }, null, 2));
    logger.success(`Role saved to knowledge/personal/role-config.json`);

    // 3. Base Setup (Install Dependencies)
    try {
        logger.info("Installing core dependencies (npm install)...");
        execSync('npm install', { stdio: 'inherit', cwd: rootDir });
        logger.success("Dependencies installed.");
    } catch (_e) {
        logger.error("Failed to install dependencies. Check your Node.js version.");
    }

    // 4. Index Generation
    try {
        logger.info("Generating Global Skill Index...");
        execSync('node scripts/generate_skill_index.cjs', { stdio: 'inherit', cwd: rootDir });
    } catch (_e) {
        logger.error("Failed to generate skill index.");
    }

    // 5. Setup Confidential hierarchy
    const setupScript = path.join(rootDir, 'scripts/setup_ecosystem.sh');
    if (fs.existsSync(setupScript)) {
        try {
            logger.info("Setting up Confidential knowledge hierarchy...");
            execSync(`bash "${setupScript}"`, { stdio: 'inherit', cwd: rootDir });
            logger.success("Ecosystem setup complete.");
        } catch (_e) {
            logger.error("Ecosystem setup had issues. Run: bash scripts/setup_ecosystem.sh manually.");
        }
    }

    // 6. Create Personal Secrets Directory
    if (!fs.existsSync(path.join(personalDir, 'README.md'))) {
        fs.writeFileSync(path.join(personalDir, 'README.md'), '# Personal Secrets\nStore your API keys here.');
        logger.info("Created 'knowledge/personal/' for your secrets.");
    }

    // 7. Generate role-based skill bundle
    logger.info(`Generating ${roleName} skill bundle...`);
    const bundleScript = path.join(rootDir, 'skill-bundle-packager/scripts/bundle.cjs');
    if (fs.existsSync(bundleScript)) {
        try {
            const missionName = `${roleName.toLowerCase().replace('/', '-')}-starter`;
            const skillArgs = roleConfig.skills.join(' ');
            execSync(`node "${bundleScript}" ${missionName} ${skillArgs}`, {
                stdio: 'inherit',
                cwd: rootDir
            });
            logger.success(`Bundle created: work/bundles/${missionName}/bundle.json`);
        } catch (_e) {
            logger.error("Bundle generation failed. You can run skill-bundle-packager manually.");
        }
    }

    // 8. Next Steps
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Setup complete for role: ${roleName} (${roleConfig.description})`);
    console.log(`${'='.repeat(60)}\n`);

    console.log('Recommended Skills:');
    for (const skill of roleConfig.skills) {
        const skillDir = path.join(rootDir, skill);
        const marker = fs.existsSync(path.join(skillDir, 'scripts')) ? '[+]' : '[ ]';
        console.log(`  ${marker} ${skill}`);
    }

    if (roleConfig.playbook) {
        console.log(`\nPlaybook:`);
        console.log(`  ${roleConfig.playbook}`);
        console.log(`  Use with Gemini: "Execute the ${path.basename(roleConfig.playbook, '.md')} playbook"`);
    }

    console.log(`\nNext Steps:`);
    console.log(`  1. Try your first command:`);
    console.log(`     ${roleConfig.firstCommand}`);
    console.log(`  2. Search for skills:`);
    console.log(`     npm run cli -- search <keyword>`);
    console.log(`  3. Run diagnostics if needed:`);
    console.log(`     bash scripts/troubleshoot_doctor.sh`);
    console.log('');

    rl.close();
}

main();
