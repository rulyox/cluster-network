let argv = require('minimist')(process.argv.slice(2));
const socketServer = require('./src/socket-server');

let port = parseInt(argv.port);
let password = argv.password;
let pythonBinPath = argv.python_bin;
let pythonExecutable = argv.python_exe;

let args = [
    pythonExecutable
];

socketServer.startServer(port, password, pythonBinPath, args);
