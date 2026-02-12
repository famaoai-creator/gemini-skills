/**
 * scripts/lib/tier-guard.cjs
 * Sovereign Knowledge Protocol Enforcement
 */
const fs = require('fs');
const path = require('path');

const PERSONAL_DIR = path.resolve(__dirname, '../../knowledge/personal');
const CONFIDENTIAL_DIR = path.resolve(__dirname, '../../knowledge/confidential');

/**
 * Scan content for potential leaks of sovereign secrets.
 * @param {string} content - The content to be validated.
 * @returns {Object} { safe: boolean, detected: string[] }
 */
function validateSovereignBoundary(content) {
    const findings = [];
    
    // 1. Gather all unique tokens from Personal tier
    const getTokens = (dir) => {
        let tokens = [];
        if (!fs.existsSync(dir)) return tokens;
        
        const files = fs.readdirSync(dir, { recursive: true });
        files.forEach(f => {
            const p = path.join(dir, f);
            if (fs.statSync(p).isFile()) {
                const text = fs.readFileSync(p, 'utf8');
                // Extract API keys, passwords, specific names from personal files
                const matches = text.match(/[A-Za-z0-9\-_]{20,}/g); 
                if (matches) tokens.push(...matches);
            }
        });
        return [...new Set(tokens)];
    };

    const forbiddenTokens = [...getTokens(PERSONAL_DIR), ...getTokens(CONFIDENTIAL_DIR)];

    // 2. Scan the provided content for any of these tokens
    forbiddenTokens.forEach(token => {
        if (content.includes(token)) {
            findings.push(token.substring(0, 4) + '...');
        }
    });

    return {
        safe: findings.length === 0,
        detected: findings
    };
}

module.exports = { validateSovereignBoundary };
