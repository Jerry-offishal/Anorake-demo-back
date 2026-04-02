import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  public server: Server;

  /**
   * Emit an event to all clients in a specific tenant room.
   */
  emitToTenant(tenantId: string, event: string, payload: unknown): void {
    if (this.server) {
      this.server.to(tenantId).emit(event, payload);
    }
  }
}
