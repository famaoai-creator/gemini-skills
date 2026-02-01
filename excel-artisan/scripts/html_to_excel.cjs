const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const chalk = require('chalk');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error(chalk.red("Usage: node html_to_excel.cjs <input.html> <output.xlsx>"));
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    console.error(chalk.red(`Error: Input file not found at ${inputFile}`));
    process.exit(1);
}

try {
    console.log(chalk.cyan(`Reading HTML from ${inputFile}...`));
    const htmlContent = fs.readFileSync(inputFile, 'utf8');

    // Parse HTML using jsdom
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const table = document.querySelector('table');

    if (!table) {
        console.error(chalk.red("Error: No <table> tag found in the HTML file."));
        process.exit(1);
    }

    console.log(chalk.cyan("Converting table to Excel workbook..."));
    
    // Convert table to worksheet
    // raw: true helps to keep some raw values, but styling (colors) is limited in Community Edition of SheetJS
    const worksheet = xlsx.utils.table_to_sheet(table, { raw: true });

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    console.log(chalk.cyan(`Writing to ${outputFile}...`));
    xlsx.writeFile(workbook, outputFile);

    console.log(chalk.green(`
✔ Success! Excel file created at: ${outputFile}`));

} catch (error) {
    console.error(chalk.red(`
✘ Failed to convert: ${error.message}`));
    process.exit(1);
}
