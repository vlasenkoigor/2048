export function loadResources(loader, isMobile) {
    return new Promise(resolve=>{

        const layoutFileName = !isMobile ? '/assets/layout.json' : '/assets/layout_mobile.json';

        loader.add('layout', layoutFileName);
        loader.add('arrow','/assets/arrow.png');

        loader.load((_, resources)=>{
            resolve(resources)
        })
    });
}
