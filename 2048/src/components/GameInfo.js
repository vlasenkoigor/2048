import {Container, Text, Graphics} from 'pixi.js';

export class GameInfo extends Container{


    constructor(layout) {
        super();
        const {x, y, width, height, radius, label, value} = layout;

        this.createBackground(width, height, radius)
        this.createLabel(width, label);
        this.value = this.createValue(value);

        this.x = x;
        this.y = y;
    }

    setValue(value){
        this.value.text = value;
    }

    createBackground(width, height, radius){
        const g = new Graphics();
        g.beginFill(0xffffff);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        g.cacheAsBitmap = true;
        this.addChild(g);
    }

    createLabel(width, layout){
        const tf = new Text('The winner will take', {
            fontFamily : 'Barlow',
            fontSize : 18,
            fontWeight : 'normal',
            fill : "#3D3A33"
        });
        tf.anchor.set(layout.anchor.x, layout.anchor.y);
        tf.y = layout.y;
        tf.x = width / 2;

        this.addChild(tf);
    }

    createValue(layout){
        const tf = new Text('', {
            fontFamily : 'Barlow',
            fontSize : 26,
            fontWeight : 'bold',
            fill : "#00C443"
        });
        tf.anchor.set(layout.anchor.x, layout.anchor.y);
        tf.x = layout.x;
        tf.y = layout.y;

        this.addChild(tf);

        return tf;
    }
}
