#!/usr/bin/env node
/**
 * api-fetcher/scripts/fetch.cjs
 * Modernized API fetcher using @gemini/core network.
 */

const fs = require('fs');
const { runSkillAsync } = require('@gemini/core');
const { requireArgs, safeJsonParse } = require('@gemini/core/validators');
const { secureFetch } = require('@gemini/core/network');

runSkillAsync('api-fetcher', async () => {
    const args = requireArgs(['url']);
    const method = args.method || 'GET';
    
    const config = {
        method,
        url: args.url,
        headers: args.headers ? safeJsonParse(args.headers, 'headers') : {},
        data: args.body ? safeJsonParse(args.body, 'request body') : undefined,
    };

    const data = await secureFetch(config);
    const jsonStr = JSON.stringify(data, null, 2);

    if (args.out) {
        fs.writeFileSync(args.out, jsonStr);
        return { output: args.out, size: jsonStr.length };
    }

    return { data };
});
