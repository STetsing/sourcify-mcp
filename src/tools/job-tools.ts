import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { SourcifyClient } from '../clients/index.js';
import { jobStatusSchema } from '../schemas/index.js';
import { formatJobStatus, wrapToolError } from '../utils/index.js';

export async function handleJobTools(
  request: CallToolRequest,
  client: SourcifyClient
): Promise<any | null> {
  if (request.params.name === 'sourcify_check_job_status') {
    try {
      const inputs = jobStatusSchema.parse(request.params.arguments);
      const job = await client.getJobStatus(inputs.jobId);

      return {
        content: [
          {
            type: 'text' as const,
            text: formatJobStatus(job),
          },
        ],
      };
    } catch (error) {
      return wrapToolError('sourcify_check_job_status', error);
    }
  }

  return null;
}
