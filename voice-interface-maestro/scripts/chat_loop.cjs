const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');
const { logger } = require('../../scripts/lib/core.cjs');

const toggleScript = path.resolve(__dirname, '../applescript/toggle_dictation.scpt');
const speakScript = path.resolve(__dirname, 'speak.cjs');

function toggleDictation() {
    try {
        execSync(`osascript "${toggleScript}"`);
        // logger.info('🎤 Toggled Dictation');
    } catch (e) {
        logger.warn('Failed to toggle dictation. Check Accessibility permissions.');
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

logger.info("🤖 Voice Chat Loop Started");
logger.info("1. Speak your command.");
logger.info("2. Press ENTER to send.");
logger.info("3. Agent will stop dictation, speak, and restart dictation.\n");

// Initial state: Turn ON dictation for the user
toggleDictation();

rl.on('line', (input) => {
    if (!input.trim()) return;

    // 1. User sent message -> Stop Dictation immediately
    toggleDictation(); 

    // 2. Simulate processing delay (or integration with actual agent response)
    // Here we just echo for demo, but in real usage, we'd fetch the LLM response.
    const responseText = `I received: ${input}. Executing now.`;
    
    // 3. Agent Speaks (Blocking)
    logger.info(`🗣️  Agent: "${responseText}"`);
    try {
        execSync(`node "${speakScript}" "${responseText}"`);
    } catch (e) {}

    // 4. Finished Speaking -> Start Dictation again
    setTimeout(() => {
        console.log("\n🎤 Listening... (Start speaking)");
        toggleDictation();
    }, 500);
});
