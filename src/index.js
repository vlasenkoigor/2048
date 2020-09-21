import * as PIXI from 'pixi.js'
import * as WebFont from 'webfontloader';
import io from 'socket.io-client';
import { Grid } from './components/Grid';
import { ScoreBoard } from './components/ScoreBoard';
import directions from './directions';
import {random} from './utils'
import {GameOver} from "./components/GameOver";
const width = 1038 , height = 834;
const app = new PIXI.Application({
    width, height,
    backgroundColor: 0xFBF9ED,
    resolution: window.devicePixelRatio || 1,
    antialias : true
})
document.body.appendChild(app.view);

const {stage} = app;
const loader = PIXI.Loader.shared;

loader.add('layout','/assets/layout.json');
loader.add('AutoPlay','/assets/AutoPlay.png');
loader.load((_, resources)=>{
    WebFont.load({
        google: {
            families: ['Barlow']
        },
        active : ()=>{
            startApp(resources);
        }
    });

})

let socket;
let initialCells = [];
const startApp = (resources)=>{

    try{
        socket = io('http://localhost:5001');

        socket.on('startGame', ()=>{
            startGame();
        });

        socket.on('initialCells', (cells)=>{
            setInitialOpponentCells(cells);
        });

        socket.on('move', (data)=>{
            const {direction, hasMove, nextRandIndex, nextCellValue} = data;
            moveOpponent({direction, hasMove, nextRandIndex, nextCellValue} )
        })

    } catch (e) {
        debugger
    }

    const layout = resources.layout.data;

    const {cellSize, vGap, hGap, userGridPos, opponentGridPos,
        scoreBoardPos} = layout;


    let enabled = false;
    let score = 0;

    // uer grid
    const grid = new Grid(4, 4, cellSize, vGap, hGap);
    stage.addChild(grid);
    grid.x = userGridPos.x;
    grid.y = userGridPos.y;

    // opponent grid
    const opponentGrid = new Grid(4, 4, cellSize, vGap, hGap);
    stage.addChild(opponentGrid);
    opponentGrid.x = opponentGridPos.x;
    opponentGrid.y = opponentGridPos.y;


    const scoreboard = new ScoreBoard();
    stage.addChild(scoreboard);
    scoreboard.x = scoreBoardPos.x;
    scoreboard.y = scoreBoardPos.y;


    const gameOver = new GameOver(()=>{startGame()});
    stage.addChild(gameOver);
    gameOver.x = width / 2;
    gameOver.y = height /2;

    const setInitialOpponentCells = (cells)=>{
        cells.forEach((cell)=>{
            opponentGrid.addCell(...cell)
        })
    }

    const startGame = ()=>{
        grid.reset();
        opponentGrid.reset();
        enabled = true;
        score = 0;
        scoreboard.reset();


        const initialCells = [];

        for (let i = 0; i < 2; i++){
            const cell = generateNextCell(2, grid);
            grid.addCell(...cell);
            initialCells.push(cell);
        }

        socket.emit('initialCells', initialCells);
    }

    const move = direction =>{
        if (!enabled) return;
        enabled = false;

        const {data, promise} = grid.move(direction);
        const {hasMove, stepScore} = data
        score += stepScore;

        let nextRandIndex, nextCellValue;
        if (hasMove){
            [nextRandIndex, nextCellValue] = generateNextCell(null, grid);
        }

        socket.emit('move', {direction, hasMove, nextRandIndex, nextCellValue, score})

        promise
            .then(()=>{
                enabled = true;
                if (hasMove){
                    grid.addCell(nextRandIndex, nextCellValue);
                    scoreboard.setValue(score);
                    if (!grid.hasAnyMove()){
                        showGameOver();
                        enabled = false;
                    }
                }
            })
    }

    const moveOpponent = (data)=>
    {
        const {direction, hasMove, nextRandIndex, nextCellValue} = data;
        const {_, promise} = opponentGrid.move(direction);

        promise
            .then(()=>{
                enabled = true;
                if (hasMove){
                    opponentGrid.addCell(nextRandIndex, nextCellValue);
                    // scoreboard.setValue(score);
                    // if (!grid.hasAnyMove()){
                    //     showGameOver();
                    //     enabled = false;
                    // }
                }
            })

    }

    const generateNextCell = (value, grid) =>{
        const optionsIndexes = grid.getOptionsIndexes();
        const randNumber = random(0, optionsIndexes.length-1);
        const randIndex = optionsIndexes[randNumber];

        value = value || [2,4][random(0,1)]
        return [randIndex, value]
    }

    const showGameOver = ()=>{
        gameOver.visible = true;
    }


    window.addEventListener("keydown", event => {
        const {keyCode} = event;

        switch (keyCode){
            case 37:
                move(directions.LEFT);
                break;
            case 38:
                move(directions.UP);
                break;
            case 39:
                move(directions.RIGHT)
                break;
            case 40:
                move(directions.DOWN)
                break;
            default :
                break;

        }
    });
}








