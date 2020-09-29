
import * as WebFont from 'webfontloader';

export function loadFonts() {
    return new Promise(resolve=>{
        WebFont.load({
            google: {
                families: ['Barlow']
            },
            active : ()=>{
                resolve();
            }
        });
    })

}
