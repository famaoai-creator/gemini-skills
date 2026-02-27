import * as fs from 'node:fs';

export interface TailResult {
  logFile: string;
  totalSize: number;
  linesReturned: number;
  content: string;
}

export function tailFile(logFile: string, linesToRead: number): TailResult {
  const stats = fs.statSync(logFile);
  const fileSize = stats.size;
  const bufferSize = 1024 * 100;
  const buffer = Buffer.alloc(bufferSize);

  const fd = fs.openSync(logFile, 'r');
  const start = Math.max(0, fileSize - bufferSize);
  const bytesToRead = Math.min(bufferSize, fileSize);

  const bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, start);
  fs.closeSync(fd);

  const content = buffer.toString('utf8', 0, bytesRead);
  const lines = content.split(new RegExp('\\\\r?\\\\n'));
  const lastLines = lines.slice(-linesToRead);

  return {
    logFile,
    totalSize: fileSize,
    linesReturned: lastLines.length,
    content: lastLines.join(String.fromCharCode(10)),
  };
}
