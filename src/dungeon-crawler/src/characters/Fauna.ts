import { Vector } from 'matter'
import Phaser from 'phaser'

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      fauna(
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
      ): Fauna
    }
  }
}

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD,
}

export default class Fauna extends Phaser.Physics.Arcade.Sprite {
  private healthState = HealthState.IDLE
  private damageTime = 0

  private _health = 3

  private knives?: Phaser.Physics.Arcade.Group

  get health() {
    return this._health
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame)

    this.anims.play('fauna-idle-down')
  }

  setKnives(knives: Phaser.Physics.Arcade.Group) {
    this.knives = knives
  }

  handleDamage(dir: Phaser.Math.Vector2) {
    if (this._health <= 0) return
    if (this.healthState === HealthState.DAMAGE) return

    --this._health

    if (this._health <= 0) {
      // die
      this.healthState = HealthState.DEAD
      this.anims.play('fauna-faint')
      this.setVelocity(0, 0)
    } else {
      this.setVelocity(dir.x, dir.y)

      this.setTint(0xff0000)

      this.healthState = HealthState.DAMAGE
      this.damageTime = 0
    }
  }

  private throwKnive() {
    if (!this.knives) return

    const parts = this.anims.currentAnim.key.split('-')
    const direction = parts[2]

    const vec = new Phaser.Math.Vector2(0, 0)

    switch (direction) {
      case 'up':
        vec.y = -1
        break

      case 'down':
        vec.y = 1
        break

      default:
      case 'side':
        if (this.flipX) {
          vec.x = -1
        } else {
          vec.x = 1
        }
        break
    }

    const angle = vec.angle()
    const knife = this.knives.get(
      this.x,
      this.y,
      'knife',
    ) as Phaser.Physics.Arcade.Image

    knife.setActive(true)
    knife.setVisible(true)

    knife.setRotation(angle)

    // knife starting point spacing from player
    knife.x += vec.x * 14
    knife.y += vec.y * 14

    knife.setVelocity(vec.x * 300, vec.y * 300)

  }

  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt)

    switch (this.healthState) {
      case HealthState.IDLE:
        break

      case HealthState.DAMAGE:
        this.damageTime += dt
        if (this.damageTime >= 250) {
          this.healthState = HealthState.IDLE
          this.setTint(0xffffff)
          this.damageTime = 0
        }
        break
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (
      this.healthState === HealthState.DAMAGE ||
      this.healthState === HealthState.DEAD
    )
      return
    if (!cursors) return

    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      this.throwKnive()
      return
    }

    const speed = 100

    if (cursors.left.isDown) {
      this.anims.play('fauna-run-side', true)
      this.setVelocity(-speed, 0)

      // Flip sprite to the left
      this.setFlipX(true)
    } else if (cursors.right.isDown) {
      this.anims.play('fauna-run-side', true)
      this.setVelocity(speed, 0)

      // Flip sprite to the right
      this.setFlipX(false)
    } else if (cursors.up.isDown) {
      this.anims.play('fauna-run-up', true)
      this.setVelocity(0, -speed)
    } else if (cursors.down.isDown) {
      this.anims.play('fauna-run-down', true)
      this.setVelocity(0, speed)
    } else {
      const parts = this.anims.currentAnim.key.split('-')
      parts[1] = 'idle'
      this.anims.play(parts.join('-'))

      this.setVelocity(0, 0)
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register('fauna', function (
  this: Phaser.GameObjects.GameObjectFactory,
  x: number,
  y: number,
  texture: string,
  frame?: string | number,
) {
  var sprite = new Fauna(this.scene, x, y, texture, frame)

  this.displayList.add(sprite)
  this.updateList.add(sprite)

  this.scene.physics.world.enableBody(
    sprite,
    Phaser.Physics.Arcade.DYNAMIC_BODY,
  )

  sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8)

  return sprite
})
