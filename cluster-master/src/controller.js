const socketClient = require('socket.io-client');
const data = require('./data');
const utility = require('./utility');
const workerConfig = require('../config/worker.json');

let initSocket = () => {

    console.log(`${utility.getTime()} : Initializing socket connection`);

    for(let  i = 0; i < workerConfig.length; i++) {

        let client = socketClient.connect(workerConfig[i].uri, {reconnect: true, forceNew: true});
        data.workerList.push([client, workerConfig[i].password]);
        data.workerStatus.push(false);

        data.workerList[i][0].on('response', function (response) {

            // when connected
            if(response.command === 'connected') {

                console.log(`${utility.getTime()} : Connected to socket server ${i}`);

                // spawn python process
                data.workerList[i][0].emit('request', {'command':'spawn', 'password':data.workerList[i][1]});

                // when job state updated
            } else if(response.command === 'job') {

                if(response.state === 'invalid') data.workerStatus[i] = false;
                else if(response.state === 'valid') data.workerStatus[i] = true;

                // when report came
            } else if(response.command === 'report') {

                if(response.status === 'OK') {

                    console.log(`${utility.getTime()} : Report received from ${i}`);

                } else {

                    console.log(`${utility.getTime()} : Error occurred from ${i}`);

                    data.workerStatus[i] = false;

                    console.log(`${utility.getTime()} : Restarting worker ${i}`);

                    data.workerList[i][0].emit('request', {'command':'spawn', 'password':data.workerList[i][1]});

                }

                // when result came
            } else if(response.command === 'result') {

                let currentCode = response.code;

                if(currentCode === 'INITIALIZE') {

                    console.log(`${utility.getTime()} : Worker ${i} initialized`);

                } else {

                    console.log(`${utility.getTime()} : ${'Job Received'.padEnd(15)}${`from ${i}`.padEnd(8)}${currentCode}`);

                    let result = response.result;

                    console.log(result);

                    let currentJob = data.workingTaskData[currentCode];

                    // send response to api request
                    let apiResponse = currentJob[1];
                    apiResponse.send(JSON.stringify(JSON.parse(`{ "tgt" : ${result} }`)));

                    // delete finished job
                    delete data.workingTaskData[currentCode];

                }

            }

        });

    }

};

let processQueue = async () => {

    while(true) {

        if(data.pendingTaskQueue.length !== 0) {

            // select first in queue
            let currentJob = data.pendingTaskQueue[0];
            let currentCode = currentJob[0];
            let currentSrc = currentJob[1];
            let currentResponse = currentJob[2];
            data.pendingTaskQueue.shift();
            data.workingTaskData[currentCode] = [currentSrc, currentResponse];

            let done = false;

            while(true) {

                if(done) break;

                for(let i = 0; i < data.workerList.length; i++) {

                    // select available worker
                    if(data.workerStatus[i]) {

                        console.log(`${utility.getTime()} : ${'Job Sent'.padEnd(15)}${`to ${i}`.padEnd(8)}${currentCode}`);

                        console.log(currentSrc);

                        data.workerList[i][0].emit('request', {'command':'run', 'password':data.workerList[i][1], 'code':currentCode, 'src':currentSrc});

                        data.workerStatus[i] = false;

                        done = true;

                        break;

                    }

                }

                await utility.delay(100); // if all workers are working

            }

        }

        if(data.pendingTaskQueue.length === 0) await utility.delay(100); // if queue is empty

    }

};

module.exports = {
    initSocket,
    processQueue
};
