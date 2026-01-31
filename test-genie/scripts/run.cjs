const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const targetDir = process.argv[2] || '.';
const customCommand = process.argv[3];

// Detect test runner
let testCommand = customCommand;

if (!testCommand) {
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = require(path.resolve(pkgPath));
        if (pkg.scripts && pkg.scripts.test) {
            testCommand = 'npm test';
        }
    }
}

// Fallback or Python detection
if (!testCommand) {
    if (fs.existsSync(path.join(targetDir, 'pytest.ini'))) {
        testCommand = 'pytest';
    } else if (fs.existsSync(path.join(targetDir, 'manage.py'))) {
        testCommand = 'python manage.py test';
    } else {
        testCommand = 'echo "Error: No test script detected. Please provide a command." && exit 1';
    }
}

console.log(`Running test command: ${testCommand} in ${targetDir}`);

exec(testCommand, { cwd: targetDir, maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
    console.log("--- TEST OUTPUT (STDOUT) ---");
    console.log(stdout);
    if (stderr) {
        console.log("--- TEST ERRORS (STDERR) ---");
        console.log(stderr);
    }
    
    if (error) {
        console.log(`\n[TEST FAILED] Exit code: ${error.code}`);
    } else {
        console.log(`\n[TEST PASSED]`);
    }
});
