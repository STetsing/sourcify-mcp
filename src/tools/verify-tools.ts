import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { SourcifyClient } from '../clients/index.js';
import { verifyContractSchema, verifyCreate2Schema } from '../schemas/index.js';
import { formatVerificationJob, wrapToolError } from '../utils/index.js';

export async function handleVerifyTools(
  request: CallToolRequest,
  client: SourcifyClient
): Promise<any | null> {
  // Tool 3: Verify contract
  if (request.params.name === 'sourcify_verify_contract') {
    try {
      const inputs = verifyContractSchema.parse(request.params.arguments);
      const job = await client.verifyContract(inputs);

      return {
        content: [
          {
            type: 'text' as const,
            text: formatVerificationJob(job),
          },
        ],
      };
    } catch (error) {
      return wrapToolError('sourcify_verify_contract', error);
    }
  }

  // Tool 4: Verify CREATE2 contract
  if (request.params.name === 'sourcify_verify_create2') {
    try {
      const inputs = verifyCreate2Schema.parse(request.params.arguments);
      const job = await client.verifyCreate2Contract(inputs);

      return {
        content: [
          {
            type: 'text' as const,
            text: formatVerificationJob(job),
          },
        ],
      };
    } catch (error) {
      return wrapToolError('sourcify_verify_create2', error);
    }
  }

  return null;
}
