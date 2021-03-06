const monthList = require('./months.json');

function cronDateExpression(datedObject) {
    const allMonth = monthList;
    const date = new Date(datedObject.date);
    const month = allMonth[date.getMonth()];
    const dateDay = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${ seconds } ${ minutes } ${ hours } ${ dateDay } ${ month } *`;
}

module.exports.cronDateExpression = cronDateExpression;
