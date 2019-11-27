function getTime() {

    return new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});

}

function showMessage(text) {

    console.log(`MASTER : ${getTime()} : ${text}`);

}

function delay(ms) {
    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });
}

module.exports = {

    showMessage : showMessage,
    delay : delay

};
