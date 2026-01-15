import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SourcifyClient } from './clients/index.js';
import {
  handleLookupTools,
  handleVerifyTools,
  handleJobTools,
  handleSimilarityTools,
} from './tools/index.js';
import { SOURCIFY_BASE_URL } from './config/index.js';

export async function createServer(): Promise<Server> {
  const server = new Server(
    {
      name: 'sourcify-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize Sourcify client
  const sourcifyClient = new SourcifyClient(SOURCIFY_BASE_URL);

  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'sourcify_list_contracts',
          description:
            'Retrieve a paginated list of verified contracts for a specific blockchain. Returns basic verification info including address, match type, and verification timestamp.',
          inputSchema: {
            type: 'object',
            properties: {
              chainId: {
                type: 'string',
                description: 'The blockchain chain ID (e.g., "1" for Ethereum mainnet)',
              },
              limit: {
                type: 'number',
                description: 'Number of contracts to return (max 200, default 50)',
                minimum: 1,
                maximum: 200,
              },
              sort: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort order by verification date (default: desc)',
              },
              afterMatchId: {
                type: 'string',
                description: 'Match ID for pagination (get contracts after this ID)',
              },
            },
            required: ['chainId'],
          },
        },
        {
          name: 'sourcify_get_contract',
          description:
            'Retrieve detailed information about a specific verified contract. By default returns minimal verification info. Use the fields parameter to request additional data like ABI, source code, bytecode, compilation details, etc.',
          inputSchema: {
            type: 'object',
            properties: {
              chainId: {
                type: 'string',
                description: 'The blockchain chain ID',
              },
              address: {
                type: 'string',
                description: 'The contract address (0x...)',
              },
              fields: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'creationBytecode',
                    'runtimeBytecode',
                    'deployment',
                    'sources',
                    'compilation',
                    'abi',
                    'userdoc',
                    'devdoc',
                    'storageLayout',
                    'metadata',
                    'stdJsonInput',
                    'stdJsonOutput',
                    'proxyResolution',
                    'all',
                  ],
                },
                description: 'Specific fields to include in the response',
              },
              omit: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Fields to exclude from the response',
              },
            },
            required: ['chainId', 'address'],
          },
        },
        {
          name: 'sourcify_verify_contract',
          description:
            'Submit a smart contract for verification. This is a session-based operation that returns a job ID. Use sourcify_check_job_status to poll for completion. Requires contract address, chain ID, and source files including metadata.json.',
          inputSchema: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'The contract address to verify',
              },
              chain: {
                type: 'string',
                description: 'The chain ID or name',
              },
              files: {
                type: 'object',
                description: 'Object mapping filenames to file contents',
                additionalProperties: {
                  type: 'string',
                },
              },
              compilerVersion: {
                type: 'string',
                description: 'Solidity compiler version (optional)',
              },
              creatorTxHash: {
                type: 'string',
                description: 'Transaction hash that created the contract (optional)',
              },
              chosenContract: {
                type: 'string',
                description: 'Specific contract to verify if multiple in files (optional)',
              },
            },
            required: ['address', 'chain', 'files'],
          },
        },
        {
          name: 'sourcify_verify_create2',
          description:
            'Verify a contract deployed via CREATE2. Requires deployer address, salt, CREATE2 address, and source files. Optionally include ABI-encoded constructor arguments. Returns a job ID for status polling.',
          inputSchema: {
            type: 'object',
            properties: {
              deployerAddress: {
                type: 'string',
                description: 'The address that deployed the contract',
              },
              salt: {
                type: 'string',
                description: 'The salt used in CREATE2',
              },
              create2Address: {
                type: 'string',
                description: 'The resulting CREATE2 address',
              },
              abiEncodedConstructorArguments: {
                type: 'string',
                description: 'ABI-encoded constructor arguments (optional)',
              },
              files: {
                type: 'object',
                description: 'Object mapping filenames to file contents',
                additionalProperties: {
                  type: 'string',
                },
              },
              compilerVersion: {
                type: 'string',
                description: 'Solidity compiler version (optional)',
              },
              chosenContract: {
                type: 'string',
                description: 'Specific contract to verify if multiple in files (optional)',
              },
            },
            required: ['deployerAddress', 'salt', 'create2Address', 'files'],
          },
        },
        {
          name: 'sourcify_check_job_status',
          description:
            'Poll the status of a verification job using its job ID. Returns current status (pending, processing, completed, failed) and result data when completed.',
          inputSchema: {
            type: 'object',
            properties: {
              jobId: {
                type: 'string',
                description: 'The verification job ID',
              },
            },
            required: ['jobId'],
          },
        },
        {
          name: 'sourcify_find_similar_contracts',
          description:
            'Search for verified contracts with similar bytecode. Useful for finding source code when a contract is not verified. Provide runtime bytecode and optionally a chain ID to narrow the search.',
          inputSchema: {
            type: 'object',
            properties: {
              bytecode: {
                type: 'string',
                description: 'The runtime bytecode to search for (0x...)',
              },
              chainId: {
                type: 'string',
                description: 'Optional chain ID to narrow search',
              },
            },
            required: ['bytecode'],
          },
        },
      ],
    };
  });

  // Register unified tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Try each tool handler
    let result = await handleLookupTools(request, sourcifyClient);
    if (result) return result;

    result = await handleVerifyTools(request, sourcifyClient);
    if (result) return result;

    result = await handleJobTools(request, sourcifyClient);
    if (result) return result;

    result = await handleSimilarityTools(request, sourcifyClient);
    if (result) return result;

    // Unknown tool
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
}

export async function runServer() {
  const server = await createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sourcify MCP Server running on stdio');
}
