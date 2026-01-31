const readline = require('readline');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const rootDir = process.cwd();

function clearScreen() {
    process.stdout.write('\x1Bc');
}

function getSkills() {
    return fs.readdirSync(rootDir).filter(item => {
        const fullPath = path.join(rootDir, item);
        // It's a skill if it's a directory and has SKILL.md
        return fs.statSync(fullPath).isDirectory() && 
               !item.startsWith('.') && 
               fs.existsSync(path.join(fullPath, 'SKILL.md'));
    });
}

function getGitStatus(dir) {
    try {
        if (!fs.existsSync(path.join(dir, '.git')) && dir !== rootDir) {
             // If not a git repo, maybe the root is?
             return null;
        }
        const status = execSync('git status --short', { cwd: dir }).toString().trim();
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: dir }).toString().trim();
        return { branch, hasChanges: status.length > 0 };
    } catch (e) {
        return null;
    }
}

function showHeader() {
    clearScreen();
    console.log("==========================================");
    console.log("       G E M I N I   S K I L L S          ");
    console.log("         M A N A G E M E N T              ");
    console.log("==========================================\n");
}

function mainMenu() {
    showHeader();
    const skills = getSkills();
    console.log(`Found ${skills.length} skills in ${rootDir}\n`);

    console.log("1. List Skills & Status");
    console.log("2. Create New Skill");
    console.log("3. Sync All (Git Pull)");
    console.log("4. Push All Changes");
    console.log("q. Quit");

    rl.question("\nSelect an option: ", (answer) => {
        switch(answer.trim()) {
            case '1': listSkills(); break;
            case '2': createSkill(); break;
            case '3': syncAll(); break;
            case '4': pushAll(); break;
            case 'q': rl.close(); break;
            default: mainMenu();
        }
    });
}

function listSkills() {
    showHeader();
    console.log("--- Skills Status ---\n");
    
    // Root status
    const rootStatus = getGitStatus(rootDir);
    if (rootStatus) {
        const mark = rootStatus.hasChanges ? ' [MODIFIED]' : '';
        console.log(`[ROOT] . (${rootStatus.branch})${mark}`);
    }

    const skills = getSkills();
    skills.forEach(skill => {
        // Simple check: is it modified? (Checking root git status for subdir changes)
        try {
            const status = execSync(`git status --short ${skill}`, { cwd: rootDir }).toString().trim();
            const mark = status.length > 0 ? ' [MODIFIED]' : '';
            console.log(`- ${skill}${mark}`);
        } catch (e) {
            console.log(`- ${skill} (Error checking status)`);
        }
    });

    console.log("\n(Press Enter to return)");
    rl.question("", () => mainMenu());
}

function createSkill() {
    showHeader();
    rl.question("Enter name for new skill: ", (name) => {
        if (!name) return mainMenu();
        
        try {
            console.log(`\nInitializing ${name}...`);
            const scriptPath = path.join(__dirname, 'create_skill.cjs');
            execSync(`node "${scriptPath}" "${name}"`, { stdio: 'inherit' });
            console.log("\n(Press Enter to return)");
            rl.question("", () => mainMenu());
        } catch (e) {
            console.error("Error creating skill.");
            setTimeout(mainMenu, 2000);
        }
    });
}

function syncAll() {
    console.log("\nPulling latest changes...");
    try {
        execSync('git pull', { stdio: 'inherit' });
    } catch (e) {
        console.error("Git pull failed.");
    }
    setTimeout(mainMenu, 2000);
}

function pushAll() {
    console.log("\nPushing changes...");
    rl.question("Enter commit message: ", (msg) => {
        if (!msg) {
            console.log("Cancelled.");
            return mainMenu();
        }
        try {
            execSync('git add .', { stdio: 'inherit' });
            execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
            execSync('git push', { stdio: 'inherit' });
            console.log("Success!");
        } catch (e) {
            console.error("Git push failed.");
        }
        setTimeout(mainMenu, 2000);
    });
}

// Start
mainMenu();
