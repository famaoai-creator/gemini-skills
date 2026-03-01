import path from 'fs';
import { safeReadFile } from '@agent/core/secure-io';
import pathModule from 'path';
import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import { createWorker } from 'tesseract.js';

export interface ExtractionResult {
  content: string;
  format: string;
  metadata?: any;
}

/**
 * Universal Extraction Engine using Secure IO
 */
export async function extractText(filePath: string): Promise<ExtractionResult> {
  const ext = pathModule.extname(filePath).toLowerCase();
  // Use safeReadFile to respect Tier boundaries
  const buffer = safeReadFile(filePath) as Buffer;

  switch (ext) {
    case '.pdf':
      const data = await pdf(buffer);
      return { content: data.text, format: 'pdf', metadata: data.info };

    case '.xlsx':
    case '.xls':
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let excelText = '';
      workbook.SheetNames.forEach(name => {
        excelText += `\n--- Sheet: ${name} ---\n`;
        excelText += XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
      });
      return { content: excelText, format: 'excel' };

    case '.docx':
      const wordRes = await mammoth.extractRawText({ buffer });
      return { content: wordRes.value, format: 'word' };

    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.webp':
      const worker = await createWorker('eng+jpn');
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      return { content: text, format: 'image-ocr' };

    case '.zip':
      const zip = new AdmZip(buffer);
      let zipText = 'ZIP Archive Content:\n';
      zip.getEntries().forEach(entry => {
        zipText += `- ${entry.entryName}\n`;
      });
      return { content: zipText, format: 'zip' };

    default:
      return { content: buffer.toString('utf8'), format: 'text/plain' };
  }
}
