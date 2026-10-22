export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  details?: Record<string, string>;
}
