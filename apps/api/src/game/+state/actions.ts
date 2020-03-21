import { Player } from '@witch-hunter/api-interfaces';

/** Enum for all the possible action types */
export enum ActionType {
  INIT = '@@actions init',
  JOIN_GAME = '@@actions join game',
  LEAVE_GAME = '@@actions leave game',
  START_GAME = '@@actions start game'
}

/** Interface for an action */
export interface Action<T = any> {
  readonly type: ActionType;
  payload?: T;
}
/** Function which helps to create actions without mistakes */
export const action = <T>(type: ActionType, payload?: T): Action<T> => ({
  type,
  payload
});

/** Action that starts the game */
export const startGame = () => action<void>(ActionType.START_GAME);

/** Join the game with a player */
export const joinGame = (player: Player) =>
  action<Player>(ActionType.JOIN_GAME, player);

/** Leaves a game */
export const leaveGame = (player: Player) =>
  action<Player>(ActionType.JOIN_GAME, player);