import fs from 'fs';
import path from 'path';

console.log("=== QA Verification: UX/UI Content Check ===\n");

const PROJECT_ROOT = process.cwd();

const BANNER_FILE = path.join(PROJECT_ROOT, 'client/src/components/banner-2026.tsx');
const HOW_IT_WORKS_FILE = path.join(PROJECT_ROOT, 'client/src/pages/how-it-works.tsx');

let passed = 0;
let failed = 0;

function checkFileContent(filePath: string, checks: { description: string, regex: RegExp }[]) {
    console.log(`Checking file: ${path.relative(PROJECT_ROOT, filePath)}`);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ FAIL: File not found`);
        failed += checks.length;
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    checks.forEach(check => {
        if (check.regex.test(content)) {
            console.log(`✅ PASS: ${check.description}`);
            passed++;
        } else {
            console.log(`❌ FAIL: ${check.description}`);
            failed++;
        }
    });
    console.log('---');
}

// 1. Verify Banner Content
checkFileContent(BANNER_FILE, [
    {
        description: 'Banner contains "60.05 CHF/100L"',
        regex: /60\.05 CHF\/100L/
    },
    {
        description: 'Banner mentions "Mise à jour majeure"',
        regex: /Mise à jour majeure/
    },
    {
        description: 'Banner mentions "Taxas"',
        regex: /Taxas/
    }
]);

// 2. Verify "How It Works" Content
checkFileContent(HOW_IT_WORKS_FILE, [
    {
        description: 'Page mentions "Portail Taxas"',
        regex: /Taxas/
    },
    {
        description: 'Page menions "Mai 2026" (Taxas mandatory date)',
        regex: /mai 2026/i // Case-insensitive
    },
    {
        description: 'Page mentions "Stat. 2710"',
        regex: /Stat\. 2710/
    },
    {
        description: 'Page mentions "CI A1"',
        regex: /CI A1/
    },
    {
        description: 'Page mentions "60.05 CHF/100L" (New Rate)',
        regex: /60\.05 CHF\/100L/
    }
]);

console.log(`\nSummary: ${passed} Passed, ${failed} Failed`);

if (failed > 0) process.exit(1);
process.exit(0);
