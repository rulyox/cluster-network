const crypto = require('crypto');
const express = require('express');
const globalModel = require('./global-model');

let counter = 1;

let router = express.Router();

router.post('/', (request, response) => {

    let inputJson = request.body;
    let inputTask = inputJson.src;

    // handle bad request
    if(inputTask === undefined) response.send('Bad Request');

    let code = crypto.createHash('sha512').update((counter++) + "").digest('hex');
    globalModel.requestQueue.push([code, inputTask, response]);

});

module.exports = router;
