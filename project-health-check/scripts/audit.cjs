const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const projectRoot = process.cwd();

// --- Configuration ---

const CHECKS = {
  ci: {
    name: 'CI/CD Pipelines',
    patterns: [
      '.github/workflows',
      '.gitlab-ci.yml',
      '.circleci/config.yml',
      'azure-pipelines.yml',
      'bitbucket-pipelines.yml',
      'Jenkinsfile'
    ],
    weight: 25,
    message: 'Automated pipelines ensure code integration and deployment safety.'
  },
  test: {
    name: 'Testing Framework',
    patterns: [
      'jest.config.*',
      'pytest.ini',
      '.rspec',
      'pom.xml', // Maven (Java) - simplistic check
      'build.gradle*', // Gradle (Java/Kotlin)
      'go.mod', // Go
      'Cargo.toml', // Rust
      'requirements-dev.txt', // Python dev deps often have pytest
      'package.json' // JS/TS - checked deeper below
    ],
    weight: 25,
    message: 'Tests prevent regressions and enable confident refactoring.'
  },
  lint: {
    name: 'Linting & Formatting',
    patterns: [
      '.eslintrc*',
      '.prettierrc*',
      'pyproject.toml', // often has black/ruff
      '.rubocop.yml',
      'checkstyle.xml',
      '.golangci.yml'
    ],
    weight: 15,
    message: 'Consistent style and static analysis reduce bugs and cognitive load.'
  },
  iac: {
    name: 'Containerization & IaC',
    patterns: [
      'Dockerfile',
      'docker-compose.yml',
      'Compose.yaml',
      'k8s/',
      'helm/',
      'terraform/',
      'main.tf',
      'Pulumi.yaml',
      'serverless.yml'
    ],
    weight: 20,
    message: 'Infrastructure as Code and Containers ensure reproducible environments.'
  },
  docs: {
    name: 'Documentation',
    patterns: [
      'README.md',
      'CONTRIBUTING.md',
      'docs/',
      'doc/'
    ],
    weight: 15,
    message: 'Good documentation lowers onboarding cost and explains "Why".'
  }
};

// --- Helpers ---

function checkExistence(patterns) {
  for (const pattern of patterns) {
    if (pattern.endsWith('/')) {
        // Directory check
        const dirPath = path.join(projectRoot, pattern.slice(0, -1));
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) return pattern;
    } else if (pattern.includes('*')) {
        // Simple wildcard prefix/suffix check manually
        const dir = path.dirname(pattern);
        const base = path.basename(pattern);
        const files = fs.readdirSync(path.join(projectRoot, dir === '.' ? '' : dir));
        // Very basic glob handling for now
        const regex = new RegExp('^' + base.replace('.', '\.').replace('*', '.*') + '$');
        const match = files.find(f => regex.test(f));
        if (match) return match;
    } else {
        // Exact file check
        if (fs.existsSync(path.join(projectRoot, pattern))) return pattern;
    }
  }
  return null;
}

// Deep check for package.json (JS/TS specific)
function checkPackageJson(type) {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const scripts = pkg.scripts || {};

    if (type === 'test') {
       return Object.keys(allDeps).some(d => d.includes('jest') || d.includes('mocha') || d.includes('vitest') || d.includes('ava')) ||
              Object.keys(scripts).some(s => s === 'test');
    }
    if (type === 'lint') {
       return Object.keys(allDeps).some(d => d.includes('eslint') || d.includes('prettier') || d.includes('stylelint')) ||
              Object.keys(scripts).some(s => s.includes('lint') || s.includes('format'));
    }
  } catch (e) {
    return false;
  }
  return false;
}

// --- Main ---

function main() {
  console.log(chalk.bold.blue('\n🏥 Project Health Check\n'));
  console.log(chalk.gray(`Scanning: ${projectRoot}\n`));

  let totalScore = 0;
  let maxScore = 0;

  Object.entries(CHECKS).forEach(([key, config]) => {
    maxScore += config.weight;
    let found = checkExistence(config.patterns);

    // Special handling for package.json contents
    if (!found && (key === 'test' || key === 'lint')) {
        if (checkPackageJson(key)) found = 'package.json (dependencies/scripts)';
    }

    if (found) {
      totalScore += config.weight;
      console.log(`${chalk.green('✔')} ${chalk.bold(config.name)}: ${chalk.green('Found')} (${found})`);
    } else {
      console.log(`${chalk.red('✘')} ${chalk.bold(config.name)}: ${chalk.red('Missing')}`);
      console.log(chalk.yellow(`  -> Suggestion: ${config.message}`));
    }
  });

  const percentage = Math.round((totalScore / maxScore) * 100);
  let grade = 'F';
  let color = chalk.red;

  if (percentage >= 90) { grade = 'A'; color = chalk.green; }
  else if (percentage >= 80) { grade = 'B'; color = chalk.blue; }
  else if (percentage >= 60) { grade = 'C'; color = chalk.yellow; }
  else if (percentage >= 40) { grade = 'D'; color = chalk.magenta; }

  console.log('\n' + chalk.gray('--------------------------------------------------'));
  console.log(`Total Score: ${color.bold(percentage + '/100')} (Grade: ${color.bold(grade)})`);
  console.log(chalk.gray('--------------------------------------------------\n'));
}

main();
