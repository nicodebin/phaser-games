import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

import CobraCutScene from './scenes/CobraCutScene';
import Bootstrap from './scenes/Bootstrap';
import Preloader from './scenes/Preloader';
import Game from './scenes/Game';
import Hud from './scenes/Hud';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scene: [CobraCutScene, Bootstrap, Preloader, Game, Hud],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: RexUIPlugin,
      mapping: 'rexUI',
    }]
  }
};

export default gameConfig;
