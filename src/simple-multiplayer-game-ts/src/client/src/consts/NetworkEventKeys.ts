enum NetworkEventKeys {
  // Initial position of players
  PlayersInitialStatusInfo = 'players-initial-status-info',

  // Players positions update
  PlayersStatusUpdate = 'players-status-update',

  // New player joined
  PlayersNew = 'players-new',

  // A player left
  PlayersLeft = 'players-left',

  // A player has pressed a key
  PlayersInput = 'players-input',
}

export default NetworkEventKeys
