enum NetworkEventKeys {
  // Initial position of players
  PlayersInitialStatusInfo = 'players-initial-status-info',

  // Players positions update
  PlayersStatusUpdate = 'players-status-update',
  
  // Player settings update
  PlayerSettingsUpdate = 'player-settings-update',

  // Send player back to initial position (main island)
  PlayerRestartPosition = 'player-restart-position',

  // New player joined
  PlayersNew = 'players-new',

  // A player left
  PlayersLeft = 'players-left',

  // A player has pressed a key
  PlayersInput = 'players-input',

  // Player fight (shoots an arrow)
  PlayerFightAction = 'player-fight-action',

  // Player has been damaged by an arrow
  PlayerHurt = 'player-hurt',

  // Restart game
  RestartGame = 'restart-game',

  // An error happened in the server
  ServerError = 'server-error',

  /**** FIGHT EVENTS ****/
  // Player wants to fight
  PlayerJoinFight = 'player-join-fight',

  // Start waiting to other players to join
  StartFightWaitingRoom = 'start-fight-waiting-room',

  // Start fight
  StartFight = 'start-fight',
}

export default NetworkEventKeys
