let tracked_params = [];

tracked_params.push(
    {
        type : 'trigger', // trigger or action
        var_name : 'Office365Mail.newEmail.Subject',
        value    : '[IFTTT] Urgent mail',
        accessed : false,

        // get value ()=>{return this.value},
    }
)

// Rule
// let Office365Mail = require('./trigger_action_modules').Office365Mail;
// let Slack = require('./trigger_action_modules').Slack;

// let str = Office365Mail.newEmail.Subject;

// if(str.indexOf('IFTTT')===-1){
//     Slack.postToChannel.skip();
// }else{
//     Slack.postToChannel.setMessage(
//         'Email ' + Office365Mail.newEmail.Subject + ' just received!'
//     );
// }
// ---