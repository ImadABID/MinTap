ruleExample = `

let str = Office365Mail.newEmail.Subject;

if(str.indexOf('IFTTT')===-1){
    Slack.postToChannel.skip();
}else{
    Slack.postToChannel.setMessage(
        'Email ' + Office365Mail.newEmail.Subject + ' just received!'
    );
}

`;

const extractPackageVariable = (str)=>{
    let variableName = '';
    let c;
    for(let i = 0; i < str.length; i++){
        c = str[i];
        if(
            (c >= '0' && c <= '9' && i != 0) ||
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c === '.' && i != 0 ) ||
            (c === '_')
        ){
            variableName += c;
        }else{
            break;
        }
    }
    
    if(variableName[variableName.length-1] != '.'){
        return variableName;
    }else{
        throw new Error(`"${variableName}" is not a conform variable name !`);
    }
}

const applyForAllVariableOfPackage = (rule, packageKeyword, callback)=>{
    
    ruleCopy = (' '+rule).slice(1); // deep copy
    
    if(packageKeyword == null || packageKeyword.length === 0){
        return;
    }

    let index = ruleCopy.indexOf(packageKeyword);
    while(index != -1){
        
        try{
            callback(extractPackageVariable(ruleCopy.slice(ruleCopy.indexOf(packageKeyword))));
        }catch(e){
            console.error(`${e.name}: ${e.message}`);
        }
        
        ruleCopy = ruleCopy.slice(rule.indexOf(packageKeyword)+1)

        index = ruleCopy.indexOf(packageKeyword);
    }

}

// applyForAllVariableOfPackage's callbacks
const addToListIfNotExist = (list)=>{
    return (ele)=>{
        if(!list.includes(ele)){
            list.push(ele);
        }
    }
}

const setAsATrakedParamIfNotYet = (ruleObj)=>{
    ruleObj.rule += '\n';
    let pushedParams = [];
    return (paramName)=>{
        if(!pushedParams.includes(paramName)){
            pushedParams.push(paramName);
            ruleObj.rule += `tracked_params['${paramName}'] = access_tracker(${paramName});\n`;
        }
    }
}

const setReplaceATriggerFiledByItsTracker = (ruleObj)=>{
    ruleObj.rule += '\n';
    let pushedParams = [];
    return (paramName)=>{
        if(!pushedParams.includes(paramName)){
            pushedParams.push(paramName);
            ruleObj.rule = ruleObj.rule.replaceAll(paramName, `tracked_params['${paramName}'].value`);
        }
    }
}

const ruleTransformer = (rule, triggerKeyword, actionKeyword)=>{

    // Compute T'
    trrigerList = []
    applyForAllVariableOfPackage(rule, triggerKeyword, addToListIfNotExist(trrigerList));

    console.log('T\' = ')
    console.log(trrigerList);

    // Compute f'
    let newRule = `
        
    `;
    // -- adding tracker closure
    newRuleObj = {
        rule:`
let access_tracker = (varValue)=>{
    let _type = 'trigger' // trigger or action
    let _value    = varValue
    let _accessed = false
    return {
        get value(){_accessed = true; return _value;},
        get accessed(){return _accessed;}
    }
}

let tracked_params = {};
        `
    };

    // --- Adding trackers for each trigger field
    applyForAllVariableOfPackage(rule, triggerKeyword, setAsATrakedParamIfNotYet(newRuleObj));

    // --- Replacing each trigger field by its tracker
    onlyRulePartModifObj = {
        rule: rule
    };
    applyForAllVariableOfPackage(rule, triggerKeyword, setReplaceATriggerFiledByItsTracker(onlyRulePartModifObj));
    newRuleObj.rule += '\n'+onlyRulePartModifObj.rule;

    // Adding print code for accessed params
    newRuleObj.rule += `
for(traked_param_name in tracked_params){
    if(tracked_params[traked_param_name].accessed){
        console.log(traked_param_name);
    }
}
    `;

    // Printing Result
    console.log('f\' = ');
    console.log(newRuleObj.rule);


}

ruleTransformer(ruleExample, 'Office365Mail', '');
