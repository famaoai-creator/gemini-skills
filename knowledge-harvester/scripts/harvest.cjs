#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runSkill } = require('../../scripts/lib/skill-wrapper.cjs');
const { validateDirPath, requireArgs } = require('../../scripts/lib/validators.cjs');

const argv = yargs(hideBin(process.argv))
    .option('dir', { alias: 'd', type: 'string', demandOption: true, describe: 'Target directory to analyze' })
    .option('out', { alias: 'o', type: 'string', describe: 'Optional output file path' })
    .argv;

/**
 * High-value files to look for during knowledge harvesting.
 */
const HIGH_VALUE_FILES = [
    'README.md',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'CODE_OF_CONDUCT.md',
    'LICENSE',
    'package.json',
    'tsconfig.json',
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.prettierrc',
    '.prettierrc.json',
    'Makefile',
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.env.example',
    'jest.config.js',
    'jest.config.ts',
    'vitest.config.ts',
    'webpack.config.js',
    'vite.config.ts',
    'vite.config.js',
    'rollup.config.js',
    '.babelrc',
    'babel.config.js',
    'turbo.json',
    'lerna.json',
    'nx.json',
    'pnpm-workspace.yaml',
];

/**
 * GitHub config files to scan for.
 */
const GITHUB_FILES = [
    'CODEOWNERS',
    'dependabot.yml',
    'dependabot.yaml',
];

const GITHUB_WORKFLOW_EXTENSIONS = ['.yml', '.yaml'];

/**
 * Config file extensions to detect.
 */
const CONFIG_EXTENSIONS = ['.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf'];

/**
 * Directories to ignore during scanning.
 */
const IGNORE_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt',
    'vendor', '.cache', '__pycache__', '.tox', '.eggs', 'target',
]);

/**
 * Recursively count files in a directory.
 */
function countFiles(dirPath) {
    let count = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            count += countFiles(fullPath);
        } else if (entry.isFile()) {
            count++;
        }
    }
    return count;
}

/**
 * Get a shallow directory structure summary (top-level dirs and key files).
 */
function getStructureSummary(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const dirs = [];
    const files = [];
    for (const entry of entries) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        if (entry.name.startsWith('.') && entry.isDirectory() && entry.name !== '.github') continue;
        if (entry.isDirectory()) {
            dirs.push(entry.name + '/');
        } else if (entry.isFile()) {
            files.push(entry.name);
        }
    }
    return { directories: dirs.sort(), files: files.sort() };
}

/**
 * Extract tech stack hints from package.json.
 */
function extractTechStack(dirPath) {
    const techStack = [];
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const allDeps = Object.assign(
                {},
                pkg.dependencies || {},
                pkg.devDependencies || {},
                pkg.peerDependencies || {}
            );
            const depNames = Object.keys(allDeps);

            // Detect frameworks and tools
            const detections = [
                { names: ['react', 'react-dom'], label: 'React' },
                { names: ['vue'], label: 'Vue' },
                { names: ['@angular/core'], label: 'Angular' },
                { names: ['svelte'], label: 'Svelte' },
                { names: ['next'], label: 'Next.js' },
                { names: ['nuxt'], label: 'Nuxt' },
                { names: ['express'], label: 'Express' },
                { names: ['fastify'], label: 'Fastify' },
                { names: ['koa'], label: 'Koa' },
                { names: ['typescript'], label: 'TypeScript' },
                { names: ['jest'], label: 'Jest' },
                { names: ['vitest'], label: 'Vitest' },
                { names: ['mocha'], label: 'Mocha' },
                { names: ['webpack'], label: 'Webpack' },
                { names: ['vite'], label: 'Vite' },
                { names: ['rollup'], label: 'Rollup' },
                { names: ['eslint'], label: 'ESLint' },
                { names: ['prettier'], label: 'Prettier' },
                { names: ['tailwindcss'], label: 'Tailwind CSS' },
                { names: ['prisma', '@prisma/client'], label: 'Prisma' },
                { names: ['mongoose'], label: 'Mongoose' },
                { names: ['sequelize'], label: 'Sequelize' },
                { names: ['playwright', '@playwright/test'], label: 'Playwright' },
                { names: ['puppeteer'], label: 'Puppeteer' },
                { names: ['cypress'], label: 'Cypress' },
                { names: ['docker-compose'], label: 'Docker' },
                { names: ['electron'], label: 'Electron' },
            ];

            for (const detection of detections) {
                if (detection.names.some(n => depNames.includes(n))) {
                    techStack.push(detection.label);
                }
            }

            // Detect Node.js itself
            if (pkg.engines && pkg.engines.node) {
                techStack.unshift('Node.js');
            } else {
                techStack.unshift('JavaScript/Node.js');
            }
        } catch (_) {
            // Ignore JSON parse errors
        }
    }

    // Check for other ecosystem markers
    if (fs.existsSync(path.join(dirPath, 'requirements.txt')) || fs.existsSync(path.join(dirPath, 'setup.py')) || fs.existsSync(path.join(dirPath, 'pyproject.toml'))) {
        techStack.push('Python');
    }
    if (fs.existsSync(path.join(dirPath, 'Gemfile'))) {
        techStack.push('Ruby');
    }
    if (fs.existsSync(path.join(dirPath, 'go.mod'))) {
        techStack.push('Go');
    }
    if (fs.existsSync(path.join(dirPath, 'Cargo.toml'))) {
        techStack.push('Rust');
    }
    if (fs.existsSync(path.join(dirPath, 'pom.xml')) || fs.existsSync(path.join(dirPath, 'build.gradle'))) {
        techStack.push('Java');
    }
    if (fs.existsSync(path.join(dirPath, 'Dockerfile'))) {
        if (!techStack.includes('Docker')) techStack.push('Docker');
    }

    return [...new Set(techStack)];
}

/**
 * Extract patterns from the project.
 */
function extractPatterns(dirPath) {
    const patterns = [];

    // Check for monorepo patterns
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.workspaces) {
                patterns.push({ type: 'architecture', name: 'Monorepo (npm workspaces)', detail: `Workspaces: ${Array.isArray(pkg.workspaces) ? pkg.workspaces.length : 'configured'}` });
            }
        } catch (_) {}
    }
    if (fs.existsSync(path.join(dirPath, 'lerna.json'))) {
        patterns.push({ type: 'architecture', name: 'Monorepo (Lerna)', detail: 'Uses Lerna for package management' });
    }
    if (fs.existsSync(path.join(dirPath, 'turbo.json'))) {
        patterns.push({ type: 'architecture', name: 'Monorepo (Turborepo)', detail: 'Uses Turborepo for build orchestration' });
    }

    // Check for CI/CD
    const githubDir = path.join(dirPath, '.github', 'workflows');
    if (fs.existsSync(githubDir) && fs.statSync(githubDir).isDirectory()) {
        const workflows = fs.readdirSync(githubDir).filter(f => GITHUB_WORKFLOW_EXTENSIONS.includes(path.extname(f)));
        if (workflows.length > 0) {
            patterns.push({ type: 'ci-cd', name: 'GitHub Actions', detail: `${workflows.length} workflow(s): ${workflows.join(', ')}` });
        }
    }
    if (fs.existsSync(path.join(dirPath, '.gitlab-ci.yml'))) {
        patterns.push({ type: 'ci-cd', name: 'GitLab CI', detail: 'Uses .gitlab-ci.yml' });
    }
    if (fs.existsSync(path.join(dirPath, 'Jenkinsfile'))) {
        patterns.push({ type: 'ci-cd', name: 'Jenkins', detail: 'Uses Jenkinsfile' });
    }

    // Check for testing patterns
    const testDirs = ['tests', 'test', '__tests__', 'spec'];
    for (const testDir of testDirs) {
        if (fs.existsSync(path.join(dirPath, testDir))) {
            patterns.push({ type: 'testing', name: 'Test directory', detail: `Found ${testDir}/` });
            break;
        }
    }

    // Check for containerization
    if (fs.existsSync(path.join(dirPath, 'Dockerfile'))) {
        patterns.push({ type: 'deployment', name: 'Docker', detail: 'Dockerfile present' });
    }
    if (fs.existsSync(path.join(dirPath, 'docker-compose.yml')) || fs.existsSync(path.join(dirPath, 'docker-compose.yaml'))) {
        patterns.push({ type: 'deployment', name: 'Docker Compose', detail: 'docker-compose config present' });
    }

    // Check for code quality config
    const configsFound = HIGH_VALUE_FILES.filter(f => {
        const ext = path.extname(f);
        return CONFIG_EXTENSIONS.includes(ext) && fs.existsSync(path.join(dirPath, f));
    });
    if (configsFound.length > 0) {
        patterns.push({ type: 'quality', name: 'Code quality configs', detail: configsFound.join(', ') });
    }

    return patterns;
}

/**
 * Summarize a documentation file (first 500 chars or first paragraph).
 */
function summarizeDoc(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        // Find the first non-empty, non-heading paragraph
        let summary = '';
        let inParagraph = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                if (inParagraph) break;
                continue;
            }
            if (trimmed.startsWith('#') || trimmed.startsWith('---')) {
                if (inParagraph) break;
                continue;
            }
            inParagraph = true;
            summary += (summary ? ' ' : '') + trimmed;
        }
        if (summary.length > 300) {
            summary = summary.substring(0, 297) + '...';
        }
        return summary || '(No summary available)';
    } catch (_) {
        return '(Unable to read file)';
    }
}

/**
 * Collect documentation summaries from high-value documentation files.
 */
function collectDocumentation(dirPath) {
    const docs = [];
    const docFiles = ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md'];

    for (const docFile of docFiles) {
        const docPath = path.join(dirPath, docFile);
        if (fs.existsSync(docPath)) {
            docs.push({
                file: docFile,
                summary: summarizeDoc(docPath),
            });
        }
    }

    // Check .github directory for additional docs
    const githubDir = path.join(dirPath, '.github');
    if (fs.existsSync(githubDir) && fs.statSync(githubDir).isDirectory()) {
        const githubFiles = fs.readdirSync(githubDir).filter(f => {
            const ext = path.extname(f).toLowerCase();
            return ext === '.md' || GITHUB_FILES.includes(f);
        });
        for (const gf of githubFiles) {
            const gfPath = path.join(githubDir, gf);
            if (fs.statSync(gfPath).isFile()) {
                docs.push({
                    file: `.github/${gf}`,
                    summary: summarizeDoc(gfPath),
                });
            }
        }
    }

    return docs;
}

/**
 * Extract the project name from package.json or directory name.
 */
function getProjectName(dirPath) {
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.name) return pkg.name;
        } catch (_) {}
    }
    return path.basename(dirPath);
}

runSkill('knowledge-harvester', () => {
    requireArgs(argv, ['dir']);
    const dirPath = validateDirPath(argv.dir, 'dir');

    const projectName = getProjectName(dirPath);
    const structure = getStructureSummary(dirPath);
    const techStack = extractTechStack(dirPath);
    const patterns = extractPatterns(dirPath);
    const documentation = collectDocumentation(dirPath);
    const fileCount = countFiles(dirPath);

    const summary = `Project "${projectName}" contains ${fileCount} files. ` +
        `Tech stack: ${techStack.length > 0 ? techStack.join(', ') : 'unknown'}. ` +
        `Found ${patterns.length} architectural pattern(s) and ${documentation.length} documentation file(s).`;

    const result = {
        directory: dirPath,
        projectName,
        patterns,
        techStack,
        documentation,
        fileCount,
        structure,
        summary,
    };

    if (argv.out) {
        fs.writeFileSync(argv.out, JSON.stringify(result, null, 2));
    }

    return result;
});
