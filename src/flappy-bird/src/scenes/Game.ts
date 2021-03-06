import Phaser from 'phaser'
import EventKeys from '../consts/EventKeys'
import Pipe from '../game/Pipe'
import Player from '../game/Player'
import SceneKeys from '../consts/SceneKeys'
import TextureKeys from '../consts/TextureKeys'

import { sceneEvents } from '../events/EventsCenter'
import AudioKeys from '~/consts/AudioKeys'

// Distance between one pipe and another
const PIPE_DISTANCE = 150 * 2

export default class Game extends Phaser.Scene {
  private ambienceMusic!: Phaser.Sound.BaseSound
  private background!: Phaser.GameObjects.TileSprite
  private ground!: Phaser.GameObjects.TileSprite
  private heart!: Phaser.GameObjects.Sprite
  private pipes!: Phaser.Physics.Arcade.StaticGroup
  private player!: Player
  private playerGroundOverlap!: Phaser.Physics.Arcade.Collider
  private playerHeartOverlap!: Phaser.Physics.Arcade.Collider
  private playerNewLiveMusic!: Phaser.Sound.BaseSound
  private playerPipesOverlap!: Phaser.Physics.Arcade.Collider
  private score!: number

  constructor() {
    super(SceneKeys.Game)
  }

  init() {
    this.score = 0
  }

  create() {
    this.scene.run(SceneKeys.GameUI)

    const width = this.scale.width
    const height = this.scale.height

    // Set background
    this.background = this.add
      .tileSprite(0, 0, width, height, TextureKeys.Background)
      .setOrigin(0, 0)
      .setScrollFactor(0, 0)

    // Background music
    this.ambienceMusic = this.sound.add(AudioKeys.Ambience)
    this.ambienceMusic.play('', { volume: 0.6, loop: true })

    // New live sfx
    this.playerNewLiveMusic = this.sound.add(AudioKeys.PlayerNewLive)

    // Create player
    this.player = new Player(this, 200, 200)

    // Create Pipes
    this.createPipes()

    // Set Ground
    this.ground = this.add
      .tileSprite(0, height - 112, 335 * 5, 112, TextureKeys.Ground)
      .setOrigin(0, 0)
      .setScrollFactor(0, 0)

    this.physics.add.existing(this.ground, true)

    // Add player
    this.add.existing(this.player)

    this.createHeart()

    // Show Game Over scene when player dies
    this.player.onDead(() => {
      // Bounce the player
      const body = this.player.body as Phaser.Physics.Arcade.Body
      body.setVelocityY(-1000)

      this.playerGroundOverlap.destroy()
      this.playerPipesOverlap.destroy()

      this.scene.run(SceneKeys.GameOver)

      this.input.keyboard.once('keydown-ENTER', () => {
        this.scene.stop(SceneKeys.GameOver)
        this.scene.restart()
      })
    })

    // Overlap Player with Ground
    this.playerGroundOverlap = this.physics.add.collider(
      this.player,
      this.ground,
      this.handlePlayerObjectOverlap,
      undefined,
      this,
    )

    // Overlap Player with Pipes
    this.playerPipesOverlap = this.physics.add.overlap(
      this.player,
      this.pipes,
      this.handlePlayerObjectOverlap,
      undefined,
      this,
    )

    // Disable Player-Pipes collider when blinking
    this.player.onBlinking({
      startCallback: () => {
        this.playerPipesOverlap.active = false
        this.updateScore(-1)
      },
      stopCallback: () => {
        this.playerPipesOverlap.active = true
      },
    })

    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setVelocityX(this.player.FLYING_VELOCITY)

    // World bounds
    this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height)

    // Follow the player with the main camera
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height)
  }

  createPipes() {
    this.pipes = this.physics.add.staticGroup({
      classType: Pipe,
    })
    for (let i = 1; i <= 6; ++i) {
      const x = 300 + PIPE_DISTANCE * i
      const {
        bottomY,
        topY,
      } = this.generateRandomVerticalPositionPipesCoordinates()

      this.pipes.add(new Pipe(this, x, bottomY, true), true)
      this.pipes.add(new Pipe(this, x, topY, false), true)
    }
  }

  createHeart() {
    this.heart = this.add.sprite(
      this.scale.width,
      this.scale.height / 2,
      TextureKeys.HeartScene,
    ).setOrigin(0.5, 0)

    this.physics.add.existing(this.heart, true)

    // Overlap player with heart
    this.playerHeartOverlap = this.physics.add.overlap(
      this.player,
      this.heart,
      this.handlePlayerHeartOverlap,
      undefined,
      this,
    )

    this.heart.setVisible(false)
    this.playerHeartOverlap.active = false
  }

  update() {
    // Wrap pipes
    this.wrapPipes()

    // Wrap heart
    this.wrapHeart()

    if (this.player.isDead) {
      const body = this.player.body as Phaser.Physics.Arcade.Body
      body.setCollideWorldBounds(false)
    } else {
      // Parallax effect to background and ground
      this.background.tilePositionX -= 1
      this.ground.tilePositionX += 5

      // Keep the body ground aligned with the camera
      const groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody
      groundBody.x = this.cameras.main.scrollX
    }
  }

  wrapPipes() {
    const maxX = this.getRightMostPipePosition()
    const {
      topY,
      bottomY,
    } = this.generateRandomVerticalPositionPipesCoordinates()

    this.pipes.children.iterate((child) => {
      const pipe = child as Pipe
      const scrollX = this.cameras.main.scrollX

      if (pipe.x + pipe.displayWidth / 2 < scrollX) {
        pipe.x = maxX + PIPE_DISTANCE
        pipe.y = pipe.isBottom ? bottomY : topY
        pipe.body.updateFromGameObject()

        this.player.isFlying && this.updateScore(0.5)
      }
    })
  }

  wrapHeart() {
    if (!this.player.isHurt) return

    const scrollX = this.cameras.main.scrollX

    // wrap if the heart is at the left of the screen
    if (this.heart.x + this.heart.width < scrollX) {
    
      const newX = this.getRightMostPipePosition() + PIPE_DISTANCE / 2
      const newY = Phaser.Math.Between(this.heart.displayHeight * 2, this.scale.height * 0.75)

      this.heart.setPosition(newX, newY)

      this.heart.setVisible(true)
      this.playerHeartOverlap.active = true

      const heartBody = this.heart.body as Phaser.Physics.Arcade.StaticBody
      heartBody.updateFromGameObject()
    }
  }

  updateScore(increase: number) {
    this.score += increase
    if (this.score < 0) {
      this.score = 0
    }
    sceneEvents.emit(EventKeys.ScoreUpdated, this.score)
  }

  // Find the max X of all pipes
  getRightMostPipePosition() {
    const firstPipe = this.pipes.getChildren()[0] as Phaser.Physics.Arcade.Sprite
    let maxX = firstPipe.x
    this.pipes.children.iterate((child) => {
      const pipe = child as Phaser.Physics.Arcade.Sprite

      if (pipe.x > maxX) {
        maxX = pipe.x
      }
    })
    return maxX
  }

  handlePlayerObjectOverlap(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject,
  ) {
    const player = obj1 as Player
    player.handleDamage()

    sceneEvents.emit(EventKeys.PlayerHealthChanged, player.lives)
  }

  handlePlayerHeartOverlap(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject,
  ) {
    const player = obj1 as Player
    const heart = obj2 as Phaser.Physics.Arcade.Sprite

    player.increaseLive()
    heart.setVisible(false)

    sceneEvents.emit(EventKeys.PlayerHealthChanged, player.lives)

    this.playerNewLiveMusic.play()

    this.playerHeartOverlap.active = false
  }

  generateRandomVerticalPositionPipesCoordinates() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const playerHeight = playerBody.height

    // Space between top tube and bottom tube, to let the player go through
    const playerOffset = 2 * playerHeight

    const groundOffset = 112

    // Space with world border
    const marginOffset = 10

    let topY = Phaser.Math.Between(
      marginOffset,
      this.scale.height - playerOffset - marginOffset - groundOffset,
    )
    let bottomY = Phaser.Math.Between(
      topY + playerOffset,
      this.scale.height - marginOffset - groundOffset,
    )

    return { topY, bottomY }
  }
}
