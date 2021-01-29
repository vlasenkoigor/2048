import * as MobileDetect from 'mobile-detect';
const md = new MobileDetect(window.navigator.userAgent);
const isMobile = !!md.mobile();

import resizer from "./resizer";

export class Application extends PIXI.Application {

    constructor(config) {
        super(Application.getPIXIConfig(config, isMobile));

        this.gameConfig = config;

        document.body.appendChild(this.view);
        this._resize();
    }

    _loadFonts(){

    }

    _resize(){
        const {width, height} = Application.getSize(this.gameConfig);
        resizer(this.view, width, height);
    }


    static getPIXIConfig(gameConfig, isMobile){
        const {width, height} = Application.getSize(gameConfig, isMobile);

        return {
            width, height,
            backgroundColor: gameConfig.backgroundColor || 0xffffff,
            resolution: window.devicePixelRatio || 1,
            antialias : true,
            forceCanvas : true
        }
    }

    static getSize(config, isMobile){
        const confSize = isMobile ? config.mobileSize : config.size;
        const width = confSize.width || 300;
        const height = confSize.height || 300;

        return {
            width, height
        }
    }
}


