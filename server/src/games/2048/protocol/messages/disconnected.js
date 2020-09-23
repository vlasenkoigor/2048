module.exports = (user_id, room_id, users = '')=>{
    return {
        message : `Player with user id : ${user_id} has been disconnected from the game #${room_id}`,
        users,
    }
}
