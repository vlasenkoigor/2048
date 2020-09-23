const axios = require('axios');
const md5 = require('md5');

const SECRET = "grDFYFV3b84RgieQbUOP1DJXQYBCRnU7BsEYg5o0brTS";
const GAME_ID = 1;


function onError (error){
    console.log(error.response, error.response.statusText);
    console.log(error.response.data);
}

module.exports = {

    validate_game : (data, cb, err_cb)=>{
        const {user_id, room_id, hash} = data;
        console.log(user_id, room_id, hash);
        // hash- md5($user_id.':'.$room_id.':'. $secret)
        const string = [user_id, room_id, SECRET].join(':')
        console.log(string);
        const res_hash = md5(string);

        console.log(res_hash)


    },

    get_info : (user_id, room_id )=>{
        axios.post('https://mindplays.com/api/v1/info_game')
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                onError(error);
            });
    }
}
