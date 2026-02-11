#!/usr/bin/env node
/**
 * security-scanner/scripts/scan.cjs
 * Compliance-Aware Vulnerability Hunter
 */

const fs = require('fs');
const path = require('path');
const isBinaryPath = require('is-binary-path');
const { runSkill } = require('@gemini/core');
const { requireArgs } = require('@gemini/core/validators');
const { getAllFiles } = require('../../scripts/lib/fs-utils.cjs');

const DANGEROUS_PATTERNS = [
    { name: 'eval_usage', regex: /eval\(.*\)/g, severity: 'high' },
    { name: 'hardcoded_secret', regex: /(API_KEY|TOKEN|SECRET|PASSWORD)\s*[:=]\s*["'][A-Za-z0-9\-_]{16,}["']/gi, severity: 'critical' }
];

runSkill('security-scanner', () => {
    const argv = requireArgs(['dir']);
    const projectRoot = path.resolve(argv.dir);
    const compliancePath = argv.compliance ? path.resolve(argv.compliance) : null;

    const files = getAllFiles(projectRoot);
    let allFindings = [];
    let scannedCount = 0;
    let fullContentText = "";

    files.forEach(file => {
        if (isBinaryPath(file) || file.includes('node_modules') || file.includes('.git') || file.includes('work/archive')) return;
        
        try {
            const content = fs.readFileSync(file, 'utf8');
            fullContentText += content + "\n";
            const relativePath = path.relative(projectRoot, file);
            
            DANGEROUS_PATTERNS.forEach(pattern => {
                pattern.regex.lastIndex = 0;
                const matches = content.matchAll(pattern.regex);
                for (const _ of matches) {
                    allFindings.push({
                        file: relativePath,
                        pattern: pattern.name,
                        severity: pattern.severity
                    });
                }
            });
            scannedCount++;
        } catch (e) { }
    });

    // --- Compliance Audit (FISC) ---
    if (compliancePath && fs.existsSync(compliancePath)) {
        const standard = fs.readFileSync(compliancePath, 'utf8');
        const controls = [
            { name: 'Encryption at Rest', keywords: ['kms', 'encrypt', 'encrypted', 'vault'], severity: 'high' },
            { name: 'Log Management', keywords: ['log', 'logger', 'winston', 'cloudtrail'], severity: 'medium' },
            { name: 'MFA/IAM', keywords: ['mfa', 'iam', 'auth'], severity: 'high' }
        ];

        controls.forEach(ctrl => {
            const found = ctrl.keywords.some(k => fullContentText.toLowerCase().includes(k));
            if (!found) {
                allFindings.push({
                    file: 'Project Architecture/Code',
                    pattern: `Missing Compliance Control: ${ctrl.name}`,
                    severity: ctrl.severity,
                    suggestion: `FISC standard requires ${ctrl.name}. Please implement corresponding logic/infra.`
                });
            }
        });
    }

    return { 
        projectRoot, 
        scannedFiles: scannedCount, 
        findingCount: allFindings.length,
        findings: allFindings
    };
});
