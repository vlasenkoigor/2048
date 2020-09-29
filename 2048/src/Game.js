import {Grid} from "./components/Grid";
import {ScoreBoard} from "./components/ScoreBoard";
import {GameOver} from "./components/GameOver";
import * as PIXI from "pixi.js";
import {Timer} from "./components/Timer";
import {PlayerInfo} from "./components/PlayerInfo";
import {random} from "./utils";
import directions from "./directions";
import {connect, setupNetworkEvents} from "./sockets";
import {getParameters} from "./urlParameters";
import {Logo} from "./components/Logo";
import {GameInfo} from "./components/GameInfo";
import {SurrenderButton} from "./components/SurrenderButton";

export class Game {

    constructor(width, height,) {

        /**
         * game's root stage
         * @type {null}
         */
        this.stage = null;

        this.width = width;

        this.height = height;

        /**
         * player score
         * @type {number}
         */
        this.score = 0;

        /**
         * is time out
         * @type {boolean}
         */
        this.timeout = false;

        /**
         * is game over
         * @type {boolean}
         */
        this.isGameOver = false;

        /**
         * is enables state to move
         * @type {boolean}
         */
        this.enabled = false;

        /**
         * player grid
         * @type {null|Grid}
         */
        this.grid = null;

        /**
         * opponent grid
         * @type {null|Grid}
         */
        this.opponentGrid = null;

        /**
         * player scoreboard
         * @type {null|ScoreBoard}
         */
        this.scoreboard = null;

        /**
         * opponent scoreboard
         * @type {null|ScoreBoard}
         */
        this.opponentScoreboard = null;

        /**
         *
         * @type {null|GameOver}
         */
        this.gameOverPopup = null;

        /**
         * surrender button
         * @type {null}
         */
        this.surrenderButton = null;

        /**
         * game info
         * @type {null}
         */
        this.gameInfo = null;

        /**
         *
         * @type {null|Timer}
         */
        this.timer = null;

        this.setupControllers();

        this.socket = this.connectTheSerer();

        this.setupNetworkEvents();

    }


    /**
     * build UI
     * @param stage
     * @param resources
     */
    build(stage, resources){
        const layout = resources.layout.data;
        this.stage = stage;

        this.layout = layout;

        const {cellSize, vGap, hGap, userGridPos, opponentGridPos,
            scoreBoardPos, OpponentScoreBoardPos,
            vsLabelLayout, timerLayout, logoLayout, gameInfoLayout, surrenderLayout
        } = layout;


        // player grid
        const grid = new Grid(4, 4, cellSize, vGap, hGap);
        stage.addChild(grid);
        grid.x = userGridPos.x;
        grid.y = userGridPos.y;
        this.grid = grid;


        // opponent grid
        const opponentGrid = new Grid(4, 4, cellSize, vGap, hGap);
        stage.addChild(opponentGrid);
        opponentGrid.x = opponentGridPos.x;
        opponentGrid.y = opponentGridPos.y;
        this.opponentGrid = opponentGrid;


        // score board
        const scoreboard = new ScoreBoard();
        stage.addChild(scoreboard);
        scoreboard.x = scoreBoardPos.x;
        scoreboard.y = scoreBoardPos.y;
        this.scoreboard = scoreboard


        // opponent score board
        const opponentScoreboard = new ScoreBoard(0xBBAE9E);
        stage.addChild(opponentScoreboard);
        opponentScoreboard.x = OpponentScoreBoardPos.x;
        opponentScoreboard.y = OpponentScoreBoardPos.y;
        this.opponentScoreboard = opponentScoreboard;



        // vs label
        const vsLabel = new PIXI.Text('VS', {
            fontFamily : 'Barlow',
            fontSize : 24,
            fill : '#AFACA2'
        });
        vsLabel.x = vsLabelLayout.x;
        vsLabel.y = vsLabelLayout.y;
        vsLabel.anchor.set(vsLabelLayout.anchor.x, vsLabelLayout.anchor.y)
        vsLabel.cacheAsBitmap = true;
        stage.addChild(vsLabel);

        // timer
        const timer = new Timer(timerLayout);
        stage.addChild(timer);
        this.timer = timer;

        // logo
        const logo = new Logo(logoLayout);
        stage.addChild(logo);

        // game info
        const gameInfo  = new GameInfo(gameInfoLayout);
        stage.addChild(gameInfo);
        this.gameInfo = gameInfo;


        const surrenderButton = new SurrenderButton(surrenderLayout, this.quitGame.bind(this))
        stage.addChild(surrenderButton);
        surrenderButton.disable();
        this.surrenderButton = surrenderButton;

        // game over pop up
        const gameOver = new GameOver();
        stage.addChild(gameOver);
        gameOver.x = this.width / 2;
        gameOver.y = this.height /2;
        this.gameOverPopup = gameOver;
    }

    join(){
        const {
            user_id,
            room_id,
            hash,
            ignoreProviderFails
        } = getParameters();

        this.socket.emit('join_game', {
            user_id,
            room_id,
            hash,
            ignoreProviderFails
        });
    }

    setTimer(time){
        this.timer.setTimerValue(time);
    }

    /**
     * set initial opponent cells
     * @param cells
     * @private
     */
    setInitialOpponentCells (cells){
        cells.forEach((cell)=>{
            this.opponentGrid.addCell(...cell)
        })
    }

    setPrizeValue(value){
        this.gameInfo.setValue(value)
    }

    /**
     * add users info panels
     * @param data
     */
    setPlayerInfo (data){
        if (!this.playerInfo){
            const {stage, layout} = this;
            const {playerInfoLayout} = layout;

            // players info panels
            const playerInfo = new PlayerInfo(data, playerInfoLayout);
            stage.addChild(playerInfo);
            this.playerInfo = playerInfo;
        }
    }

    /**
     * add opponent info
     * @param data
     */
    setOpponentInfo(data){
        if (!this.opponentInfo){
            const {stage, layout} = this;
            const {opponentInfoLayout} = layout;
            const opponentInfo = new PlayerInfo(data, opponentInfoLayout);
            stage.addChild(opponentInfo);
            this.opponentInfo = opponentInfo;
        }
    }


    /**
     * start game
     */
    startGame(){
        const {grid, opponentGrid, scoreboard, opponentScoreboard} = this;
        this.enabled = true;
        this.score = 0;
        this.timeout = false;
        this.isGameOver = false;

        grid.reset();
        opponentGrid.reset();
        this.surrenderButton.enable();
        scoreboard.reset();
        opponentScoreboard.reset();

        const initialCells = [];

        for (let i = 0; i < 2; i++){
            const cell = Game.generateNextCell(2, this.grid);
            grid.addCell(...cell);
            initialCells.push(cell);
        }

        this.timer.startCountDown(null, this.onTimeout.bind(this));
        this.socket.emit('initial_cells', initialCells);
    }

    /**
     * player move
     * @param direction
     */
    move (direction){
        if (!this.enabled) return;

        this.enabled = false;

        const {data, promise} = this.grid.move(direction);
        const {hasMove, stepScore, previousCellsIds, currentCellsIds} = data
        this.score += stepScore;

        let nextRandIndex, nextCellValue;
        if (hasMove){
            [nextRandIndex, nextCellValue] = Game.generateNextCell(null, this.grid);
        }

        this.socket.emit('move', {direction, hasMove, stepScore, previousCellsIds, currentCellsIds, score : this.score, nextRandIndex, nextCellValue});

        promise
            .then(()=>{
                this.enabled = true;

                if (hasMove){
                    this.grid.addCell(nextRandIndex, nextCellValue);
                    this.scoreboard.setValue(this.score);
                    if (!this.grid.hasAnyMove() && !this.isGameOver){
                        this.gameOver();
                    }
                }
            })
    }



    /**
     * opponent move
     * @param data
     */
    moveOpponent (data) {
        this.opponentMove(data);
    }

    /**
     * proceed opponent move
     */
    opponentMove(data){
        const {direction, hasMove,  previousCellsIds,  score, nextRandIndex, nextCellValue} = data;
        const {promise} = this.opponentGrid.moveDemo(direction, previousCellsIds);

        promise
            .then(()=>{
                this.opponentScoreboard.setValue(score);
                if (hasMove){
                    this.opponentGrid.addCell(nextRandIndex, nextCellValue);
                }
            })

    }

    /**
     * on time out
     */
    onTimeout(){
        this.timeout = true;
        if (this.isGameOver) return;
        this.gameOver(true);
    }

    quitGame(){
        this.surrenderButton.disable();
        this.gameOver(false);
    }

    /**
     * game over
     */
    gameOver(timesUp = false){
        this.isGameOver = true;

        this.socket.emit('game_over', {score : this.score})
        this.showGameOver(timesUp);
        this.enabled = false;
    }

    /**
     * show game over
     */
    showGameOver (timesUp = false){
        this.gameOverPopup.visible = true;
        if (timesUp){
            this.gameOverPopup.setTimesUpText();
        } else {
            this.gameOverPopup.setGameOverText();
        }

    }


    /**
     * show game resuld
     * @param data
     */
    showGameResult(data) {
        const {result, score, opponentScore} = data;
        this.timer.stop();
        this.gameOverPopup.setGameResultText(result, score, opponentScore)
    }

    /**
     * set up controllers
     */
    setupControllers(){
        window.addEventListener("keydown", event => {
            const {keyCode} = event;

            switch (keyCode){
                case 37:
                    this.move(directions.LEFT);
                    break;
                case 38:
                    this.move(directions.UP);
                    break;
                case 39:
                    this.move(directions.RIGHT)
                    break;
                case 40:
                    this.move(directions.DOWN)
                    break;
                default :
                    break;

            }
        });
    }

    connectTheSerer(){
        return connect();
    }


    setupNetworkEvents(){
        setupNetworkEvents(this, this.socket);
    }


    /**
     * generate cells
     * @param value
     * @param grid
     * @return {[*, *|number]}
     */
    static generateNextCell (value, grid){
        const optionsIndexes = grid.getOptionsIndexes();
        const randNumber = random(0, optionsIndexes.length-1);
        const randIndex = optionsIndexes[randNumber];

        value = value || [2,4][random(0,1)]
        return [randIndex, value]
    }

}
