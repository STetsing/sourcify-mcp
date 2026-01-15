#!/usr/bin/env node
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import express from 'express';
import { randomUUID } from 'crypto';

const mode = process.env.MCP_TRANSPORT || process.argv[2] || 'stdio';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9002;
const HOST = process.env.HOST || 'localhost';

async function main() {
  const server = await createServer();

  if (mode === 'http' || mode === 'sse') {
    // HTTP mode with StreamableHTTPServerTransport
    const app = express();
    app.use(express.json());

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    await server.connect(transport);

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // MCP endpoint - handles both GET (SSE) and POST (messages)
    app.all('/mcp', async (req, res) => {
      console.error(`MCP ${req.method} request`);
      await transport.handleRequest(req, res, req.body);
    });

    app.listen(PORT, HOST, () => {
      console.error(`Sourcify MCP HTTP Server running on http://${HOST}:${PORT}`);
      console.error(`MCP endpoint: http://${HOST}:${PORT}/mcp`);
    });
  } else {
    // Stdio mode (default)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Sourcify MCP Server running on stdio');
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
