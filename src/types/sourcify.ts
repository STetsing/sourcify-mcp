// Contract match types
export type MatchType = 'exact_match' | 'match';

// Contract verification info (minimal response)
export interface ContractVerificationInfo {
  matchId: string;
  creationMatch: MatchType;
  runtimeMatch: MatchType;
  verifiedAt: string; // ISO 8601
  match: MatchType;
  chainId: string;
  address: string; // hex address
}

// Available field groups for contract details
export type ContractField =
  | 'creationBytecode'
  | 'runtimeBytecode'
  | 'deployment'
  | 'sources'
  | 'compilation'
  | 'abi'
  | 'userdoc'
  | 'devdoc'
  | 'storageLayout'
  | 'metadata'
  | 'stdJsonInput'
  | 'stdJsonOutput'
  | 'proxyResolution'
  | 'all';

// Bytecode details
export interface BytecodeDetails {
  onchainBytecode?: string;
  recompiledBytecode?: string;
  sourceMap?: string;
  linkReferences?: Record<string, any>;
  cborAuxdata?: any;
  transformations?: any[];
  immutableReferences?: Record<string, any>; // runtime only
}

// Deployment info
export interface DeploymentInfo {
  transactionHash: string;
  blockNumber: number;
  transactionIndex: number;
  deployer: string;
}

// Compilation info
export interface CompilationInfo {
  language: 'Solidity' | 'Vyper';
  compiler: string;
  compilerVersion: string;
  compilerSettings: any;
  name: string;
  fullyQualifiedName: string;
}

// Proxy types supported by Sourcify
export type ProxyType =
  | 'EIP1167Proxy'
  | 'FixedProxy'
  | 'EIP1967Proxy'
  | 'GnosisSafeProxy'
  | 'DiamondProxy'
  | 'PROXIABLEProxy'
  | 'ZeppelinOSProxy'
  | 'SequenceWalletProxy';

export interface ProxyResolution {
  type: ProxyType;
  implementation?: string;
  // Additional proxy-specific fields
}

// Full contract details with all possible fields
export interface ContractDetails extends ContractVerificationInfo {
  creationBytecode?: BytecodeDetails;
  runtimeBytecode?: BytecodeDetails;
  deployment?: DeploymentInfo;
  sources?: Record<string, string>; // filename -> content
  compilation?: CompilationInfo;
  abi?: any[];
  userdoc?: any;
  devdoc?: any;
  storageLayout?: any;
  metadata?: any;
  stdJsonInput?: any;
  stdJsonOutput?: any;
  proxyResolution?: ProxyResolution;
}

// List contracts response
export interface ContractsListResponse {
  results: ContractVerificationInfo[];
}

// Verification request
export interface VerificationRequest {
  address: string;
  chain: string;
  files: Record<string, string>; // filename -> content
  compilerVersion?: string;
  creatorTxHash?: string;
  chosenContract?: string;
}

// Create2 verification request
export interface Create2VerificationRequest {
  deployerAddress: string;
  salt: string;
  create2Address: string;
  abiEncodedConstructorArguments?: string;
  files: Record<string, string>;
  compilerVersion?: string;
  chosenContract?: string;
}

// Verification job response
export interface VerificationJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  result?: ContractDetails;
}

// Similarity search request
export interface SimilaritySearchRequest {
  bytecode: string;
  chainId?: string;
}

// Similarity search response
export interface SimilaritySearchResponse {
  matches: Array<{
    chainId: string;
    address: string;
    similarity: number;
    matchType: MatchType;
  }>;
}
