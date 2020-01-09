const childProcess = require('child_process');
const globalFunc = require('./global-function');

let pythonProcess;
let currentCode;

function spawnProcess(socket, pythonBinPath, args) {

    currentCode = 'INITIALIZE';

    // kill existing process
    try{

        pythonProcess.kill('SIGKILL');

        console.log(`${globalFunc.getTime()} : Killed existing process`);

    } catch (e) {

        console.log(`${globalFunc.getTime()} : No process to kill`);

    }

    // spawn new process & initialize
    console.log(`${globalFunc.getTime()} : Process Spawn`);

    pythonProcess = childProcess.spawn(pythonBinPath, args);

    // pipe stdout
    pythonProcess.stdout.on('data', (data) => {

        socket.emit('response', {'command':'job', 'state':'valid'});

        socket.emit('response', {'command':'result', 'code':currentCode, 'result':`${data.toString()}`});

        console.log(`${globalFunc.getTime()} : ${'Job Done '.padEnd(13)}${currentCode}`);

    });

    // pipe stderr
    let errorMsg = '';

    pythonProcess.stderr.on('data', (data) => {

        errorMsg += data.toString();

    });

    pythonProcess.stderr.on('end', () => {

        socket.emit('response', {'command':'report', 'status':'ERROR'});

        console.log(`OPERATOR ERROR : ${globalFunc.getTime()}\n${errorMsg}`);

    });

}

function writeProcess(text) {

    pythonProcess.stdin.write(text);
    pythonProcess.stdin.write('\n');

}

function updateCurrent(code) {

    currentCode = code;

}

module.exports = {

    spawnProcess : spawnProcess,
    writeProcess : writeProcess,
    updateCurrent : updateCurrent

};
