const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const isBinaryPath = require('is-binary-path');

const projectRoot = process.cwd();

// --- Configuration ---

const IGNORE_DIRS = [
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.nuxt', 
  'vendor', 'bin', 'obj', '.idea', '.vscode', '.DS_Store', 'tmp', 'temp'
];

const IGNORE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', 
  '.ttf', '.eot', '.mp4', '.mp3', '.pdf', '.zip', '.gz', '.tar', '.lock'
];

// --- Patterns ---

const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'AWS Secret Access Key', regex: /\b[0-9a-zA-Z\/\+]{40}\b/, context: ['aws', 'secret', 'key'] }, // Needs context context to avoid false positives
  { name: 'GitHub Personal Access Token', regex: /ghp_[0-9a-zA-Z]{36}/ },
  { name: 'GitHub OAuth Token', regex: /gho_[0-9a-zA-Z]{36}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Slack Webhook', regex: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]+\/B[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/ },
  { name: 'RSA Private Key', regex: /-----BEGIN RSA PRIVATE KEY-----/ },
  { name: 'SSH Private Key', regex: /-----BEGIN OPENSSH PRIVATE KEY-----/ },
  { name: 'Generic Password Assignment', regex: /(password|passwd|pwd|secret|token|api_key)[\s]*[=:]+[\s]*['"][a-zA-Z0-9@#$%^&+=]{8,}['"]/i }
];

const DANGEROUS_PATTERNS = [
  { name: 'Eval Usage (Code Execution)', regex: /\beval\s*\(/ },
  { name: 'Dangerous InnerHTML (XSS)', regex: /dangerouslySetInnerHTML/ },
  { name: 'Shell Execution (Command Injection)', regex: /(child_process|exec|spawn|system)\s*\(.*[\$+\w].*\)/ }, // Crude check for variables in exec
  { name: 'Hardcoded IP Address', regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/ },
  { name: 'Insecure HTTP Link', regex: /http:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ }
];

// --- Scanner Logic ---

let stats = {
  filesScanned: 0,
  secretsFound: 0,
  warningsFound: 0
};

function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  
  if (IGNORE_EXTENSIONS.includes(ext)) return false;
  if (isBinaryPath(filePath)) return false;
  // Skip lock files and minified files
  if (basename.includes('.min.') || basename.includes('-lock') || basename === 'package-lock.json' || basename === 'yarn.lock') return false;
  
  return true;
}

function scanContent(filePath, content) {
  const lines = content.split('\n');
  let fileHasIssues = false;

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    if (line.length > 500) return; // Skip extremely long lines (likely minified or data)

    // 1. Check Secrets
    SECRET_PATTERNS.forEach(pattern => {
      if (pattern.regex.test(line)) {
        // For generic patterns (like AWS Secret Key), check if context keywords exist to reduce false positives
        if (pattern.context) {
          const lowerLine = line.toLowerCase();
          const hasContext = pattern.context.some(ctx => lowerLine.includes(ctx));
          if (!hasContext) return; 
        }

        console.log(`${chalk.red('CRITICAL')} ${chalk.bold(pattern.name)} found in ${chalk.cyan(path.relative(projectRoot, filePath))}:${lineNum}`);
        console.log(chalk.gray(`  Line: ${line.trim().substring(0, 100)}...`));
        stats.secretsFound++;
        fileHasIssues = true;
      }
    });

    // 2. Check Dangerous Patterns
    DANGEROUS_PATTERNS.forEach(pattern => {
      if (pattern.regex.test(line)) {
        // Whitelist: Skip http imports or schemas
        if (pattern.name === 'Insecure HTTP Link' && (line.includes('xmlns') || line.includes('w3.org') || line.includes('schemas.microsoft'))) return;
        if (pattern.name === 'Hardcoded IP Address' && (line.includes('127.0.0.1') || line.includes('0.0.0.0'))) return; // Localhost is usually fine

        console.log(`${chalk.yellow('WARNING')} ${chalk.bold(pattern.name)} found in ${chalk.cyan(path.relative(projectRoot, filePath))}:${lineNum}`);
        console.log(chalk.gray(`  Line: ${line.trim().substring(0, 100)}...`));
        stats.warningsFound++;
        fileHasIssues = true;
      }
    });
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(fullPath);
      }
    } else {
      if (shouldScanFile(fullPath)) {
        try {
          stats.filesScanned++;
          const content = fs.readFileSync(fullPath, 'utf8');
          scanContent(fullPath, content);
        } catch (e) {
          // Ignore read errors
        }
      }
    }
  }
}

// --- Main ---

function runTrivy() {
  try {
    const { execSync } = require('child_process');
    // Check if trivy exists
    execSync('trivy --version', { stdio: 'ignore' });
    
    console.log(chalk.bold.cyan('\n🚀 Trivy detected. Starting comprehensive security scan...\n'));
    
    // Run trivy fs scan
    // -q: Quiet mode (suppress banner)
    // --scanners: vuln,secret,config (all major scanners)
    // --exit-code 0: Don't crash script on finding issues, just report
    try {
        execSync('trivy fs . --scanners vuln,secret,config --exit-code 0', { stdio: 'inherit' });
    } catch (e) {
        // Trivy might exit with non-zero if configured to do so, but we just want to show output.
    }
    return true;
  } catch (e) {
    return false;
  }
}

function main() {
  console.log(chalk.bold.magenta('\n🛡️  Security Scanner initialized...'));
  
  if (runTrivy()) {
      console.log(chalk.gray('\n(Scan performed via Trivy)'));
      return;
  }

  console.log(chalk.gray('Trivy not found. Falling back to lightweight internal scanner.\n'));

  const startTime = Date.now();
  walkDir(projectRoot);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + chalk.gray('--------------------------------------------------'));
  console.log(`Scan Complete in ${duration}s`);
  console.log(`Files Scanned: ${stats.filesScanned}`);
  
  if (stats.secretsFound > 0) {
    console.log(chalk.red.bold(`secrets Found: ${stats.secretsFound} (CRITICAL)`));
  } else {
    console.log(chalk.green('No secrets found.'));
  }

  if (stats.warningsFound > 0) {
    console.log(chalk.yellow.bold(`Warnings: ${stats.warningsFound}`));
  } else {
    console.log(chalk.green('No dangerous patterns found.'));
  }
  console.log(chalk.gray('--------------------------------------------------\n'));
}

main();
