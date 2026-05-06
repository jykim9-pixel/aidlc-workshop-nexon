import { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
}

export class SSEService {
  private clients: SSEClient[] = [];

  addClient(id: string, res: Response): void {
    this.clients.push({ id, res });

    res.on('close', () => {
      this.removeClient(id);
    });
  }

  removeClient(id: string): void {
    this.clients = this.clients.filter((client) => client.id !== id);
  }

  broadcast(event: string, data: unknown): void {
    const payload = JSON.stringify({
      timestamp: new Date().toISOString(),
      payload: data,
    });

    this.clients.forEach((client) => {
      client.res.write(`event: ${event}\n`);
      client.res.write(`data: ${payload}\n\n`);
    });
  }

  getConnectedClients(): number {
    return this.clients.length;
  }
}

export const sseService = new SSEService();
