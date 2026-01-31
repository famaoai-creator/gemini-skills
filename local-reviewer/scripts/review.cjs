const { execSync } = require('child_process');

try {
    console.log("Fetching staged changes for review...");
    // Get staged changes with context
    const diff = execSync('git diff --staged --unified=3').toString();

    if (!diff.trim()) {
        console.log("No staged changes found. Did you run 'git add'?");
        process.exit(0);
    }

    console.log("\n--- STAGED CHANGES START ---");
    console.log(diff);
    console.log("--- STAGED CHANGES END ---\n");
    console.log("Instructions for AI: Review the above diff for:");
    console.log("1. Bugs or logic errors.");
    console.log("2. Security vulnerabilities.");
    console.log("3. Code style consistency.");
    console.log("4. Missing tests.");

} catch (e) {
    console.error("Error running git diff:", e.message);
}
