const { AnswersFormatter } = require('../answersFormatter.js');
const keyPhrases = require('./keyPhrases/gotSickToday.json');

class IllnessAnswering {
    getAnswerMessage(message = '') {
        message = message.toLowerCase();
        if (keyPhrases.sickToday.some(keyPhrase => message.includes(keyPhrase))) {
            return AnswersFormatter.lookup('getWellOnSickToday');
        }
        if (keyPhrases.sickLeaveToday.some(keyPhrase => message.includes(keyPhrase))) {
            return AnswersFormatter.lookup('getWellOnSickLeaveToday');
        }
        if (keyPhrases.sickLeaveTomorrow.some(keyPhrase => message.includes(keyPhrase))) {
            return AnswersFormatter.lookup('getWellOnSickLeaveTomorrow');
        }
        if (keyPhrases.halfDaySickLeave.some(keyPhrase => message.includes(keyPhrase))) {
            return AnswersFormatter.lookup('getWellOnHalfDaySickLeave');
        }
        return '';
    }

    isContainsIllnessPhrase(message = '') {
        message = message.toLowerCase();
        const sickPhraseGroups = Object.keys(keyPhrases);
        const remoteWorkPhrases = sickPhraseGroups.reduce(
            (result, key) => result.concat(keyPhrases[key]),
            []
        ).map(phrase => phrase.toLowerCase());
        return remoteWorkPhrases.some(keyPhrase => message.includes(keyPhrase));
    }
}

module.exports.IllnessAnswering = IllnessAnswering;