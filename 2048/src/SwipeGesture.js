import directions from "./directions";
export class SwipeGesture {

    static listen(obj, callback){
        const minimalSwipeDistance = 15;

        obj.interactive = true;
        let swipeStarted = false;
        let startPoint = new PIXI.Point();


        obj.on('touchstart', e => {
            const data = e.data;
            startPoint.copy(data.global);
            swipeStarted = true;
        })

        obj.on('touchmove', e => {
            if (!swipeStarted) return;

            const data = e.data;
            const diffX = data.global.x - startPoint.x;
            const diffY = data.global.y - startPoint.y;

            if (Math.abs(diffX) >= minimalSwipeDistance || Math.abs(diffY) >= minimalSwipeDistance){

                let direction;

                // if we swiped by X coordinate
                if (Math.abs(diffX) >= Math.abs(diffY)){
                    direction = diffX > 0 ? directions.RIGHT : directions.LEFT;
                } else {
                    // if we swiped by Y coordinate
                    direction = diffY > 0 ? directions.DOWN : directions.UP;
                }

                callback(direction);
                swipeStarted = false;
            }
        })

        obj.on('touchend', _ => {
            swipeStarted = false;
        })
    }
}
