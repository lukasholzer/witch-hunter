export interface SocketMessage<T = any> {
  type: MESSAGE_TYPES;
  value?: T;
}

export const enum MESSAGE_TYPES {
  playerJoined = 'PLAYER_JOINED',
  assignCharacter = 'ASSIGN_CHARACTER',
  joinGame = 'JOIN_GAME',
  game = 'GAME',
  startGame = 'START_GAME',
}

export interface Birthday {
  dmy: string;
  mdy: string;
  raw: number;
}

export interface CreditCard {
  expiration: string;
  number: string;
  pin: number;
  security: number;
}

export interface Player {
  name: string;
  surname: string;
  gender: string;
  region: string;
  age: number;
  title: string;
  phone: string;
  birthday: Birthday;
  email: string;
  password: string;
  credit_card: CreditCard;
  photo: string;
}
