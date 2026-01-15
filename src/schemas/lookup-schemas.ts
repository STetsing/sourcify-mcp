import { z } from 'zod';

// Ethereum address validation
const ethereumAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Chain ID validation
const chainId = z.string().regex(/^\d+$/, 'Chain ID must be numeric');

// List contracts schema
export const listContractsSchema = z.object({
  chainId: chainId,
  limit: z.number().min(1).max(200).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  afterMatchId: z.string().optional(),
});

// Get contract schema
export const getContractSchema = z.object({
  chainId: chainId,
  address: ethereumAddress,
  fields: z
    .array(
      z.enum([
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
      ])
    )
    .optional(),
  omit: z
    .array(
      z.enum([
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
      ])
    )
    .optional(),
});
