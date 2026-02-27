import sqlite3 from 'sqlite3';

export interface DBResult {
  rows?: any[];
  rowCount: number;
  output?: string;
}

export async function extractFromDB(dbPath: string, query: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(query, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
