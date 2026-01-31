const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');
const mammoth = require('mammoth');
// Note: office-text-extractor requires generic support, using specific libs where possible for better control

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: node extract.cjs <file_path>");
    process.exit(1);
}

if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();

async function extractText() {
    try {
        switch (ext) {
            case '.pdf':
                await processPdf(filePath);
                break;
            case '.xlsx':
            case '.xls':
            case '.csv':
                processExcel(filePath);
                break;
            case '.docx':
                await processWord(filePath);
                break;
            // PowerPoint support can be added via office-text-extractor or similar if needed later
            // For now, focusing on these 3 major formats + text
            case '.txt':
            case '.md':
            case '.json':
                console.log(fs.readFileSync(filePath, 'utf8'));
                break;
            default:
                console.error(`Unsupported file extension: ${ext}`);
                // Try fallback raw read? No, better to be explicit.
                process.exit(1);
        }
    } catch (error) {
        console.error(`Error processing file: ${error.message}`);
        process.exit(1);
    }
}

async function processPdf(file) {
    const dataBuffer = fs.readFileSync(file);
    const data = await pdf(dataBuffer);
    console.log("--- PDF CONTENT START ---");
    console.log(data.text);
    console.log("--- PDF CONTENT END ---");
}

function processExcel(file) {
    const workbook = xlsx.readFile(file);
    console.log("--- EXCEL CONTENT START ---");
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n## Sheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        // Convert to CSV for structured text representation
        const csv = xlsx.utils.sheet_to_csv(worksheet);
        console.log(csv);
    });
    console.log("--- EXCEL CONTENT END ---");
}

async function processWord(file) {
    const result = await mammoth.extractRawText({ path: file });
    console.log("--- WORD CONTENT START ---");
    console.log(result.value);
    console.log("--- WORD CONTENT END ---");
    if (result.messages.length > 0) {
        console.warn("Messages:", result.messages);
    }
}

extractText();
