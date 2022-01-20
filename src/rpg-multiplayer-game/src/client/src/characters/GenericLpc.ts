import Phaser from 'phaser'
import AvatarAnimationKeys from '~/consts/AvatarAnimationKeys';
import { AnimationHandler } from '../anims/AnimationHandler';
import AvatarKeys from '../consts/AvatarKeys';
import { MovementInput, PlayerId } from '../types/playerTypes'

import Player from './Player'

interface PlayerData {
  avatar: AvatarKeys;
  playerId: PlayerId;
}

export default class GenericLpc extends Player {
  playerData: PlayerData;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerData: PlayerData,
  ) {
    // UNCAUGHT BUG: For some reason I couldn't find yet, the player
    // rendering needs to be moved by 16 pixels in X and Y. 
    // Remove this when the bug is fixed
    const errorOffset = 16;

    super(scene, x + errorOffset, y + errorOffset, playerData.avatar, playerData.playerId)
    this.playerData = playerData;

    AnimationHandler.add(scene, playerData.avatar);

    this.anims.play(`${playerData.avatar}-${AvatarAnimationKeys.IDLE_DOWN}`)
  }

  update(movementInput: MovementInput) {
    super.update(movementInput)

    const { avatar } = this.playerData;

    if (movementInput.left) {
      // Moving Left
      this.anims.play(`${avatar}-${AvatarAnimationKeys.WALK_SIDE}`, true)

      // Flip sprite to the left
      this.setFlipX(true)
    } else if (movementInput.right) {
      // Moving Right
      this.anims.play(`${avatar}-${AvatarAnimationKeys.WALK_SIDE}`, true)

      // Flip sprite to the right
      this.setFlipX(false)
    } else if (movementInput.up) {
      // Moving Up
      this.anims.play(`${avatar}-${AvatarAnimationKeys.WALK_UP}`, true)
    } else if (movementInput.down) {
      // Moving Down
      this.anims.play(`${avatar}-${AvatarAnimationKeys.WALK_DOWN}`, true)
    } else {
      const parts = this.anims.currentAnim.key.split('-')
      parts[2] = 'idle'
      this.anims.play(parts.join('-'))
    }
  }
}