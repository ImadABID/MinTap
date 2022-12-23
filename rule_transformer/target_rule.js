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

const action_stub = (param_list)=>{};

const print_access_tracking_result = ()=>{
    for(traked_param_name in tracked_params){
        if(tracked_params[traked_param_name].accessed){
            console.log(traked_param_name);
        }
    }
}

let tracked_params = {};
        
tracked_params['Office365Mail.newEmail.Subject'] = access_tracker(Office365Mail.newEmail.Subject);
tracked_params['Office365Mail.newEmail.Body'] = access_tracker(Office365Mail.newEmail.Body);



let str = tracked_params['Office365Mail.newEmail.Subject'].value;

if(str.indexOf('IFTTT')===-1){
    print_access_tracking_result(); return;
}else{
    action_stub(
        'Email ' + tracked_params['Office365Mail.newEmail.Subject'].value + ' just received!'
        + tracked_params['Office365Mail.newEmail.Body'].value
    );
}

print_access_tracking_result();
