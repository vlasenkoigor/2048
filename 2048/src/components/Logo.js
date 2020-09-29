import {Container, Text} from 'pixi.js';

export class Logo extends Container{

    constructor(layout) {
        super();
        const {x, y, text1,  text2} = layout;


        const tf1 = new Text('2048',
            {
            fontFamily : 'Barlow',
            fontSize : 64,
            fontWeight : 'bold',
            fill : "#3D3A33"
        })
        tf1.x = text1.x;
        tf1.y = text1.y;
        tf1.anchor.set(text1.anchor.x, text1.anchor.y);
        this.addChild(tf1);

        const tf2 = new Text('MINDPLAYS EDITION',
            {
                fontFamily : 'Barlow',
                fontSize : 15,
                fontWeight : 'bold',
                fill : "#3D3A33"
            })
        tf2.x = text2.x;
        tf2.y = text2.y;
        tf2.anchor.set(text2.anchor.x, text2.anchor.y);
        this.addChild(tf2);

        this.x = x;
        this.y = y;
    }
}
