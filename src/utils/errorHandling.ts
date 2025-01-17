export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): never {
  if (error instanceof APIError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new APIError(error.message, undefined, error);
  }
  
  throw new APIError('An unexpected error occurred', undefined, error);
}