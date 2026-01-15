import {
  ContractDetails,
  ContractsListResponse,
  VerificationJob,
  SimilaritySearchResponse,
  ContractField,
} from '../types/index.js';

export function formatContractsList(response: ContractsListResponse): string {
  return response.results
    .map((contract, index) => {
      return `${index + 1}. Contract: ${contract.address}
   Chain: ${contract.chainId}
   Match: ${contract.match} (Creation: ${contract.creationMatch}, Runtime: ${contract.runtimeMatch})
   Verified: ${new Date(contract.verifiedAt).toLocaleString()}
   Match ID: ${contract.matchId}`;
    })
    .join('\n\n');
}

export function formatContractDetails(
  contract: ContractDetails,
  requestedFields?: ContractField[]
): string {
  let output = `Contract Details for ${contract.address} on Chain ${contract.chainId}\n`;
  output += `${'='.repeat(60)}\n\n`;

  output += `Match Type: ${contract.match}\n`;
  output += `Verified At: ${new Date(contract.verifiedAt).toLocaleString()}\n\n`;

  if (contract.compilation) {
    output += `Compilation:\n`;
    output += `  Language: ${contract.compilation.language}\n`;
    output += `  Compiler: ${contract.compilation.compiler} ${contract.compilation.compilerVersion}\n`;
    output += `  Contract: ${contract.compilation.fullyQualifiedName}\n\n`;
  }

  if (contract.deployment) {
    output += `Deployment:\n`;
    output += `  Tx Hash: ${contract.deployment.transactionHash}\n`;
    output += `  Block: ${contract.deployment.blockNumber}\n`;
    output += `  Deployer: ${contract.deployment.deployer}\n\n`;
  }

  if (contract.abi) {
    output += `ABI: ${contract.abi.length} functions/events\n\n`;
  }

  if (contract.sources) {
    output += `Source Files: ${Object.keys(contract.sources).length} files\n`;
    output += `  ${Object.keys(contract.sources).join('\n  ')}\n\n`;
  }

  if (contract.proxyResolution) {
    output += `Proxy: ${contract.proxyResolution.type}\n`;
    if (contract.proxyResolution.implementation) {
      output += `  Implementation: ${contract.proxyResolution.implementation}\n`;
    }
    output += '\n';
  }

  return output;
}

export function formatVerificationJob(job: VerificationJob): string {
  let output = `Verification Job ${job.jobId}\n`;
  output += `Status: ${job.status.toUpperCase()}\n`;

  if (job.message) {
    output += `Message: ${job.message}\n`;
  }

  if (job.status === 'pending' || job.status === 'processing') {
    output += `\nUse 'sourcify_check_job_status' with jobId '${job.jobId}' to poll for completion.`;
  }

  return output;
}

export function formatJobStatus(job: VerificationJob): string {
  let output = formatVerificationJob(job);

  if (job.status === 'completed' && job.result) {
    output += `\n\nVerification completed successfully!\n`;
    output += formatContractDetails(job.result);
  } else if (job.status === 'failed') {
    output += `\n\nVerification failed. ${job.message || 'No additional details available.'}`;
  }

  return output;
}

export function formatSimilarityResults(response: SimilaritySearchResponse): string {
  if (response.matches.length === 0) {
    return 'No similar contracts found.';
  }

  let output = `Found ${response.matches.length} similar contracts:\n\n`;

  output += response.matches
    .map((match, index) => {
      return `${index + 1}. ${match.address} (Chain ${match.chainId})
   Similarity: ${(match.similarity * 100).toFixed(2)}%
   Match Type: ${match.matchType}`;
    })
    .join('\n\n');

  return output;
}
