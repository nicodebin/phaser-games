import Phaser from 'phaser';
import AvatarAnimationKeys from '../consts/AvatarAnimationKeys';
import { AnimationHandler } from '../anims/AnimationHandler';
import AbstractThrowableWeapon from '../classes/AbstractThrowableWeapon';
import AvatarKeys from '../consts/AvatarKeys';
import TextureKeys from '../consts/TextureKeys';
import { MovementInput, Orientation, PlayerId } from '../types/playerTypes';

import Player from './Player';
import SceneKeys from '../consts/SceneKeys';
import Game from '../scenes/Game';

interface PlayerData {
  avatar: AvatarKeys;
  username?: string;
  playerId: PlayerId;
}

export default class GenericLpc extends Player {
  private playerData: PlayerData;
  private bloodParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private bloodParticlesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private errorOffset = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerData: PlayerData,
    errorOffset = 16,
  ) {
    // UNCAUGHT BUG: For some reason I couldn't find yet, the player
    // rendering needs to be moved by 16 pixels in X and Y.
    // Remove this when the bug is fixed
    // const errorOffset = 16;
    super(
      scene,
      x + errorOffset,
      y + errorOffset,
      playerData.avatar,
      playerData.playerId,
    );
    this.errorOffset = errorOffset;
    this.playerData = playerData;

    if (playerData.username) {
      this.usernameLabel = scene.add
        .text(0, 0, ' ' + playerData.username.substring(0, 25) + ' ', {
          fontSize: '10px',
          color: 'white',
          backgroundColor: 'black',
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0.6)
        .setVisible(this.displayUsernameLabel);
      this.usernameLabel.autoRound = true;
    }

    AnimationHandler.add(scene, playerData.avatar);

    this.anims.play(`${playerData.avatar}-${AvatarAnimationKeys.IDLE_DOWN}`);

    this.bloodParticles = scene.add.particles(TextureKeys.Blood);
    this.bloodParticlesEmitter = this.bloodParticles.createEmitter({
      alpha: { start: 0.7, end: 0 },
      lifespan: { min: 700, max: 1000 },
      speed: { min: 10, max: 60 },
      gravityY: 90,
      quantity: 4,
      angle: 360 - 20,
      timeScale: 2,
      on: false,
    });
    this.bloodParticlesEmitter.startFollow(this, 5, 10, true);
  }

  protected preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.usernameLabel
      ?.setPosition(this.x, this.y + this.displayHeight - 10 - this.errorOffset)
      .setDepth(this.depth)
      .setVisible(this.displayUsernameLabel && this.visible);
  }

  update(movementInput: MovementInput) {
    super.update(movementInput);

    if (this.isDead) return;

    const { avatar } = this.playerData;

    // Don't override fighting animation
    if (this.isThrowingArrow()) return;

    if (movementInput.left) {
      // Moving Left
      this.play(`${avatar}-${AvatarAnimationKeys.WALK_SIDE}`, true);

      // Flip sprite to the left
      this.setFlipX(true);
    } else if (movementInput.right) {
      // Moving Right
      this.play(`${avatar}-${AvatarAnimationKeys.WALK_SIDE}`, true);

      // Flip sprite to the right
      this.setFlipX(false);
    } else if (movementInput.up) {
      // Moving Up
      this.play(`${avatar}-${AvatarAnimationKeys.WALK_UP}`, true);
    } else if (movementInput.down) {
      // Moving Down
      this.play(`${avatar}-${AvatarAnimationKeys.WALK_DOWN}`, true);
    } else {
      const parts = this.anims.currentAnim.key.split('-');
      const index = avatar.includes('-') ? 2 : 1;
      parts[index] = 'idle';
      this.play(parts.join('-'));
    }
  }

  setDepth(value: number): this {
    super.setDepth(value);
    this.bloodParticles.setDepth(value);
    return this;
  }

  private throwArrow(): boolean {
    if (!this.throwableWeaponGroup) {
      console.error('this.throwableWeaponGroup is undefined');
      return false;
    }

    // Player is already throwing an arrow
    if (this.isThrowingArrow()) {
      return false;
    }

    const arrow = this.throwableWeaponGroup.get(
      this.x,
      this.y,
    ) as AbstractThrowableWeapon;

    if (!arrow) {
      // No more arrows: max reached
      return false;
    }

    arrow.fire(this.x, this.y, this.orientation, this.id);

    // kill arrow after 5 seconds
    this.scene.time.delayedCall(
      2000,
      () => {
        if (arrow && arrow.active) {
          this.throwableWeaponGroup?.killAndHide(arrow);
          arrow.disableBody();
        }
      },
      [],
      this,
    );

    return true;
  }

  // Indicates is the shooting animation is playing
  private isThrowingArrow(): boolean {
    const { avatar } = this.playerData;
    return [
      `${avatar}-${AvatarAnimationKeys.SHOOT_SIDE}`,
      `${avatar}-${AvatarAnimationKeys.SHOOT_UP}`,
      `${avatar}-${AvatarAnimationKeys.SHOOT_DOWN}`,
    ].includes(this.anims.currentAnim.key);
  }

  private handleFightAnimation(): void {
    const { avatar } = this.playerData;
    let animation: string | undefined;

    const currentAnimation = this.anims.getName();
    let flipX = false;

    switch (this.orientation) {
      case 'left':
        animation = `${avatar}-${AvatarAnimationKeys.SHOOT_SIDE}`;
        flipX = true;
        break;
      case 'right':
        animation = `${avatar}-${AvatarAnimationKeys.SHOOT_SIDE}`;
        break;
      case 'up':
        animation = `${avatar}-${AvatarAnimationKeys.SHOOT_UP}`;
        break;
      case 'down':
        animation = `${avatar}-${AvatarAnimationKeys.SHOOT_DOWN}`;
        break;
    }
    if (animation) {
      this.play(animation);
      this.playAfterRepeat(currentAnimation);
      this.setFlipX(flipX);
    }
  }

  fight(): boolean {
    if (!super.fight()) return false;
    if (this.throwArrow()) {
      this.handleFightAnimation();
      return true;
    }
    return false;
  }

  set enableBlood(value: boolean) {
    super.enableBlood = value;

    const scene = this.scene as Game;
    scene.bloodSplatterRenderTexture
      .setVisible(this.enableBlood)
      .setActive(this.enableBlood);
  }

  get enableBlood(): boolean {
    return super.enableBlood;
  }

  hurt(amount: number, orientation?: Orientation) {
    super.hurt(amount);
    if (this.isDead) return;

    this.healthBar.decrease(amount);

    // Bail if blood is disabled
    if (!this.enableBlood) return;

    switch (orientation) {
      case 'up':
        this.bloodParticlesEmitter.setAngle(50);
        this.bloodParticlesEmitter.followOffset = new Phaser.Math.Vector2(0, 0);
        break;

      case 'down':
        this.bloodParticlesEmitter.setAngle(360 - 50);
        this.bloodParticlesEmitter.followOffset = new Phaser.Math.Vector2(
          0,
          10,
        );
        break;

      case 'right':
        this.bloodParticlesEmitter.setAngle(360 - 180 + 20);
        this.bloodParticlesEmitter.followOffset = new Phaser.Math.Vector2(
          -5,
          10,
        );
        break;

      case 'left':
      default:
        this.bloodParticlesEmitter.setAngle(360 + 20);
        this.bloodParticlesEmitter.followOffset = new Phaser.Math.Vector2(
          5,
          10,
        );
    }

    this.bloodParticlesEmitter.onParticleDeath(
      (particle: Phaser.GameObjects.Particles.Particle) => {
        const scene = this.scene as Game;
        const x = particle.x + Phaser.Math.Between(0, 20);
        const y = particle.y + Phaser.Math.Between(0, 20);
        scene.bloodSplatterRenderTexture.draw(TextureKeys.Blood, x, y);

        const disolveBlood = (alpha) =>
          scene.bloodSplatterRenderTexture
            .erase(TextureKeys.Blood, x, y)
            .draw(TextureKeys.Blood, x, y, alpha);

        // Disolve blood after 3 seconds
        this.scene.time.delayedCall(3000, () =>
          disolveBlood(Phaser.Math.Between(5, 10) / 10),
        );
      },
    );

    this.bloodParticlesEmitter.start();
    this.scene.time.delayedCall(500, () => {
      this.bloodParticlesEmitter.stop();
    });
  }

  winner(): void {
    if (this.isDead) return;
    super.winner();
    const animation = `${this.playerData.avatar}-${AvatarAnimationKeys.WINNER}`;
    this.play(animation);
  }

  kill(): void {
    if (this.isDead) return;
    super.kill();
    const animation = `${this.playerData.avatar}-${AvatarAnimationKeys.DIE}`;
    this.play(animation, false);
    this.healthBar.setVisible(false);
  }

  revive(): void {
    super.revive();
    this.healthBar.setValue(100).setVisible(false);
  }
}
