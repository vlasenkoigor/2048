const messages = require('./protocol/messages/index');
const types = require('./protocol/types');
const rules = require('./rules');
const provider = require('./provider/provider');
const Player = require('./Player.js');
const gamesHash = {};
let ignoreFails = false;
let io = null;

class Game2048 {

    constructor(room_id) {
        this._room_id = room_id;

        this._startedAt = + new Date();

        this._finishedAt = + new Date();

        this.gameStarted = false;

        this.gameCompleted = false;

        this._players = [];

        /**
         * result : 'winner', 'drawn'
         * @type {String}
         * @private
         */
        this._result = '';

        /**
         * winner of the game
         * @type {null|Player}
         * @private
         */
        this._winner = null;

        /**
         * loser of the game
         * @type {null|Player}
         * @private
         */
        this._loser = null;

        this.timeup = false;

        this.timeoutUUID = null;

        this.currentTimeCountdown = rules.time;
    }

    /**
     * register user on the game
     * @param socket
     * @param user_id
     */
    async registerUser(socket, user_id) {


        // reject if game reached players limit
        if (this._players.length === rules.players_limit && !this._findPlayer(user_id)) {
            socket.emit(types.ERROR, messages.error(2, 'Out of maximum players count'));
            console.log(`Socket ${socket.id} Maximum players amount`);
            return;
        }

        // check if user already active and waits for the game gets started
        const player = this._findPlayer(user_id);

        // is player already connected
        // we reject socket
        if (player && player.active){

            if (player.socket){
                console.log(`Socket ${socket.id} disconnected by conflict, user ${player.id} `);
                player.socket.removeAllListeners();
                player.socket.emit(types.ERROR, messages.error(1, '2 players conflict'));
                player.socket.disconnect();
                player.socket = null;
            }
        }

        await this._onUserJoined(socket, user_id, player);

        // if we have all players in the game - start the game
        if (!this.gameStarted && this._getActivePlayers().length === rules.players_limit) this.startGame();
    }

    /**
     * user joined
     * @param socket
     * @param user_id
     * @param player
     * @private
     */
    async _onUserJoined(socket, user_id, player){
        const room_id = this._room_id;

        const reconnected = !!player;

        if (!player) player = new Player(user_id, socket);

        if (reconnected){
            player.activate(socket);
        } else {
            this._players.push(player);
        }
        socket.join(room_id);

        this._setupGameListeners(socket);

        socket.emit(types.NOTIFICATION, messages.notification('Getting user information...'))

        let data = null;
        let err_message = ''
        try {
            data = await this._getPlayerData(user_id);
        } catch (e) {
            err_message = e ? `Error : ${e.status} - ${e.statusText}; message : ${e.data ? e.data.error.message : ''}` : 'unknown error';
            socket.emit(types.REQUEST_FAILS, messages.notification(err_message))

            // console.log(err_message);
        }

        const user_data = data && data.status === 200 ? data.data : null;
        if (!user_data && !ignoreFails){
            socket.emit(types.ERROR, messages.error(5, err_message))
            return
        }

        player.data = user_data;

        if (player.active){

            this.emitJoined(player, room_id, reconnected);
            this.broadCastJoined(player, room_id, reconnected);

            console.log(`Player ${player.id} connected`)
            this._printUsers();
        }


    }

    emitJoined(player, room_id, reconnected){
        const user_id = player.id;
        const socket = player.socket;


        socket.emit(
            types.JOINED,
            messages.joined(
                user_id,
                room_id,
                reconnected,
                this._getUsersListInfo(user_id),
                this.getSnapshotData(player))
        );
    }

    getSnapshotData(player){
        const elapsedTime = this.gameStarted ? this.getElapsedSeconds() : 0;
        const timeLeft = this.timeup ? 0 : rules.time - elapsedTime;

        let data = {
            totalTime : rules.time,
            stopCell : rules.stopCell,
            elapsedTime : elapsedTime,
            timeLeft : timeLeft,
            gameStarted : this.gameStarted,
            gameCompleted : this.gameCompleted
        }

        if (this.gameStarted){
            data = {...data, ...this._restorePlayerState(player)}
        }

        return data;
    }

    /**
     *
     * @param player {Player}
     * @private
     */
    _restorePlayerState(player){
        const opponent =  this._players.find(p => p !== player)
        return  {
            snapshot : player.snapshot,
            opponentSnapshot : opponent.snapshot
        }
    }

    getElapsedSeconds(){

        let elapsedTime;
        if (this.gameCompleted){
            elapsedTime = !this.timeup  ? Math.floor( (this._finishedAt - this._startedAt ) / 1000 ) : rules.time
        } else {
            elapsedTime = Math.floor( ((+new Date()) - this._startedAt ) / 1000)
        }

        if (elapsedTime > rules.time)  elapsedTime = rules.time;

        return elapsedTime;
    }


    /**
     * brad cast to all player joined
     * @param player
     * @param room_id
     * @param reconnected
     */
    broadCastJoined(player, room_id, reconnected){
        const user_id = player.id;
        const socket = player.socket;
        socket
            .to(this._room_id).broadcast
            .emit(types.OPPONENT_JOINED, messages.joined(user_id, room_id, reconnected, this._getUsersListInfo()));
    }




    _getPlayerData(user_id){
        return provider.get_info(user_id, this._room_id);
    }


    _saveUserResult(user, opponent){
        const
            user_id = user.id,
            room_id = this._room_id,
            start_timestamp = this._startedAt,
            finish_timestamp = this._finishedAt,
            [result_amount, data] = this._calculateUserResultAmount(user, opponent);

        return provider.save_result(
            user_id,
            room_id,
            result_amount,
            Math.floor(start_timestamp / 1000),
            Math.floor(finish_timestamp / 1000),
            data
        );
    }

    /**
     *
     * @param user {Player}
     * @param opponent {Player}
     * @return {number|undefined|*}
     * @private
     */
    _calculateUserResultAmount(user, opponent){
        let data = []; // calculation data

        let result = 0;

        let operation_type = null,
            amount = 0,
            opponent_id = opponent.id,
            comment = ''

        if (this._result === 'drawn'){
            result =  user.getUserAmount();
            amount = 0;
            comment = 'drawn;';
        }

        if (user === this._loser){
            result = 0;
            amount = user.getUserAmount();
            operation_type = 2;
            comment = `Lose ${amount}`;
        }

        if (user === this._winner){
            result = user.getUserAmount() + opponent.getUserAmount();
            amount = opponent.getUserAmount();
            operation_type = 1;
            comment = `win ${amount}`;
        }

        data.push({
            operation_type,
            amount,
            opponent_id,
            comment
        });

        return [result, data];
    }

    /**
     * find player
     * @param user_id
     * @return {*}
     * @private
     */
    _findPlayer(user_id){
        return this._players.find(p => p.id === user_id);
    }

    /**
     * on user disconnected (before game started)
     * @param socket
     * @private
     */
    _onDisconnect(socket){
        const player = this._players.find(p => p.getSocketId() === socket.id);

        if (player){
            // deactivate user and send broadcast notification
            player.deactivate();
            socket
                .to(this._room_id).broadcast
                .emit(types.OPPONENT_DISCONNECTED, messages.disconnected(player.id, this._room_id, this._getUsersListInfo()));

        }

        // console.log(messages.disconnected(player.id, this._room_id));
        console.log(`Player ${player.id} disconected`);
        this._printUsers();
    }

    /**
     * get active users
     * @return {*[]}
     * @private
     */
    _getActivePlayers(){
        return this._players.filter(p => p.active === true)
    }

    /**
     * if all player are there we start the game
     */
    startGame(){
        console.log(`game #${this._room_id} could be started`);
        this._printUsers();

        this.gameStarted = true;
        this._startedAt = +new Date();
        this._players.forEach( p => p.timeLeft = rules.time );

        io.to(this._room_id).emit(types.START_GAME);


        this.setTimeout();

    }




    setTimeout(){
        this.timeoutUUID = setTimeout(()=>{
            this.onGameTimeOut();
            console.log('times up')
        }, rules.time * 1000)
    }

    stopTimeout(){
        if (this.timeoutUUID){
            clearTimeout(this.timeoutUUID);
            this.timeoutUUID = null;
        }
    }

    onGameTimeOut(){
        this.timeup = true;

        this.waitForResultsAfterTimeout();
    }

    waitForResultsAfterTimeout(){
        setTimeout(()=>{
            this._players.forEach(player => player.completeGame())
            this.onGameOver();
        }, 2000)
    }



    /**
     * set up listeners for socket
     * @param socket
     * @private
     */
    _setupGameListeners(socket){
        // when we got initial cells from socket we need
        // broad cast them to all players
        socket.on(types.INITIAL_CELLS, (data)=>{
            const player = this._players.find(p => p.getSocketId() === socket.id);
            if (player){
                player.snapshot = data;
            }

            socket.to(this._room_id).broadcast
                .emit(types.INITIAL_CELLS, data);
        });

        // on player moved
        socket.on(types.MOVE, data => {this._onPlayerMoved(socket, data)});

        // on game over. once timer implemented it will be removed
        socket.on(types.GAME_OVER, data => {this._onPlayerGameOver(socket, data)});

        // subscribe to the disconnect event
        socket.on(types.DISCONNECT, ()=>{
            this._onDisconnect(socket);
        });

    }

    /**
     * on player moved
     * @param socket
     * @param data
     * @private
     */
    _onPlayerMoved(socket, data) {
        if (this.gameCompleted) return;

        const {score} = data.snapshot;

        const player = this._players.find(p => p.getSocketId() === socket.id);

        if (player){
            player.score = score || 0;
            player.moveData = data.moveData;
            player.snapshot = data.snapshot;
        }

        if (data.snapshot && data.snapshot.board){
            player.collectedStopper = data.snapshot.board.some( i => i === rules.stopCell )
        }

        socket.to(this._room_id).broadcast
            .emit(types.MOVE, {...data, collectedStopper : player.collectedStopper});

        if (player.collectedStopper){
            this._players.forEach(p => p.completeGame())
            this.onGameOver()
        }
    }

    /**
     * on player got game over
     * once timer implemented it will be removed
     * @param socket
     * @param data
     * @private
     */
    _onPlayerGameOver(socket, data){
        if (this.gameCompleted) return;

        const player = this._players.find(p => p.getSocketId() === socket.id);
        const {score} = data;

        player.score = score || 0;
        player.completeGame();

        const player1 = this._players[0];
        const player2 = this._players[1];

        // if both players completed to play
        if (player1.gameover && player2.gameover){
            this.onGameOver();
        } else {
          this._sendOpponentGameOverMessage(socket, score)
        }

    }

    onGameOver(){
        if (this.gameCompleted) return;

        const player1 = this._players[0];
        const player2 = this._players[1];
        this._finishedAt = +new Date();

        this.gameCompleted = true;

        // this._sendTimeSync(rules.time - this.getElapsedSeconds());
        this._players.forEach( p => {this.sendSyncGameState(p)})

        this.stopTimeout();

        // define result
        this._defineResult();

        // send messages depends on result
        if (this._result === 'drawn'){
            this._sendDrawnMessage();
        } else {
            this._sendWinnerMessage();
            this._sendLoserMessage();
        }

        // save results
        io.emit(types.NOTIFICATION, messages.notification('Saving results...'))
        Promise.all([
            this._saveUserResult(player1, player2),
            this._saveUserResult(player2, player1)
        ])
            .then((response)=>{
                console.log('result saved', response)
                io.emit(types.NOTIFICATION, messages.notification('Result saved'))

            })
            .catch(e=>{
                console.log(e)
                const {status, statusText} = e;
                const message = e.data && e.data.error ? e.data.error.message : e.data ? e.data.message : 'unknown error';

                const err_message = `Error : ${status} - ${statusText}; message : ${message}`;
                io.emit(types.REQUEST_FAILS, messages.notification(err_message))
                if (!ignoreFails){
                    io.emit(types.ERROR, messages.error(5, err_message))
                }
                console.log(err_message);

            })
    }



    sendSyncGameState(player){
        player.socket && player.socket.emit('game_sync', this.getSnapshotData(player))

    }


    _sendOpponentGameOverMessage(socket, score){
        socket.to(this._room_id).broadcast
            .emit(types.OPPONENT_GAME_OVER,
                messages.opponent_game_over(score))
    }

    /**
     * send message that game is drawn
     * @private
     */
    _sendDrawnMessage(){
        const player1 = this._players[0];
        const player2 = this._players[1];

        const snapshot1 = this.getSnapshotData(player1);
        const snapshot2 = this.getSnapshotData(player2);

        player1.socket && player1.socket
            .emit(types.MATCH_RESULT, messages.match_result(this._result, player1.score, player2.score, snapshot1));
        player2.socket && player2.socket
            .emit(types.MATCH_RESULT, messages.match_result(this._result, player2.score, player1.score, snapshot2));
    }

    /**
     * send message to the winner
     * @private
     */
    _sendWinnerMessage(){
        const snapshot = this.getSnapshotData(this._winner);
        this._winner.socket && this._winner.socket
            .emit(types.MATCH_RESULT, messages.match_result('win', this._winner.score, this._loser.score, snapshot));
    }

    /**
     * send message to the loser
     * @private
     */
    _sendLoserMessage(){
        const snapshot = this.getSnapshotData(this._loser);
        this._loser.socket && this._loser.socket
            .emit(types.MATCH_RESULT, messages.match_result('lose', this._loser.score, this._winner.score, snapshot));
    }

    /**
     * define game result
     * @private
     */
    _defineResult(){
        const player1 = this._players[0];
        const player2 = this._players[1];

        // if we have drawn
        console.log('defining winner ', player1.collectedStopper, player1.score, player2.collectedStopper, player2.score)
        if ( (player1.score === player2.score) || (player1.collectedStopper && player2.collectedStopper)){
            console.log(`Game #${this._room_id} result = DRAWN`)
            this._result = 'drawn';
            this._winner = null;
        } else {

            // define the winner
            this._result = 'winner';
            if (player1.collectedStopper || player1.score > player2.score){
                this._winner = player1;
                this._loser = player2;
            } else if (player2.collectedStopper || player2.score > player1.score){
                this._winner = player2;
                this._loser = player1;
            }

            console.log(`Game #${this._room_id} result: WINNER user id ${this._winner.id}`)
            console.log(`Game #${this._room_id} result: LOSER user id ${this._loser.id}`)
        }
    }

    /**
     * get users array contains user info
     * @return {Object[]}
     * @private
     */
    _getUsersListInfo(my_id = null){
        return this._players.map(p => p.getInfo(p.id === my_id))
    }

    /**
     * console.log of users in the room
     * @private
     */
    _printUsers(){
        console.log(`room #${this._room_id}`, this._getUsersListInfo())
    }

    /**
     * get game instance according to the room id
     * @param room_id
     */
    static getGame(room_id = 'default'){
        if (!gamesHash[room_id]) {
            gamesHash[room_id] = new Game2048(room_id);
        }

        return gamesHash[room_id]
    }

    /**
     * start serving namespace /2048
     * @param global_io - global connection
     */
    static start(global_io){
        io = global_io.of(Game2048.gameNameSpace);

        io.on(types.CONNECTION, (socket)=>{
            console.log(`socket # ${socket.id} connected to /2048 namespace`)

            // wait till client sends join_game event
            socket.on(types.JOIN_GAME, (data)=>{
                console.log(`socket # ${socket.id} joining game`)
                let {user_id, room_id, hash, ignoreProviderFails = 0} = data;
                room_id = room_id || Game2048.defaultRoom;

                ignoreFails = ignoreProviderFails ? ignoreProviderFails === '1' : false;

                socket.emit(types.NOTIFICATION, messages.notification('Validating hash...'));
                const isGameValid = provider.validate_game({
                        user_id,
                        room_id,
                        hash
                });
                Game2048.notifyGameValidation(socket, isGameValid, user_id, room_id, hash)
                console.log(isGameValid ? 'Game is valid' : 'Game is invalid');

                if (isGameValid || ignoreFails){
                    const game = Game2048.getGame(room_id);
                    game.registerUser(socket, user_id);
                } else {
                    socket.emit(types.ERROR, messages.error(3, 'Game hash validation fails'));
                }
            })
        })
    }

    static notifyGameValidation(socket, isGameValid, user_id, room_id, hash){
        let message = `Game #${room_id} is ${isGameValid ? 'valid' : 'invalid'}; user id = ${user_id}, hash = ${hash}.`;
        if (ignoreFails && !isGameValid){
            message += 'But you are in ignore mode and you are permitted to play'
        }
        socket.emit(types.NOTIFICATION, messages.notification(message));
    }
}

Game2048.gameNameSpace = '/2048';
Game2048.defaultRoom = '2048_default';

module.exports = Game2048;
