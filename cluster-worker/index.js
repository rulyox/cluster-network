let argv = require('minimist')(process.argv.slice(2));
const socketController = require('./module/socket-controller');

let port = parseInt(argv.port);
let password = argv.password;
let pythonBinPath = argv.python_bin;
let pythonExecutable = argv.python_exe;

let args = [
    pythonExecutable
];

socketController.startServer(port, password, pythonBinPath, args);
