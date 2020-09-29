export function loadResources(loader) {
    return new Promise(resolve=>{
        loader.add('layout','/assets/layout.json');

        loader.load((_, resources)=>{
            resolve(resources)
        })
    });
}
