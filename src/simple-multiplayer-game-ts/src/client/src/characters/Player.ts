import Phaser from 'phaser'

export type PlayerId = string;

export default class Player extends Phaser.GameObjects.Sprite {
  private playerId: PlayerId

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string | Phaser.Textures.Texture, playerId: string, frame?: string | number | undefined) {
    super(scene, x, y, texture)
    this.playerId = playerId
  }

  get id (){
    return this.playerId
  }
}
