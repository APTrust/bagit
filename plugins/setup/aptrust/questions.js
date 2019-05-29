const { AppSetting } = require('../../core/app_setting');
const { Choice } = require('../../ui/forms/choice');
const { Constants } = require('../../core/constants');
const { InternalSetting } = require('../../core/internal_setting');
const os = require('os');
const { RemoteRepository } = require('../../core/remote_repository');
const { SetupQuestion } = require('../../ui/forms/setup_question');
const { StorageService } = require('../../core/storage_service');


const Questions = [
    new SetupQuestion({
        header: "Your Organization",
        question: "What is the name of your organization? This name will become the default value of the Source-Organization field of the bag-info.txt file of each APTrust bag you create.",
        initialValue: "TODO: write getValue, as in setup_question.js",
        onValidResponse: "TODO: write setValue, as in setup_question.js"
    }),
    new SetupQuestion({
        header: "Your Organization",
        question: "What is your organization's domain name? All bags submitted to APTrust will be prefixed with this domain name.",
        validator: SetupQuestion.getPatternValidator(Constants.RE_DOMAIN),
        initialValue: "TODO: write getValue, as in setup_question.js",
        onValidResponse: "TODO: write setValue, as in setup_question.js"
    }),
    new SetupQuestion({
        header: "Bagging",
        question: "Where should DART build its bags?",
        validator: SetupQuestion.getPatternValidator(Constants.RE_FILE_PATH_ANY_OS),
        initialValue: "TODO: write getValue, as in setup_question.js",
        onValidResponse: "TODO: write setValue, as in setup_question.js"
    }),
    new SetupQuestion({
        header: "Object Access",
        question: "Set the default access policy for your APTrust bags. Consortia means other APTrust depositors can see your bag's metadata (title and description), but not its contents. Insitution means all APTrust users from your institution can see this object's metadata. Restricted means only your institutional administrator can see that this bag exists. Institution is usually the safe default. You can override this setting for any individual bag.",
        choices: Choice.makeList(
            ['Consortia', 'Institution', 'Restricted'],
            '', // TODO: getValue()
            false
        ),
        initialValue: "TODO: write getValue, as in setup_question.js",
        onValidResponse: "TODO: write setValue, as in setup_question.js"
    })

]

module.exports.Questions = Questions;
