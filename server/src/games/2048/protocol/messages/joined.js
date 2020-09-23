module.exports = (user_id, room_id, reconnected = false, users = '')=>{
    return {
        message : `Player with user id : ${user_id} has been ${reconnected ? 'reconnected' : 'added'} to game #${room_id}`,
        users,
    }
}
