module.exports = {
    // server -> client
    REJECTED : 'rejected',
    REQUEST_FAILS : 'request_fails',
    JOINED : 'joined',
    OPPONENT_JOINED : 'opponent_joined',
    OPPONENT_DISCONNECTED : 'opponent_disconnected',
    START_GAME : 'start_game',
    MATCH_RESULT : 'match_result',
    OPPONENT_GAME_OVER : 'opponent_game_over',
    NOTIFICATION : 'notification',

    // client -> server
    JOIN_GAME : 'join_game',
    GAME_OVER : 'game_over',

    //both
    INITIAL_CELLS : 'initial_cells',
    MOVE : 'move',

    // system
    CONNECTION : 'connection',
    DISCONNECT : 'disconnect',
}
