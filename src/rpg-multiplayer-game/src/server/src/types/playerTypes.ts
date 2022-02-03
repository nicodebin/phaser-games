import { AvatarSetting } from "../characters/AvatarSetting";
import Queue from "../classes/queue";

export type MovementInput = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export type PlayerId = string;

export interface PlayerInitialState {
  playerId: PlayerId
  x: number
  y: number
  avatar: AvatarSetting
  votingZone: string | undefined
}

export interface PlayerState extends Omit<PlayerInitialState, "avatar"> {
  movementInput: MovementInput
}

export interface PlayersStates {
  [playerId: PlayerId]: PlayerState
}

export interface PlayersInitialStates {
  [playerId: PlayerId]: PlayerInitialState
}

export interface PlayersInputQueue {
  [playerId: PlayerId]: Queue<MovementInput>
}
