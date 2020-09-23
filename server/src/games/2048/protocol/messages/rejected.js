module.exports = (room_id, user_id, reason = 1)=>{
    let message = '';
    switch (reason) {

        case 1 :
            message = `Game #${room_id} already full`;
            break;
        case 2 :
            message = `Game #${room_id}: can not register, game already started`;
            break;
        case 3 :
            message = `User #${user_id} already connected to the game #${room_id}`;
            break;
        default:
            break;
    }

    return {
        reason : message,
    }
}
