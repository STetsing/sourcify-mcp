#!/usr/bin/env node
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

const mode = process.env.MCP_TRANSPORT || process.argv[2] || 'stdio';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9003;
const HOST = process.env.HOST || 'localhost';

async function main() {
  if (mode === 'http') {
    // HTTP mode (POST only)
    const app = express();

    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'mcp-session-id'],
      exposedHeaders: ['mcp-session-id'],
      credentials: false
    }));

    app.use(express.json());

    // Store server and transport instances per session
    const sessions = new Map<string, { server: Awaited<ReturnType<typeof createServer>>, transport: StreamableHTTPServerTransport }>();

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // MCP endpoint - handles POST messages only
    app.post('/mcp', async (req, res) => {
      console.log(`MCP POST request`);

      // Get or create session ID
      let sessionId = req.headers['mcp-session-id'] as string;
      if (!sessionId) {
        sessionId = randomUUID();
      }

      // Get or create session
      let session = sessions.get(sessionId);
      if (!session) {
        console.log(`Creating new session: ${sessionId}`);
        const server = await createServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => sessionId,
        });
        await server.connect(transport);
        session = { server, transport };
        sessions.set(sessionId, session);
      }

      await session.transport.handleRequest(req, res, req.body);
    });

    app.listen(PORT, HOST, () => {
      console.log(`Sourcify MCP HTTP Server running on http://${HOST}:${PORT}`);
      console.log(`MCP endpoint: http://${HOST}:${PORT}/mcp`);
    });
  } else {
    // Stdio mode (default)
    const server = await createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('Sourcify MCP Server running on stdio');
  }
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
