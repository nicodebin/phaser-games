import { makeAutoObservable } from 'mobx';

class GameFightState {

  private _playerWantsToFight = false
  private _fightMode = false
  private _onWaitingRoom = false

  constructor() {
    makeAutoObservable(this);
  }

  set playerWantsToFight(newValue: boolean) {
    this._playerWantsToFight = newValue;
  }

  get playerWantsToFight(): boolean {
    return this._playerWantsToFight;
  }

  set fightMode(newValue: boolean) {
    this._fightMode = newValue;
    if (newValue === true) {
      this.onWaitingRoom = false;
    }
  }

  get fightMode(): boolean {
    return this._fightMode;
  }

  set onWaitingRoom(newValue: boolean) {
    this._onWaitingRoom = newValue;
  }

  get onWaitingRoom(): boolean {
    return this._onWaitingRoom;
  }

  clear(): void {
    this.fightMode = false;
    this.playerWantsToFight = false;
    this.onWaitingRoom = false;
  }
}
export const gameFightState = new GameFightState();