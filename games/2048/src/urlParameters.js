import {getUrlParams} from "./utils";

export function getParameters() {

    const urlParams = getUrlParams(window.location.search);
    // const user_id = urlParams.user_id || 'anonymous';
    // const room_id = urlParams.room_id || null;
    // const hash = urlParams.hash || '';
    // const ignoreProviderFails = urlParams.ignoreProviderFails || 0;
    

    return urlParams;
}
