let crypto = require('crypto');
let express = require('express');
let globalVar = require('../../global');

let counter = 1;

let router = express.Router();

router.post('/', (request, response) => {

    let inputJson = request.body;
    let inputTask = inputJson.src;

    // handle bad request
    if(inputTask === undefined) response.send('Bad Request');

    let code = crypto.createHash('sha512').update((counter++) + "").digest('hex');
    globalVar.requestQueue.push([code, inputTask, response]);

});

module.exports = router;
