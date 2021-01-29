import {Container, Graphics, Text, Sprite} from 'pixi.js';

export class SurrenderButton extends Container {
    constructor(layout, resources, onClick = ()=>{}, isMobile) {
        super();

        const {x, y, width, height, radius, icon, text} = layout;

        this.createBackground(width, height, radius)
        this.createIcon(resources, icon);

        if (!isMobile){
            this.createLabel(width, height, text)
        }


        // set up interactive
        this.buttonMode = true;
        this.on('pointerdown', this._onClick.bind(this))
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
        g.beginFill(0xFBF9ED);
        g.lineStyle(2, 0xffffff, 0.2);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        g.cacheAsBitmap = true;
        this.addChild(g);
        return g;
    }


    createIcon(resources, iconLayout){
        const {
            x, y, anchor, size
        } = iconLayout;

        const icon = new Sprite(resources.arrow.texture);
        icon.x = x;
        icon.y = y;
        icon.width = size || 16;
        icon.height = size || 16;
        icon.anchor.set(anchor.x, anchor.y);
        icon.rotation  = -3.14159;
        this.addChild(icon);
    }


    createLabel(width, height, textLayout){
        const tf = new Text('Покинуть матч сохранив результат', {
            fontFamily : 'Fira Sans',
            fontSize : 14,
            fontWeight : 'normal',
            fill : "#3D3A33"
        });
        const {
            x, y, anchor
        } = textLayout;

        tf.x = x;
        tf.y = y;
        tf.anchor.set(anchor.x, anchor.y);
        this.addChild(tf);
    }

    _onClick(){
        this._onClickCallback();
    }
}
