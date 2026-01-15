import { z } from 'zod';

// Similarity search schema
export const similaritySearchSchema = z.object({
  bytecode: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid bytecode format'),
  chainId: z.string().optional(),
});
