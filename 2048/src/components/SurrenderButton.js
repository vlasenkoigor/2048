import {Container, Graphics, Text} from 'pixi.js';

export class SurrenderButton extends Container {
    constructor(layout, onClick = ()=>{}) {
        super();

        const {x, y, width, height, radius, label, value} = layout;

        this.createBackground(width, height, radius)
        this.createLabel(width, height)


        // set up interactive
        this.buttonMode = true;
        this.on('pointerdown ', this._onClick.bind(this))
        this.on('click', this._onClick.bind(this))
        this.enable();
        this._onClickCallback = onClick;

        this.x = x;
        this.y = y;
    }

    enable(){
        this.interactive = true;
    }

    disable(){
        this.interactive = false;
    }


    createBackground(width, height, radius){
        const g = new Graphics();
        g.beginFill(0xffffff);
        g.lineStyle(2, 0x9D999C, 0.2);
        g.drawRoundedRect(0,0,width, height, radius);

        g.endFill();
        // g.cacheAsBitmap = true;
        this.addChild(g);
    }

    createLabel(width, height){
        const tf = new Text('Quit the game ', {
            fontFamily : 'Barlow',
            fontSize : 14,
            fontWeight : 'bold',
            fill : "#F76148"
        });
        tf.anchor.set(0.5);
        tf.x = width / 2;
        tf.y = height / 2;
        this.addChild(tf);
    }

    _onClick(){
        this._onClickCallback();
    }
}
