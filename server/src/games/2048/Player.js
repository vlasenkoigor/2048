class Player {
    constructor(id, socket) {
        this.id = id;

        /**
         * currently active socket user communicate through
         * @type {null|WebSocket}
         */
        this.socket = socket;

        /**
         * user
         * @type {number}
         */
        this._score = 0;

        /**
         * is user active or not
         * @type {boolean}
         */
        this.active = true;

        /**
         * user finished playing or not
         * @type {boolean}
         */
        this.gameover = false;

        this.data = {};

        this.moveData = null;

        this._snapshot = null;

        this.timeLeft = 0;

        this.collectedStopper = false;
    }

    /**
     * make user activate
     * @param socket
     */
    activate(socket){
        this.active = true;
        this.socket = socket;
    }


    /**
     * deactivate user
     */
    deactivate(){
        this.active = false;
        this.socket = null;
    }

    /**
     * get socket id
     * @return {*}
     */
    getSocketId(){
        return this.socket ? this.socket.id : null;
    }

    /**
     * get info
     * @return {Object}
     */
    getInfo(me = false){
        return JSON.stringify( {
            id : this.id,
            active : this.active,
            socket : this.getSocketId(),
            data : this.data,
            me
        })
    }

    getUserAmount(){
        return this.data ? parseFloat(this.data.amount) : 0;
    }

    completeGame(){
        this.gameover = true;
    }

    set snapshot(data){
        this._snapshot = data;
    }

    get snapshot(){
        return {
            ...this._snapshot,
            gameover : this.gameover
        }
    }


    set score(value){
        this._score = value || 0;
    }

    get score(){
        return this._score || 0;
    }


}

module.exports = Player;
