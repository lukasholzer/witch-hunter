import { CardType, Player } from '@treasure-hunt/shared/interfaces';
import { uuid } from '@treasure-hunt/shared/util';
import { GameConfiguration, GAME_CONFIGURATION } from './config';
import { Deck } from './deck';

export interface PlayingPlayer  {
  id: string;
  role: CardType;
  hand: CardType[];
  pretendedHand: CardType[];
}

export class Game {
  /** The list of all participating players in this game */
  players: PlayingPlayer[];
  /** The number of rounds to play */
  rounds: number;
  /** The id of the player that is deciding */
  keyPlayer: string;
  /** The read only unique id of the game */
  get id(): string {
    return this._id;
  }
  private _id = uuid();
  /** The card deck that is used for the game */
  private _deck: Deck;
  /** The current game configuration */
  private _config: GameConfiguration;

  constructor(players: string[]) {
    this._config = GAME_CONFIGURATION.find(
      config => config.players === players.length,
    );
    // generate the deck for the amount of players
    this._deck = new Deck(players.length);
    // set the number of rounds to play
    this.rounds = this._deck.gameCards.length / players.length;
    // set the key player that should start
    this.keyPlayer = players[Math.floor(Math.random() * players.length)];
    // assign the roles to the players
    this.players = players.map(id => ({
      id,
      role: this._deck.drawRole(),
      hand: [],
      pretendedHand: []
    }));
    // start dealing game cards
    this._dealCards();
  }

  /** Get the index of a player */
  getPlayerIndex(id: string): number {
    return this.players.findIndex((player) => player.id === id);
  }

  /** Reveals a card from a player */
  reveal(playerIndex: number, cardIndex): CardType {
    const card = this.players[playerIndex].hand.splice(cardIndex, 1);
    this._deck.revealed.push(card[0]);
    return card[0];
  }

  /** A player pretends to have this hand */
  pretend(playerIndex: number, hand: CardType[]): void {
    this.players[playerIndex].pretendedHand = hand;
  }

  /** Finishes a round and deals the cards again */
  finishRound() {
    this.players.forEach(player => {
      this._deck.gameCards.push(...player.hand);
    });
    this._clearHands();
    this.rounds -= 1;
    this._dealCards();
  }

  /** Checks if the game is over */
  isFinished(): boolean {
    return this.guardiansHaveWon() || this.adventurersHaveWon();
  }

  /** Checks if the guardians have won */
  guardiansHaveWon(): boolean {
    const fires = this._deck.revealed.filter(card => card & CardType.Fire);
    return fires.length === this._config.fire;
  }

  /** Checks if the adventurers have won */
  adventurersHaveWon(): boolean {
    const gold = this._deck.revealed.filter(card => card & CardType.Gold);
    return gold.length === this._config.gold;
  }

  /** @internal represents the game as json for internal debugging usage */
  toJSON(): object {
    return {
      id: this.id,
      rounds: this.rounds,
      players: this.players,
      deck: this._deck,
    };
  }

  /** Deals the cards */
  private _dealCards() {
    this._clearHands();

    // the index of the player that gets dealt
    let currentDealing = 0;

    while (this._deck.gameCards.length) {
      const player = this.players[currentDealing];
      player.hand.push(this._deck.drawCard());

      if (currentDealing < this.players.length - 1) {
        currentDealing++;
      } else {
        currentDealing = 0;
      }
    }
  }

  /** Clears the hand of every player */
  private _clearHands(): void {
    this.players = this.players.map(player => ({
      ...player,
      hand: [],
      pretendedHand: []
    }));
  }
}
