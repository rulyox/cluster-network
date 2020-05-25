let getTime = () => {

    return new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});

};

let delay = (ms) => {
    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });
};

module.exports = {
    getTime,
    delay
};
