export function loadResources(loader, isMobile) {
    return new Promise(resolve=>{

        const layoutFileName = !isMobile ? '/assets/layout.json' : '/assets/layout_mobile.json';

        loader.add('layout', layoutFileName);
        loader.add('arrow','/assets/arrow.png');
        loader.add('coin_1','/assets/coin_1.png');
        loader.add('coin_2','/assets/coin_2.png');

        loader.load((_, resources)=>{
            resolve(resources)
        })
    });
}
