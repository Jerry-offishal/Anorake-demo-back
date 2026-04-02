import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket/socket.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(private socketService: SocketService) {}

  afterInit() {
    this.socketService.server = this.server;
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTenantRoom')
  joinTenantRoom(
    @MessageBody() tenantId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    void socket.join(tenantId);
    this.logger.log(`Client ${socket.id} joined room: ${tenantId}`);
    socket.emit('joinedRoom', { tenantId });
  }

  @SubscribeMessage('leaveTenantRoom')
  leaveTenantRoom(
    @MessageBody() tenantId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    void socket.leave(tenantId);
    this.logger.log(`Client ${socket.id} left room: ${tenantId}`);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    client.emit('pong', 'pong');
  }
}
