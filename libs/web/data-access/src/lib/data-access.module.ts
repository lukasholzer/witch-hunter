import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { GameEffects } from './+state/game.effects';
import { GameFacade } from './+state/game.facade';
import * as fromGame from './+state/game.reducer';
import { GAME_FEATURE_KEY } from './+state/game.state';
import { EventService } from './services/event.service';
import { AuthenticationGuard } from './guards';
import { storageMetaReducer } from './storage.meta-reducer';
import { LobbyService } from './services';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(GAME_FEATURE_KEY, fromGame.reducer, {
      metaReducers: [storageMetaReducer(['player'], '_th_game-state')],
    }),
    EffectsModule.forFeature([GameEffects]),
  ],
  providers: [
    LobbyService,
    EventService,
    GameFacade,
    AuthenticationGuard,
  ],
})
export class DataAccessModule {}
