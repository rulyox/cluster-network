let socketIO = require('socket.io');
let globalFunction = require('./globalFunction');
let processFunction = require('./processFunction');

function startServer(port, password, pythonBinPath, args) {

    globalFunction.showMessage(`Starting socket server on port ${port}`);

    socketIO.listen(port).on('connection', (socket) => {

        // response connection established
        socket.emit('response', {'command':'connected'});

        // report server status infinitely
        reportStatus(socket).then();

        // get request
        socket.on('request', (request) => {

            if(request.password === password) {

                // run inference
                if(request.command === 'run') {

                    globalFunction.showMessage('Job Start '.padEnd(13) + request.code);

                    socket.emit('response', {'command':'job', 'state':'invalid'});

                    processFunction.updateCurrent(request.code);

                    processFunction.writeProcess(JSON.stringify(request.src));

                    // spawn process
                } else if(request.command === 'spawn') {

                    socket.emit('response', {'command':'job', 'state':'invalid'});

                    processFunction.spawnProcess(socket, pythonBinPath, args);

                }

            } else socket.disconnect();

        });

    });

}

async function reportStatus(socket) {

    while(true) {

        if(socket.connected) {

            socket.emit('response', {'command':'report', 'status':'OK'});

            globalFunction.showMessage('Reported to master');

            await globalFunction.delay(1000 * 60); // 1 minute

        } else break; // stop when socket disconnected

    }

}

module.exports = {

    startServer : startServer

};
