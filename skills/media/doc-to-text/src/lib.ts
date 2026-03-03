import * as fs from 'node:fs';
import * as path from 'node:path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';

/**
 * Universal document extraction core.
 */

export interface ExtractionResult {
  content: string;
  format: string;
  metadata: any;
}

export async function extractText(filePath: string): Promise<ExtractionResult> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  try {
    if (ext === '.pdf') {
      const data = await pdf(buffer);
      return { content: data.text, format: 'pdf', metadata: data.info };
    }

    if (ext === '.docx') {
      const data = await mammoth.extractRawText({ buffer });
      return { content: data.value, format: 'docx', metadata: {} };
    }

    if (ext === '.xlsx') {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const csv = XLSX.utils.sheet_to_csv(firstSheet);
      return { content: csv, format: 'xlsx', metadata: { sheets: workbook.SheetNames } };
    }

    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng+jpn');
      return { content: text, format: 'image', metadata: {} };
    }

    if (ext === '.txt' || ext === '.md') {
      return { content: buffer.toString('utf8'), format: ext.slice(1), metadata: {} };
    }

    throw new Error(`Unsupported file format: ${ext}`);
  } catch (err: any) {
    throw new Error(`Extraction failed for ${path.basename(filePath)}: ${err.message}`);
  }
}
