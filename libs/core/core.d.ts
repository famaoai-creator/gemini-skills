export declare const logger: {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

export declare const ui: {
  summarize: (data: any) => any;
  formatDuration: (ms: number) => string;
};

export declare const sre: {
  analyzeRootCause: (msg: string) => { cause: string; impact: string; recommendation: string } | null;
};
