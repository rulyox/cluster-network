const express = require('express');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const router = require('./src/router');
const controller = require('./src/controller');
const utility = require('./src/utility');

// connect to worker sockets
controller.initSocket();

// asynchronous infinite loop
controller.processQueue();

let arg = minimist(process.argv.slice(2));
let port = arg.port;

let app = express();
app.use(bodyParser.json());
app.use('/task', router);

app.get('/', (request, response) => response.send('Cluster Network Master'));

// redirect
app.get('*', (request, response) => response.redirect('/'));

app.listen(port, () => console.log(`${utility.getTime()} : Listening on port ${port}`));
