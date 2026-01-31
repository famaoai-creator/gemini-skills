const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const AdmZip = require('adm-zip');
const simpleParser = require('mailparser').simpleParser;

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
            // Document Formats
            case '.pdf': await processPdf(filePath); break;
            case '.xlsx':
            case '.xls':
            case '.csv': processExcel(filePath); break;
            case '.docx': await processWord(filePath); break;
            
            // Image Formats (OCR)
            case '.png':
            case '.jpg':
            case '.jpeg':
            case '.bmp':
            case '.webp': await processImage(filePath); break;

            // Email
            case '.eml': await processEmail(filePath); break;

            // Archive
            case '.zip': processZip(filePath); break;

            // Plain Text
            case '.txt':
            case '.md':
            case '.json':
            case '.js':
            case '.ts':
            case '.py':
            case '.html':
            case '.css':
            case '.xml':
            case '.yaml':
            case '.yml':
                console.log(fs.readFileSync(filePath, 'utf8'));
                break;

            default:
                console.error(`Unsupported file extension: ${ext}`);
                process.exit(1);
        }
    } catch (error) {
        console.error(`Error processing file: ${error.message}`);
        process.exit(1);
    }
}

// --- Processors ---

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
}

async function processImage(file) {
    console.log("--- OCR START (Processing Image...) ---");
    const { data: { text } } = await Tesseract.recognize(file, 'eng+jpn', {
        logger: m => {} // Silence progress
    });
    console.log(text);
    console.log("--- OCR END ---");
}

async function processEmail(file) {
    const source = fs.readFileSync(file);
    const parsed = await simpleParser(source);
    console.log("--- EMAIL CONTENT START ---");
    console.log(`Subject: ${parsed.subject}`);
    console.log(`From: ${parsed.from ? parsed.from.text : 'Unknown'}`);
    console.log(`To: ${parsed.to ? parsed.to.text : 'Unknown'}`);
    console.log(`Date: ${parsed.date}`);
    console.log("\nBody:");
    console.log(parsed.text || parsed.html); 
    console.log("--- EMAIL CONTENT END ---");
}

function processZip(file) {
    console.log("--- ZIP ARCHIVE CONTENT START ---");
    const zip = new AdmZip(file);
    const zipEntries = zip.getEntries();

    zipEntries.forEach(zipEntry => {
        if (zipEntry.isDirectory) return;
        const entryName = zipEntry.entryName;
        // Only read text-like files to avoid binary garbage
        if (/".(txt|md|json|js|ts|py|html|css|xml|yaml|yml|csv|log)$/i.test(entryName)) {
            console.log(`\n### File: ${entryName}`);
            console.log(zipEntry.getData().toString('utf8'));
        } else {
            console.log(`\n### File: ${entryName} (Skipped binary/unsupported)`);
        }
    });
    console.log("--- ZIP ARCHIVE CONTENT END ---");
}

extractText();
