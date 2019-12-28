// Import some of the capabities from the module.
import { StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { AddIterationDialog } from './iterations/add';
import { EditIterationDialog } from './iterations/edit';
import { options } from './iterations/options';
import { RemoveIterationDialog } from './iterations/remove';

const CHOICE_PRESENTED_OPTION_ITERATION_ACTIVITY = 'CHOICE_PRESENTED_OPTION_ITERATION_ACTIVITY_TYPE';

const REMOVE_ITERATION_WATERFALL_DIALOG: string = 'REMOVE_ITERATION_WATERFALL_DIALOG';
const EDIT_ITERATION_WATERFALL_DIALOG: string = 'EDIT_ITERATION_WATERFALL_DIALOG';
const ADD_ITERATION_WATERFALL_DIALOG: string = 'ADD_ITERATION_WATERFALL_DIALOG';

export class IterationDialog extends ComponentDialog {

    private finishCallback: Function;

    constructor(MAIN_ITERATION_WATERFALL_DIALOG: string, finishCallback: Function) {
        super(MAIN_ITERATION_WATERFALL_DIALOG);

        this.finishCallback = finishCallback;

        // Define the main dialog and its related components.
        this.addDialog(new WaterfallDialog(MAIN_ITERATION_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.redirectIterationDialogStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.addDialog(new ChoicePrompt(CHOICE_PRESENTED_OPTION_ITERATION_ACTIVITY));
        this.addDialog(new RemoveIterationDialog(REMOVE_ITERATION_WATERFALL_DIALOG));
        this.addDialog(new EditIterationDialog(EDIT_ITERATION_WATERFALL_DIALOG));
        this.addDialog(new AddIterationDialog(ADD_ITERATION_WATERFALL_DIALOG));

        // The initial child Dialog to run.
        this.initialDialogId = MAIN_ITERATION_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity
     * (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {TurnContext} turnContext
     * @param {DialogState} dialogState
     */
    async run(turnContext: TurnContext, dialogState: StatePropertyAccessor) {
        const dialogSet = new DialogSet(dialogState);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * Starts dialog conversation with the bot.
     * @param {WaterfallStepContext} stepContext
     */
    async initialStep(stepContext: WaterfallStepContext) {
        console.log('MainDialog.initialStep');
        const stepOptions = options(CHOICE_PRESENTED_OPTION_ITERATION_ACTIVITY);
        return await stepContext.prompt(CHOICE_PRESENTED_OPTION_ITERATION_ACTIVITY, stepOptions);
    }

    /**
     * Redirects dialog workflow according to selected iteration option.
     * @param {WaterfallStepContext} stepContext
     */
    async redirectIterationDialogStep(stepContext: WaterfallStepContext) {
        console.log('MainDialog.redirectIterationDialogStep');
        let nextDialogId = '';
        if (stepContext.result) {
            switch (stepContext.result.value) {
                case 'add':
                    nextDialogId = ADD_ITERATION_WATERFALL_DIALOG;
                    break;
                case 'edit':
                    nextDialogId = EDIT_ITERATION_WATERFALL_DIALOG;
                    break;
                case 'remove':
                    nextDialogId = REMOVE_ITERATION_WATERFALL_DIALOG;
                    break;
                default:
                    return await stepContext.replaceDialog(this.id);
            }

            return await stepContext.beginDialog(nextDialogId);
        }
        await stepContext.context.sendActivity(
            `Let me know when you'll decide to schedule, delete or update any iteration info.`
        );
        return await stepContext.endDialog();
    }

    /**
     * Starts dialog conversation with the bot.
     * @param {WaterfallStepContext} stepContext
     */
    async finalStep(stepContext: WaterfallStepContext) {
        console.log('MainDialog.finalStep');

        if (stepContext.result) {
            switch (stepContext.result.action) {
                case 'DELETE':
                case 'EDIT':
                case 'ADD':
                    break;
                default:
                    await stepContext.context.sendActivity(
                        `Sorry, something went wrong :( Please сontact Yuri Kabernik-Berazouski to help you solve this problem.`
                    );
                    return await stepContext.endDialog();
            }

            if (typeof (this.finishCallback) === 'function') {
                await this.finishCallback(stepContext.result);
            }
        }
        await stepContext.context.sendActivity(
            `The dialogue is over, thanks for participating :)
            Let me know when you'll decide to schedule, delete or update any iteration info.`
        );
        return await stepContext.endDialog();
    }
}
