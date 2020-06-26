const socketIO = require('socket.io');
const processController = require('./process-controller');
const utility = require('./utility');

function startServer(port, password, pythonBinPath, args) {

    console.log(`${utility.getTime()} : Starting socket server on port ${port}`);

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

                    console.log(`${utility.getTime()} : ${'Job Start '.padEnd(13)}${request.code}`);

                    socket.emit('response', {'command':'job', 'state':'invalid'});

                    processController.updateCurrent(request.code);

                    processController.writeProcess(JSON.stringify(request.src));

                    // spawn process
                } else if(request.command === 'spawn') {

                    socket.emit('response', {'command':'job', 'state':'invalid'});

                    processController.spawnProcess(socket, pythonBinPath, args);

                }

            } else socket.disconnect();

        });

    });

}

async function reportStatus(socket) {

    while(true) {

        if(socket.connected) {

            socket.emit('response', {'command':'report', 'status':'OK'});

            console.log(`${utility.getTime()} : Reported to master`);

            await utility.delay(1000 * 60); // 1 minute

        } else break; // stop when socket disconnected

    }

}

module.exports = {
    startServer
};
