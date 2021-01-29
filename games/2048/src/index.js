import * as PIXI from 'pixi.js'
import * as MobileDetect from 'mobile-detect'

import {Game} from "./Game";
import {loadResources} from "./resourceLoader";
import {loadFonts} from "./fontsLoader";
import {resize} from "./resize";

const md = new MobileDetect(window.navigator.userAgent);
const isMobile = !!md.mobile();

let width = 1038 , height = 834;
if (isMobile){
    width = 576
    height = 1024;
}

const app = new PIXI.Application({
    width, height,
    backgroundColor: 0xFBF9ED,
    resolution: window.devicePixelRatio || 1,
    antialias : true,
    forceCanvas : true
})
document.body.appendChild(app.view);


const {stage, loader} = app;

let resources;

// load resources
const loadResourcePromise = loadResources(loader, isMobile)
    .then((res)=>{
        resources = res;
    })

// load fonts
const loadFontsPromise = loadFonts();

// create game instance
const game = new Game(width, height);

Promise.all([loadResourcePromise, loadFontsPromise])
    .then(startApp)
    .catch(e =>{
        if (e === "fonts"){
            alert('error loading fonts!')
        }
    })


resize(app, width, height)();
window.addEventListener("resize", resize(app, width, height));

function startApp () {
    game.build(stage, resources, isMobile);
}










