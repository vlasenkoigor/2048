import {Container, Sprite, Graphics, Text, Texture} from 'pixi.js'

export class PlayerInfo extends Container{
    constructor(data = {}, scoreBoardLayout) {
        super();

        const user = data.user || {};
        const {name, photo, location, location_img} = user;

        this.avatar = this._createAvatar(photo, scoreBoardLayout.avatar);

        this.flag = this._createFlag(location_img, scoreBoardLayout.flag);
        this.flag && this.addChild(this.flag);

        this.userName = this._createUserNameTf(name, scoreBoardLayout.userName);
        this.userName && this.addChild(this.userName);

        this.countryName = this._createCountryNameTf(location, scoreBoardLayout.countryName);
        this.countryName && this.addChild(this.countryName);

        this.x = scoreBoardLayout.x;
        this.y = scoreBoardLayout.y;

        // this._drawDebugRect();

    }

    _createAvatar(photo, layout){
        const avatar = Sprite.fromImage(photo, "");
        const {x, y, width, height} = layout;
        avatar.x = x;
        avatar.y = y;
        avatar.width = width;
        avatar.height = height;

        const mask = new Graphics();
        const radius = Math.max(width, height) / 2;
        mask.beginFill(0xD9D9D9);
        mask.drawCircle(x + radius, y + radius, radius);
        mask.endFill();
        avatar.mask = mask;

        this.addChild(avatar)
        this.addChild(mask);

        return avatar;
    }

    _createFlag(location_img, layout = {}){
        const flag = Sprite.fromImage(location_img, "");
        const {x, y, width, height} = layout;
        flag.x = x;
        flag.y = y;
        flag.width = width;
        flag.height = height;

        return flag;
    }

    _createUserNameTf(userName, layout){
        const {x, y} = layout;
        const style = {
            fontFamily : 'Barlow',
            fontSize : 18,
            fill : "#3D3A33"
        }
        const tf = new Text(userName, style);

        tf.x = x;
        tf.y = y;

        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y);
        }

        return tf;
    }



    _createCountryNameTf(name, layout){
        const {x, y} = layout;
        const style = {
            fontFamily : 'Barlow',
            fontSize : 12,
            fill : "#9C9A90"
        }
        const tf = new Text(name, style);

        tf.x = x;
        tf.y = y;

        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y);
        }


        return tf;
    }


    _drawDebugRect(){
        const g = new Graphics();
        g.beginFill(0xFF1000);
        g.drawRect(0,0,10,10);
        g.endFill();

        this.addChild(g);
    }

    //
    // updateInfo(data){
    //     const {name, photo, location, location_img} = data.user;
    //     this.userName.text = name;
    //     this.countryName.text = location;
    //     this.avatar.texture = Texture.fromImage(photo, "");
    //     this.flag.texture = Texture.fromImage(location_img, "");
    // }

}

