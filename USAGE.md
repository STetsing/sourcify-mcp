# Sourcify MCP Server - Usage Examples

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Configure your MCP client to use this server.

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sourcify": {
      "command": "node",
      "args": [
        "/Users/pipper/Desktop/work/Remix/sourcify-mcp/dist/index.js"
      ]
    }
  }
}
```

## Example Tool Calls

### 1. List Verified Contracts

List the most recent verified contracts on Ethereum mainnet:

```json
{
  "name": "sourcify_list_contracts",
  "arguments": {
    "chainId": "1",
    "limit": 10,
    "sort": "desc"
  }
}
```

### 2. Get Contract Details

Get detailed information about a specific contract:

```json
{
  "name": "sourcify_get_contract",
  "arguments": {
    "chainId": "1",
    "address": "0x1234567890123456789012345678901234567890",
    "fields": ["abi", "sources", "compilation"]
  }
}
```

Get all available information:

```json
{
  "name": "sourcify_get_contract",
  "arguments": {
    "chainId": "1",
    "address": "0x1234567890123456789012345678901234567890",
    "fields": ["all"]
  }
}
```

### 3. Verify a Contract

Submit a contract for verification:

```json
{
  "name": "sourcify_verify_contract",
  "arguments": {
    "address": "0x1234567890123456789012345678901234567890",
    "chain": "1",
    "files": {
      "MyContract.sol": "pragma solidity ^0.8.0; contract MyContract { ... }",
      "metadata.json": "{ ... }"
    },
    "compilerVersion": "0.8.20"
  }
}
```

### 4. Check Verification Job Status

Poll a verification job:

```json
{
  "name": "sourcify_check_job_status",
  "arguments": {
    "jobId": "f4ed8a9b-c852-4ac6-ac99-bd71ffb01305"
  }
}
```

### 5. Find Similar Contracts

Search for contracts with similar bytecode:

```json
{
  "name": "sourcify_find_similar_contracts",
  "arguments": {
    "bytecode": "0x6080604052348015600f57600080fd5b50...",
    "chainId": "1"
  }
}
```

## Typical Workflows

### Workflow 1: Verify a New Contract

1. Call `sourcify_verify_contract` with your contract files
2. Get back a `jobId`
3. Poll with `sourcify_check_job_status` until status is "completed"
4. View the verification result

### Workflow 2: Get Contract Source Code

1. Call `sourcify_get_contract` with fields=["sources"]
2. Extract source code from the response

### Workflow 3: Find Unverified Contract Source

1. Get the contract bytecode from the blockchain
2. Call `sourcify_find_similar_contracts` with the bytecode
3. Find a similar verified contract
4. Use the similar contract's source as a reference

## Supported Chains

Sourcify supports hundreds of EVM-compatible chains. Common chain IDs:
- Ethereum Mainnet: `1`
- Sepolia: `11155111`
- Polygon: `137`
- Arbitrum: `42161`
- Optimism: `10`
- Base: `8453`