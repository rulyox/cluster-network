let workerList = []; // worker's client data
let workerStatus = []; // whether worker is working
let pendingTaskQueue = []; // pending tasks
let workingTaskData = {}; // response data of current tasks

module.exports = {
    workerList,
    workerStatus,
    pendingTaskQueue,
    workingTaskData
};
