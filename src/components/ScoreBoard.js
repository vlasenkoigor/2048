import {Container, Text, Graphics} from 'pixi.js'
export class ScoreBoard extends Container{
    
    constructor(){
        super();
        this._bg = this._drawBackground();
        this.addChild(this._bg);
    }

    _drawBackground(){
        // #3d3b34
        const g = new Graphics();
        g.beginFill(0x3d3b34);
        g.drawRoundedRect(0,0,150, 100, 10);
        g.endFill();
        g.cacheAsBitmap = true;
        return g;
    }
}