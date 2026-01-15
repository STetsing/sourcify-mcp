# Sourcify MCP Server

A Model Context Protocol (MCP) server for Sourcify smart contract verification. This server exposes Sourcify's API v2 functionality through MCP tools, allowing AI assistants to verify smart contracts, look up verified contracts, and search for similar contracts.

## Features

- **Contract Lookup**: List and retrieve verified contracts with detailed information
- **Contract Verification**: Verify smart contracts with standard and CREATE2 deployments
- **Job Status**: Poll verification job status
- **Similarity Search**: Find contracts with similar bytecode
- **Field Selection**: Request specific contract fields to minimize bandwidth
- **Proxy Detection**: Automatic detection of 8 proxy types
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support with runtime validation

## Available Tools

### 1. `sourcify_list_contracts`
List verified contracts for a specific blockchain with pagination support.

**Parameters:**
- `chainId` (required): Blockchain chain ID
- `limit` (optional): Number of contracts (max 200, default 50)
- `sort` (optional): Sort order 'asc' or 'desc'
- `afterMatchId` (optional): Match ID for pagination

### 2. `sourcify_get_contract`
Get detailed information about a specific verified contract.

**Parameters:**
- `chainId` (required): Blockchain chain ID
- `address` (required): Contract address
- `fields` (optional): Array of fields to include
- `omit` (optional): Array of fields to exclude

**Available Fields:**
- `creationBytecode`, `runtimeBytecode`, `deployment`, `sources`, `compilation`
- `abi`, `userdoc`, `devdoc`, `storageLayout`, `metadata`
- `stdJsonInput`, `stdJsonOutput`, `proxyResolution`, `all`

### 3. `sourcify_verify_contract`
Submit a smart contract for verification (session-based).

**Parameters:**
- `address` (required): Contract address
- `chain` (required): Chain ID or name
- `files` (required): Object mapping filenames to contents
- `compilerVersion` (optional): Solidity compiler version
- `creatorTxHash` (optional): Creation transaction hash
- `chosenContract` (optional): Specific contract if multiple

### 4. `sourcify_verify_create2`
Verify a CREATE2 deployed contract.

**Parameters:**
- `deployerAddress` (required): Deployer address
- `salt` (required): CREATE2 salt
- `create2Address` (required): Resulting CREATE2 address
- `files` (required): Source files
- `abiEncodedConstructorArguments` (optional): Constructor args
- `compilerVersion` (optional): Compiler version
- `chosenContract` (optional): Specific contract

### 5. `sourcify_check_job_status`
Check the status of a verification job.

**Parameters:**
- `jobId` (required): Verification job ID

### 6. `sourcify_find_similar_contracts`
Find contracts with similar bytecode.

**Parameters:**
- `bytecode` (required): Runtime bytecode to search
- `chainId` (optional): Chain ID to narrow search

## Installation

```bash
npm install
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build the project
npm run build

# Run the built server
npm start

# Run tests
npm test

# mcp test with UI, this will open a web interface where you can test all tools interactively.
npx @modelcontextprotocol/inspector node dist/index.js
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=3000
HOST=localhost
SOURCIFY_BASE_URL=https://sourcify.dev/server
API_TIMEOUT=30000
```

## Usage with MCP Clients

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "sourcify": {
      "command": "node",
      "args": ["/path/to/sourcify-mcp/dist/index.js"]
    }
  }
}
```

## API Documentation

- [Sourcify API v2 Documentation](https://docs.sourcify.dev/docs/api/)
- [Sourcify APIv2 Lookup Endpoints](https://docs.sourcify.dev/blog/apiv2-lookup-endpoints/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
