const axios = require('axios');
const md5 = require('md5');

const SECRET = "grDFYFV3b84RgieQbUOP1DJXQYBCRnU7BsEYg5o0brTS";
const GAME_ID = 1;
const API_URL = "https://mindplays.com/api/v1/info_game";


function getError (error){
    console.log(error)
    const {response} = error;
    if (!response) return {status: 'NR', statusText: 'No response!'}

    const {status, statusText, data} = response

    return {
        status, statusText, data
    }
}

module.exports = {

    validate_game : (data)=>{
        const {user_id, room_id, hash} = data;
        const string = [user_id, room_id, SECRET].join(':')
        return  hash === md5(string);
    },

    get_info : (user_id, room_id )=>{
        return new Promise((resolve, reject)=>{

            const game_id = GAME_ID;
            const string = [game_id, user_id, room_id, SECRET].join(':');
            const hash = md5(string);

            const params = {
                game_id,
                user_id,
                room_id,
                hash
            }

            axios.post(API_URL, params)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(getError(error));
                });
        })
    },


    save_result : (user_id, room_id)=>{

        /**
         game_id- можно найти на странице developer для каждой игры он свой
         user_id - id пользователя в системе MP
         room_id - идентификатор данного матча
         hash - md5($game_id.':'.$user_id.':'.$room_id.':'. $secret)
         */

        const game_id = GAME_ID;
        const string = [game_id, user_id, room_id, SECRET].join(':');

        const hash = md5(string);

        const params = {
            game_id,
            user_id,
            room_id,
            hash
        }

        axios.post(UIEvent)

    }

}
