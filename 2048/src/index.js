import * as PIXI from 'pixi.js'
import {Game} from "./Game";
import {loadResources} from "./resourceLoader";
import {loadFonts} from "./fontsLoader";
const width = 1038 , height = 834;

const app = new PIXI.Application({
    width, height,
    backgroundColor: 0xFBF9ED,
    // resolution: window.devicePixelRatio || 1,
    resolution: window.devicePixelRatio || 1,
    antialias : true,
    forceCanvas : true
})
document.body.appendChild(app.view);

const {stage, loader} = app;

let resources;

// load resources
const loadResourcePromise = loadResources(loader)
    .then((res)=>{
        resources = res;
    })

// load fonts
const loadFontsPromise = loadFonts();

// create game instance
const game = new Game(width, height);

Promise.all([loadResourcePromise, loadFontsPromise])
    .then(startApp)

function startApp () {
    game.build(stage, resources);
    game.join();
}










