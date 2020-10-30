import {Graphics} from 'pixi.js';

export class MobileGridBackground extends Graphics{

    constructor(layout) {
        super();

        const {
            x, y, width, height, radius, alpha
        } =  layout;

        this.beginFill(0x000000, alpha);
        this.drawRoundedRect(0,0,width, height);
        this.endFill();


        this.x = x;
        this.y = y;
    }

}
