const socketClient = require('socket.io-client');
const globalFunc = require('./global-function');
const globalModel = require('./global-model');
const workerConfig = require('../config/worker');

let initSocket = () => {

    console.log(`${globalFunc.getTime()} : Initializing socket connection`);

    for(let  i = 0; i < workerConfig.length; i++) {

        let client = socketClient.connect(workerConfig[i].uri, {reconnect: true, forceNew: true});
        globalModel.workerList.push([client, workerConfig[i].password]);
        globalModel.workerStatus.push(false);

        globalModel.workerList[i][0].on('response', function (response) {

            // when connected
            if(response.command === 'connected') {

                console.log(`${globalFunc.getTime()} : Connected to socket server ${i}`);

                // spawn python process
                globalModel.workerList[i][0].emit('request', {'command':'spawn', 'password':globalModel.workerList[i][1]});

                // when job state updated
            } else if(response.command === 'job') {

                if(response.state === 'invalid') globalModel.workerStatus[i] = false;
                else if(response.state === 'valid') globalModel.workerStatus[i] = true;

                // when report came
            } else if(response.command === 'report') {

                if(response.status === 'OK') {

                    console.log(`${globalFunc.getTime()} : Report received from ${i}`);

                } else {

                    console.log(`${globalFunc.getTime()} : Error occurred from ${i}`);

                    globalModel.workerStatus[i] = false;

                    console.log(`${globalFunc.getTime()} : Restarting worker ${i}`);

                    globalModel.workerList[i][0].emit('request', {'command':'spawn', 'password':globalModel.workerList[i][1]});

                }

                // when result came
            } else if(response.command === 'result') {

                let currentCode = response.code;

                if(currentCode === 'INITIALIZE') {

                    console.log(`${globalFunc.getTime()} : Worker ${i} initialized`);

                } else {

                    console.log(`${globalFunc.getTime()} : ${'Job Received'.padEnd(15)}${`from ${i}`.padEnd(8)}${currentCode}`);

                    let result = response.result;

                    console.log(result);

                    let currentJob = globalModel.waitingList[currentCode];

                    // send response to api request
                    let apiResponse = currentJob[1];
                    apiResponse.send(JSON.stringify(JSON.parse(`{ "tgt" : ${result} }`)));

                    // delete finished job
                    delete globalModel.waitingList[currentCode];

                }

            }

        });

    }

};

let processQueue = async () => {

    while(true) {

        if(globalModel.requestQueue.length !== 0) {

            // select first in queue
            let currentJob = globalModel.requestQueue[0];
            let currentCode = currentJob[0];
            let currentSrc = currentJob[1];
            let currentResponse = currentJob[2];
            globalModel.requestQueue.shift();
            globalModel.waitingList[currentCode] = [currentSrc, currentResponse];

            let done = false;

            while(true) {

                if(done) break;

                for(let i = 0; i < globalModel.workerList.length; i++) {

                    // select available worker
                    if(globalModel.workerStatus[i]) {

                        console.log(`${globalFunc.getTime()} : ${'Job Sent'.padEnd(15)}${`to ${i}`.padEnd(8)}${currentCode}`);

                        console.log(currentSrc);

                        globalModel.workerList[i][0].emit('request', {'command':'run', 'password':globalModel.workerList[i][1], 'code':currentCode, 'src':currentSrc});

                        globalModel.workerStatus[i] = false;

                        done = true;

                        break;

                    }

                }

                await globalFunc.delay(100); // if all workers are working

            }

        }

        if(globalModel.requestQueue.length === 0) await globalFunc.delay(100); // if queue is empty

    }

};

module.exports = {

    initSocket : initSocket,
    processQueue : processQueue

};
