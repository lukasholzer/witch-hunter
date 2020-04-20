import { HttpService, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import {
  gameStarted,
  playerJoined,
  playerLeft,
  RevealCardData,
  SocketMessages,
  TellHandData,
  LoginData,
  JoinLobbyData,
  joinLobbySuccess,
  leaveLobbySuccess,
  joinLobbyFailed,
  loginFailed,
  loginSuccess,
  startGameFailed,
} from '@treasure-hunt/shared/actions';
import { Player } from '@treasure-hunt/shared/interfaces';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { GameService } from './game/game.service';
import { LobbyService } from './lobby/lobby.service';
import { MIN_PLAYERS } from '@treasure-hunt/api/game/core';

const PLAYERS = new Map<string, Player>();

@WebSocketGateway({ transports: ['websocket'] })
export class AppGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('App Gateway');

  constructor(
    private _lobbyService: LobbyService,
    private _gameService: GameService,
  ) {}

  handleDisconnect(client: Socket) {
    const lobbyName = this._lobbyService.getJoinedLobby(client.id);
    this.server.to(lobbyName).emit('actions', playerLeft());
    this._lobbyService.leaveLobby(lobbyName, client.id);
    this._gameService.resetGame(lobbyName);
    PLAYERS.delete(client.id);
  }

  @SubscribeMessage(SocketMessages.Login)
  login(@ConnectedSocket() { id }: Socket, @MessageBody() data: LoginData) {
    const { name, avatar: image } = data;

    if (!name || !image) {
      return {
        event: 'actions',
        data: loginFailed({ message: 'No name or avatar provided!' }),
      };
    }

    PLAYERS.set(id, { id, name, image });
    this.logger.log(`Player <${name}> logged in with socket id ${id}`);

    return {
      event: 'actions',
      data: loginSuccess(),
    };
  }

  @SubscribeMessage(SocketMessages.JoinLobby)
  joinLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinLobbyData,
  ): WsResponse {
    const player = PLAYERS.get(client.id);
    const { lobbyName } = data;

    if (!player) {
      return {
        event: 'actions',
        data: joinLobbyFailed({ message: 'Please login first!' }),
      };
    }

    try {
      this._lobbyService.joinLobby(lobbyName, player);
      client.join(lobbyName);
      client.emit('actions', joinLobbySuccess({ player }));
      this.server.to(lobbyName).emit('actions', playerJoined({ player }));
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage(SocketMessages.LeaveLobby)
  leaveLobby(@ConnectedSocket() client: Socket) {
    const lobbyName = this._lobbyService.getJoinedLobby(client.id);

    try {
      this._lobbyService.leaveLobby(lobbyName, client.id);
      client.leave(name);

      this.server
        .to(lobbyName)
        .emit('actions', leaveLobbySuccess({ playerId: client.id }));
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage(SocketMessages.StartGame)
  startGame(@ConnectedSocket() client: Socket) {
    const lobbyName = this._lobbyService.getJoinedLobby(client.id);
    const lobby = this._lobbyService.getLobby(lobbyName);

    if (lobby.players.length >= MIN_PLAYERS) {
      this._gameService.startGame(lobby.players, lobbyName);
      this.server.to(lobbyName).emit('actions', gameStarted());
    } else {
      return {
        event: 'actions',
        data: startGameFailed({ message: `Starting the game failed needed at least ${MIN_PLAYERS} players`}),
      };
    }
  }

  @SubscribeMessage(SocketMessages.TellHand)
  tellHand(
    @ConnectedSocket() { id }: Socket,
    @MessageBody() data: TellHandData,
  ) {
    const lobbyName = this._lobbyService.getJoinedLobby(id);
    const { hand } = data;
    this.server
      .to(lobbyName)
      .emit('actions', this._gameService.pretendHand(id, hand));
  }

  @SubscribeMessage(SocketMessages.RevealCard)
  revealCard(
    @ConnectedSocket() { id }: Socket,
    @MessageBody() data: RevealCardData,
  ) {
    const lobbyName = this._lobbyService.getJoinedLobby(id);
    const { playerId, cardIndex } = data;
    this.server
      .to(lobbyName)
      .emit('actions', this._gameService.revealCard(id, playerId, +cardIndex));
  }

  @SubscribeMessage(SocketMessages.GetGameState)
  getGameState(@ConnectedSocket() { id }: Socket) {
    return {
      event: 'actions',
      data: this._gameService.getGameState(id),
    };
  }

  @SubscribeMessage(SocketMessages.GetPlayerDetails)
  getPlayerDetails(@ConnectedSocket() { id }: Socket) {
    return {
      event: 'actions',
      data: this._gameService.getPlayerDetails(id),
    };
  }
}
