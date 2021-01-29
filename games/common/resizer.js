let VIEW, WIDTH, HEIGHT;
export default function (v, w, h) {
    VIEW = v;
    WIDTH = w;
    HEIGHT = h;
    window.addEventListener("resize", resize);

    resize();
}


function resize () {
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const RATIO = WIDTH / HEIGHT;
    const SCREEN_RATIO = innerWidth / innerHeight;

    let newWidth;
    // if (SCREEN_RATIO >= 1){
    //     newWidth = innerHeight * RATIO
    // } else {
    //     newWidth = innerWidth;
    // }
    newWidth = innerHeight * RATIO
    // console.log(innerWidth, innerHeight, SCREEN_RATIO, newWidth)

    VIEW.style.width = newWidth + 'px'
    // app.view.style.height = innerHeight + 'px'

}
