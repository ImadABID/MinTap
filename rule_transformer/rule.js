let Office365Mail = require('./trigger_action_modules').Office365Mail;
let Slack = require('./trigger_action_modules').Slack;

let str = Office365Mail.newEmail.Subject;

if(str.indexOf('IFTTT')===-1){
    Slack.postToChannel.skip();
}else{
    Slack.postToChannel.setMessage(
        'Email ' + Office365Mail.newEmail.Subject + ' just received!'
    );
}