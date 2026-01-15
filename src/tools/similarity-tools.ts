import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { SourcifyClient } from '../clients/index.js';
import { similaritySearchSchema } from '../schemas/index.js';
import { formatSimilarityResults, wrapToolError } from '../utils/index.js';

export async function handleSimilarityTools(
  request: CallToolRequest,
  client: SourcifyClient
): Promise<any | null> {
  if (request.params.name === 'sourcify_find_similar_contracts') {
    try {
      const inputs = similaritySearchSchema.parse(request.params.arguments);
      const results = await client.findSimilarContracts(inputs);

      return {
        content: [
          {
            type: 'text' as const,
            text: formatSimilarityResults(results),
          },
        ],
      };
    } catch (error) {
      return wrapToolError('sourcify_find_similar_contracts', error);
    }
  }

  return null;
}
