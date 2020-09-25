import {Container, Sprite} from 'pixi.js'

export class PlayerInfo extends Container{
    constructor(data) {
        const {name, photo, location, location_img} = data;
        debugger
        super();

        this.avatar = Sprite.fromImage(photo, "");
        this.avatar.width = 48;
        this.avatar.height = 48;
        this.addChild(this.avatar)

        this.flag = Sprite.fromImage(location_img, "");
        this.flag.width = 15;
        this.flag.height = 10;
        this.addChild(this.flag);

        this.flag.x = 55;
        this.flag.y = 35;




    }
}

