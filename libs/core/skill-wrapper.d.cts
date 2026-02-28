export declare function runSkill<T>(name: string, fn: () => T | Promise<T>): Promise<T>;
export declare function runSkillAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
export declare function runAsyncSkill<T>(name: string, fn: () => Promise<T>): Promise<T>;
export declare function safeReadFile(path: string, options?: { encoding?: BufferEncoding } | BufferEncoding): string | Buffer;
export declare function safeWriteFile(path: string, content: string | Buffer): void;
export declare function safeAppendFile(path: string, content: string | Buffer): void;
export declare function safeUnlink(path: string): void;
export declare function safeMkdir(path: string): void;

export interface ArtifactPointer {
  path: string;
  hash: string;
  format: string;
  size_bytes: number;
  timestamp: string;
}

export declare function writeArtifact(path: string, data: string | Buffer, format: string): ArtifactPointer;
export declare function readArtifact(pointer: ArtifactPointer | string): string | Buffer;

export declare const logger: {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};
