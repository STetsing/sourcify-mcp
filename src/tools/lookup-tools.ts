import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js';
import { SourcifyClient } from '../clients/index.js';
import { listContractsSchema, getContractSchema } from '../schemas/index.js';
import { formatContractDetails, formatContractsList, wrapToolError } from '../utils/index.js';

export async function handleLookupTools(
  request: CallToolRequest,
  client: SourcifyClient
): Promise<any | null> {
  // Tool 1: List verified contracts
  if (request.params.name === 'sourcify_list_contracts') {
    try {
      const inputs = listContractsSchema.parse(request.params.arguments);
      const { chainId, limit = 50, sort = 'desc', afterMatchId } = inputs;

      const response = await client.listContracts(chainId, {
        limit,
        sort,
        afterMatchId,
      });

      const formatted = formatContractsList(response);

      return {
        content: [
          {
            type: 'text' as const,
            text: `Found ${response.results.length} verified contracts on chain ${chainId}\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return wrapToolError('sourcify_list_contracts', error);
    }
  }

  // Tool 2: Get contract details
  if (request.params.name === 'sourcify_get_contract') {
    try {
      const inputs = getContractSchema.parse(request.params.arguments);
      const { chainId, address, fields, omit } = inputs;

      const contract = await client.getContract(chainId, address, {
        fields,
        omit,
      });

      const formatted = formatContractDetails(contract, fields);

      return {
        content: [
          {
            type: 'text' as const,
            text: formatted,
          },
        ],
      };
    } catch (error) {
      return wrapToolError('sourcify_get_contract', error);
    }
  }

  return null;
}
