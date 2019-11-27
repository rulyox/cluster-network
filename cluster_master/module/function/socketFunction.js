let globalFunction = require('./globalFunction');
let socketClient = require('socket.io-client');
let workerConfig = require('../../config/worker');
let globalVar = require('../../global');

function initSocket() {

    globalFunction.showMessage('Initializing socket connection');

    for(let  i = 0; i < workerConfig.length; i++) {

        let client = socketClient.connect(workerConfig[i].uri, {reconnect: true, forceNew: true});
        globalVar.workerList.push([client, workerConfig[i].password]);
        globalVar.workerStatus.push(false);

        globalVar.workerList[i][0].on('response', function (response) {

            // when connected
            if(response.command === 'connected') {

                globalFunction.showMessage(`Connected to socket server ${i}`);

                // spawn python process
                globalVar.workerList[i][0].emit('request', {'command':'spawn', 'password':globalVar.workerList[i][1]});

            // when job state updated
            } else if(response.command === 'job') {

                if(response.state === 'invalid') globalVar.workerStatus[i] = false;
                else if(response.state === 'valid') globalVar.workerStatus[i] = true;

            // when report came
            } else if(response.command === 'report') {

                if(response.status === 'OK') {

                    globalFunction.showMessage(`Report received from ${i}`);

                } else {

                    globalFunction.showMessage(`Error occurred from ${i}`);

                    globalVar.workerStatus[i] = false;

                    globalFunction.showMessage(`Restarting worker ${i}`);

                    globalVar.workerList[i][0].emit('request', {'command':'spawn', 'password':globalVar.workerList[i][1]});

                }

            // when result came
            } else if(response.command === 'result') {

                let currentCode = response.code;

                if(currentCode === 'INITIALIZE') {

                    globalFunction.showMessage(`Worker ${i} initialized`);

                } else {

                    globalFunction.showMessage('Job Received'.padEnd(15) + `from ${i}`.padEnd(8) + currentCode);

                    let result = response.result;

                    console.log(result);

                    let currentJob = globalVar.waitingList[currentCode];

                    // send response to api request
                    let apiResponse = currentJob[1];
                    apiResponse.send(JSON.stringify(JSON.parse(`{ "tgt" : ${result} }`)));

                    // delete finished job
                    delete globalVar.waitingList[currentCode];

                }

            }

        });

    }

}

module.exports = {

    initSocket : initSocket

};
