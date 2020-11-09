import {Graphics} from 'pixi.js'
export class TopBar extends Graphics {

    constructor(layout) {
        super();
        this.draw(layout);
    }

    draw(layout){
        const {
            x, y, width, height, radius
        } = layout
        this.clear();
        this.beginFill(0xF2EFDD);
        this.drawRoundedRect(x, y, width, height, radius || 0);
        this.endFill();
    }

}
