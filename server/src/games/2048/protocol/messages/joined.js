module.exports = (user_id, room_id, reconnected = false, users = '', data={})=>{
    return {
        message : `Player with user id : ${user_id} has been ${reconnected ? 'reconnected' : 'added'} to game #${room_id}`,
        user_id,
        users,
        data
    }
}
