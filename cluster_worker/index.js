let argv = require('minimist')(process.argv.slice(2));
let socketFunction = require('./module/function/socketFunction');

let port = parseInt(argv.port);
let password = argv.password;
let pythonBinPath = argv.python_bin;
let pythonExecutable = argv.python_exe;

let args = [
    pythonExecutable
];

socketFunction.startServer(port, password, pythonBinPath, args);
