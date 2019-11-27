let globalFunction = require('./globalFunction');
let globalVar = require('../../global');

async function processQueue() {

    while(true) {

        if(globalVar.requestQueue.length !== 0) {

            // select first in queue
            let currentJob = globalVar.requestQueue[0];
            let currentCode = currentJob[0];
            let currentSrc = currentJob[1];
            let currentResponse = currentJob[2];
            globalVar.requestQueue.shift();
            globalVar.waitingList[currentCode] = [currentSrc, currentResponse];

            let done = false;

            while(true) {

                if(done) break;

                for(let i = 0; i < globalVar.workerList.length; i++) {

                    // select available worker
                    if(globalVar.workerStatus[i]) {

                        globalFunction.showMessage('Job Sent'.padEnd(15) + `to ${i}`.padEnd(8) + currentCode);

                        console.log(currentSrc);

                        globalVar.workerList[i][0].emit('request', {'command':'run', 'password':globalVar.workerList[i][1], 'code':currentCode, 'src':currentSrc});

                        globalVar.workerStatus[i] = false;

                        done = true;

                        break;

                    }

                }

                await globalFunction.delay(100); // if all workers are working

            }

        }

        if(globalVar.requestQueue.length === 0) await globalFunction.delay(100); // if queue is empty

    }

}

module.exports = {

    processQueue : processQueue

};
