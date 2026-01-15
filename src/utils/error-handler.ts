import { AxiosError } from 'axios';

export class SourcifyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SourcifyError';
  }
}

export function handleSourcifyError(error: AxiosError): SourcifyError {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 404:
        return new SourcifyError(
          'Contract not found or not verified on Sourcify',
          404,
          data
        );
      case 400:
        return new SourcifyError(
          `Invalid request: ${JSON.stringify(data)}`,
          400,
          data
        );
      case 429:
        return new SourcifyError(
          'Rate limit exceeded. Please try again later.',
          429,
          data
        );
      case 500:
      case 502:
      case 503:
        return new SourcifyError(
          'Sourcify service is temporarily unavailable',
          status,
          data
        );
      default:
        return new SourcifyError(
          `Sourcify API error: ${status}`,
          status,
          data
        );
    }
  }

  if (error.request) {
    return new SourcifyError(
      'Failed to connect to Sourcify API. Please check your network connection.',
      undefined,
      { originalError: error.message }
    );
  }

  return new SourcifyError(
    'Unexpected error occurred',
    undefined,
    { originalError: error.message }
  );
}

// MCP tool error wrapper
export function wrapToolError(toolName: string, error: unknown) {
  if (error instanceof SourcifyError) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `[${toolName}] Error: ${error.message}${
            error.details ? `\n\nDetails: ${JSON.stringify(error.details, null, 2)}` : ''
          }`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `[${toolName}] Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  };
}
