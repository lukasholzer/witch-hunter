import { Action, createReducer, on } from '@ngrx/store';
import { uuid } from '@treasure-hunt/shared/util';
import { initialState, State } from './game.state';
import {
  login,
  joinGameSuccess,
  assignCharacterSuccess,
  joinedLobbySuccess,
} from './game.actions';

const gameReducer = createReducer(
  initialState,
  on(login, (state, { name, image }) => ({
    ...state,
    player: {
      name,
      image,
      id: uuid(),
    },
  })),
  on(joinedLobbySuccess, (state, { id }) => ({
    ...state,
    lobby: id,
  })),

  on(joinGameSuccess, (state, { player }) => ({
    ...state,
    player,
  })),
  on(assignCharacterSuccess, (state, { character }) => ({
    ...state,
    character,
  })),
  // on(loadGameSuccess, (state, { game }) =>
  //   gameAdapter.addAll(game, { ...state, loaded: true })
  // ),
  // on(loadGameFailure, (state, { error }) => ({ ...state, error }))
);

export function reducer(state: State | undefined, action: Action) {
  return gameReducer(state, action);
}
