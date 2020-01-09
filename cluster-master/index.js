const express = require('express');
const bodyParser = require('body-parser');
const minimist = require('minimist');
const taskRouter = require('./module/task-router');
const globalFunc = require('./module/global-function');
const taskController = require('./module/task-controller');

// connect to worker sockets
taskController.initSocket();

// asynchronous infinite loop
taskController.processQueue().then();

let arg = minimist(process.argv.slice(2));
let port = arg.port;

let app = express();
app.use(bodyParser.json());
app.use('/task', taskRouter);

app.get('/', (request, response) => response.send('Cluster Network Master'));

// redirect
app.get('*', (request, response) => response.redirect('/'));

app.listen(port, () => console.log(`${globalFunc.getTime()} : Listening on port ${port}`));
