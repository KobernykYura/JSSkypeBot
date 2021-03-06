const { Container } = require('../common/injector.js');
const { Logger } = require('../common/logger.js');
const { FileLogger } = require('../common/fileLogger.js');
const { SkypeBot } = require('../presentation/bot/bot.js');
const { IllnessAnswering } = require('../features/messageAnswering/illnessAnswering.js');
const { Сongratulator } = require('../features/proactiveMessaging/birthdayCongratulation/congratulator.js');
const { AnswerDecision } = require('../features/messageAnswering/answerDecision.js');
const { HolidaySheduler } = require('../features/proactiveMessaging/holidayReminder/holidayScheduler.js');
const { NewIteration } = require('../features/proactiveMessaging/iterationUpdate/newIteration.js');
const { WeeklyReminder } = require('../features/proactiveMessaging/weeklyReminder/weeklyReminder.js');
const { AnswersFormatter } = require('../features/answersFormatter.js');
const { ReferenceRepository } = require('../storage/ReferenceRepository.js');
const { IterationRepository } = require('../storage/IterationRepository.js');
const { NotificationRepository } = require('../storage/NotificationRepository.js');
const { StateManagement } = require('./dialogStateManagement.js');
const { DbClient } = require('../services/dbClient.js');
const { dbConnection } = require('./dbConnection.js');
const { botAdapter } = require('./botAdapter.js');
const { MemoryStorage } = require('botbuilder');

let injector = null;

function registerTypes() {
    if (!injector) {
        injector = new Container();

        injector.register('Common.Logger', (...args) => {
            return (process.env.loggerFilePath) ?
                new FileLogger(process.env.loggerFilePath, ...args) :
                new Logger(...args);
        });
        injector.register('Common.AnswersFormatter', (...args) => new AnswersFormatter(...args));

        injector.register('Services.DbClient', new DbClient(dbConnection()));

        injector.register('DAL.ReferenceRepository', new ReferenceRepository());
        injector.register('DAL.IterationRepository', new IterationRepository());
        injector.register('DAL.NotificationRepository', new NotificationRepository());
        injector.register('DAL.InMemory', new MemoryStorage());

        injector.register('SkypeBot.TextAnswers', (...args) => new AnswerDecision(...args));
        injector.register('SkypeBot.HolidaySheduler', (...args) => new HolidaySheduler(...args));
        injector.register('SkypeBot.IllnessAnswering', (...args) => new IllnessAnswering(...args));
        injector.register('SkypeBot.Сongratulator', (...args) => new Сongratulator(...args));
        injector.register('SkypeBot.NewIteration', new NewIteration());
        injector.register('SkypeBot.WeeklyReminder', new WeeklyReminder());
        injector.register('SkypeBot.State', new StateManagement());

        injector.register('Bot.SkypeBot', new SkypeBot());
        injector.register('Bot.Adapter', botAdapter());
    }
    return getInstance;
};

function getInstance(typeName, ...args) {
    if (injector) {
        const instance = injector.getInstance(typeName);
        return typeof instance === 'function' ?
            instance(...args) :
            instance;
    }
};

module.exports.registerTypes = registerTypes;
module.exports.getInstance = getInstance;
