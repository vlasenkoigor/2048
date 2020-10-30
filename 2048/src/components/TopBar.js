import {Graphics} from 'pixi.js'
export class TopBar extends Graphics {

    constructor(layout) {
        super();
        this.draw(layout);
    }

    draw(layout){
        const {
            x, y, width, height
        } = layout
        this.clear();
        this.beginFill(0xF2EFDD);
        this.drawRect(x, y, width, height);
        this.endFill();
    }

}
