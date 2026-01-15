import { z } from 'zod';

// Ethereum address validation
const ethereumAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Verify contract schema
export const verifyContractSchema = z.object({
  address: ethereumAddress,
  chain: z.string(),
  files: z.record(z.string(), z.string()),
  compilerVersion: z.string().optional(),
  creatorTxHash: z.string().optional(),
  chosenContract: z.string().optional(),
});

// Verify CREATE2 contract schema
export const verifyCreate2Schema = z.object({
  deployerAddress: ethereumAddress,
  salt: z.string(),
  create2Address: ethereumAddress,
  abiEncodedConstructorArguments: z.string().optional(),
  files: z.record(z.string(), z.string()),
  compilerVersion: z.string().optional(),
  chosenContract: z.string().optional(),
});

// Job status schema
export const jobStatusSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});
