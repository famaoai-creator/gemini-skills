#!/usr/bin/env node
/**
 * excel-artisan/scripts/generate_financials.cjs
 * Data-Driven Financial Renderer
 */

const { runSkillAsync } = require('@gemini/core');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

runSkillAsync('excel-artisan', async () => {
    // Robust argument extraction
    const inputIdx = process.argv.indexOf('--input');
    const outIdx = process.argv.indexOf('--out');
    
    const inputPath = inputIdx !== -1 ? path.resolve(process.argv[inputIdx + 1]) : null;
    const out = outIdx !== -1 ? process.argv[outIdx + 1] : 'Output.xlsx';
    const outputPath = path.resolve(out);

    if (!inputPath || !fs.existsSync(inputPath)) {
        throw new Error(`Input data (JSON) not found at: ${inputPath}`);
    }

    // Load Source of Truth (Text)
    const adf = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    // Load Theme
    const themePath = path.resolve(__dirname, '../../knowledge/templates/themes/excel-pro.json');
    const theme = fs.existsSync(themePath) ? JSON.parse(fs.readFileSync(themePath, 'utf8')) : { styles: {} };

    const workbook = new ExcelJS.Workbook();
    
    // Process each sheet defined in ADF
    adf.sheets.forEach(sheetDef => {
        const sheet = workbook.addWorksheet(sheetDef.name);
        if (sheetDef.hideGrid) sheet.views = [{ showGridLines: false }];

        sheet.addRows(sheetDef.rows);

        // Apply Styles if defined in theme
        if (theme.styles.header) {
            const headerRow = sheet.getRow(1);
            headerRow.eachCell(cell => { Object.assign(cell, theme.styles.header); });
        }

        // Apply column widths
        sheet.columns = sheetDef.rows[0].map(() => ({ width: 20 }));
    });

    await workbook.xlsx.writeFile(outputPath);
    console.log(`[Excel] Rendered from ${inputPath} to ${out}`);

    return { status: 'success', output: outputPath, source: inputPath };
});
