const axios = require('axios');
const md5 = require('md5');

const SECRET = "grDFYFV3b84RgieQbUOP1DJXQYBCRnU7BsEYg5o0brTS";
const GAME_ID = 1;
const API_URL = "https://mindplays.com/api/v1";


function getError (error){
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

    get_info : (user_id, room_id, battle_id )=>{
        const game_id = GAME_ID;
        const string = [game_id, user_id, room_id, SECRET].join(':');
        const hash = md5(string);

        const params = {
            game_id,
            user_id,
            room_id,
            battle_id,
            timestamp : (+new Date() / 1000),
            hash
        }

        return new Promise((resolve, reject)=>{
            axios.post(API_URL + '/info_game', params)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(getError(error));
                });
        })
    },


    save_result : (user_id, room_id, battle_id, result_amount = 0, start_timestamp = 0, finish_timestamp = 0, data = {}  )=>{

        /**
         user_id - id пользователя в системе MP
         game_id - можно найти на странице developer для каждой игры он свой
         room_id - идентификатор данного матча
         result_amount - итоговый баланс пользователя после игры (начальный баланс был доступен в запросе info_game)
         start_timestamp - Unix-время начала игры
         finish_timestamp - Unix-время окончания игры
         hash - md5($game_id.':'.$user_id.':'.$room_id.':'. $secret)
         data - * массив данных действий текущего пользователя против других игроков, иными словами это все операции произведенные пользователем и его средствами против других играков
         */

        const game_id = GAME_ID;
        const string = [game_id, user_id, room_id, SECRET].join(':');

        const hash = md5(string);

        const params = {
            user_id,
            game_id,
            room_id,
            battle_id,
            result_amount,
            start_timestamp,
            finish_timestamp,
            timestamp : (+new Date() / 1000),
            hash,
            data
        }

        console.log('save result', params);

        return new Promise((resolve, reject)=>{
            axios.post(API_URL + '/result_game', params)
                .then(response => {
                    resolve(response.data);
                })
                .catch(error => {
                    reject(getError(error));
                });
        })


    }

}
