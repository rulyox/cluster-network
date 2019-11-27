let express = require('express');
let bodyParser = require('body-parser');
let minimist = require('minimist');
let taskRouter = require('./module/route/taskRouter');
let globalFunction = require('./module/function/globalFunction');
let socketFunction = require('./module/function/socketFunction');
let queueFunction = require('./module/function/queueFunction');

// connect to worker sockets
socketFunction.initSocket();

// asynchronous infinite loop
queueFunction.processQueue().then();

let arg = minimist(process.argv.slice(2));
let port = arg.port;

let app = express();
app.use(bodyParser.json());
app.use('/task', taskRouter);

app.get('/', (request, response) => response.send('Cluster Network Master'));

// redirect
app.get('*', (request, response) => response.redirect('/'));

app.listen(port, () => globalFunction.showMessage(`Listening on port ${port}`));
