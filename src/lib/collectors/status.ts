export interface DownloadStatus {
  query: string;
  totalPage: number;
  currentPage: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastFile?: string;
}

// In-memory status store for demo purposes
export const globalDownloadStatus: Record<string, DownloadStatus> = {};
