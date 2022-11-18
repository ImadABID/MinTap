let Office365Mail = require('./trigger_action_modules').Office365Mail;
let Slack = require('./trigger_action_modules').Slack;

let access_tracker = (varValue)=>{
    let _type = 'trigger' // trigger or action
    let _value    = varValue
    let _accessed = false
    return {
        get value(){_accessed = true; return _value;},
        get accessed(){return _accessed;}
    }
};

let tracked_params = {};
tracked_params['Office365Mail.newEmail.Subject'] = access_tracker(Office365Mail.newEmail.Subject);

console.log(tracked_params['Office365Mail.newEmail.Subject'].accessed)
console.log(tracked_params['Office365Mail.newEmail.Subject'].value)
console.log(tracked_params['Office365Mail.newEmail.Subject'].accessed)


for(traked_param_name in tracked_params){
    if(tracked_params[traked_param_name].accessed){
        console.log(traked_param_name);
    }
}

// let str = Office365Mail.newEmail.Subject;

// if(str.indexOf('IFTTT')===-1){
//     Slack.postToChannel.skip();
// }else{
//     Slack.postToChannel.setMessage(
//         'Email ' + Office365Mail.newEmail.Subject + ' just received!'
//     );
// }
// ---