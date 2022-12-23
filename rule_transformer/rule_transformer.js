ruleExample = `

let str = Office365Mail.newEmail.Subject;

if(str.indexOf('IFTTT')===-1){
    Slack.postToChannel.skip();
}else{
    Slack.postToChannel.setMessage(
        'Email ' + Office365Mail.newEmail.Subject + ' just received!'
        + Office365Mail.newEmail.Body
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
    
    // Is it a method
    if(variableName[variableName.length-1] == '('){
        throw new Error(`"${variableName}" is not a conform variable name !`);
    }
    
    return variableName;
}

const extractPackageMethodeCall = (str)=>{
    let methodeCallInstruction = '';
    let c;

    // extract method name
    let i;
    for(i = 0; i < str.length; i++){
        c = str[i];
        if(
            (c >= '0' && c <= '9' && i != 0) ||
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c === '.' && i != 0 ) ||
            (c === '_')
        ){
            methodeCallInstruction += c;
        }else{
            break;
        }
    }

    if(c!='('){
        throw new Error(`Can't detect an opening parenthesis for this method"${methodeCallInstruction}"`);
    }

    methodeCallInstruction+='(';
    
    // Detecting closing parenthesis
    let parenthesisNbr = 1;
    i++;
    while(parenthesisNbr>0){
        c = str[i];

        methodeCallInstruction += c;

        switch(c){
            case '(':
                parenthesisNbr++;
                break;
            case ')':
                parenthesisNbr--;
                break;
        }

        i++;
        if(i==str.length){
            throw new Error(`Can't detect an closing parenthesis for this method"${methodeCallInstruction}"`);
        }
    }

    return methodeCallInstruction;

}

const applyForAllObjOfPackage = (rule, packageKeyword, extractor, callback)=>{
    ruleCopy = (' '+rule).slice(1); // deep copy
    
    if(packageKeyword == null || packageKeyword.length === 0){
        return;
    }

    let index = ruleCopy.indexOf(packageKeyword);
    while(index != -1){
        
        try{
            callback(extractor(ruleCopy.slice(ruleCopy.indexOf(packageKeyword))));
        }catch(e){
            //console.error(`${e.name}: ${e.message}`);
        }
        
        ruleCopy = ruleCopy.slice(rule.indexOf(packageKeyword)+1)

        index = ruleCopy.indexOf(packageKeyword);
    }
}

const applyForAllVariableOfPackage = (rule, packageKeyword, callback)=>{
    applyForAllObjOfPackage(rule, packageKeyword, extractPackageVariable, callback);
}

const applyForAllMethodOfPackage = (rule, packageKeyword, callback)=>{
    applyForAllObjOfPackage(rule, packageKeyword, extractPackageMethodeCall, callback);
}

// applyForAllVariableOfPackage's callbacks
const addToListIfNotExist = (list)=>{
    return (ele)=>{
        if(!list.includes(ele)){
            list.push(ele);
        }
    }
}

const extartLastPartOfMethodName = (methodeCallInstruction)=>{
    lastName='';
    for(let i = 0; i < methodeCallInstruction.length; i++){
        c = methodeCallInstruction[i];
        switch(c){
            case '.':
                lastName = '';
                break;
            case '(':
                return lastName;
            default :
                lastName+=c;
                break;
        }
    }
    throw Error(`Invalid method call instruction "${methodeCallInstruction}"`);
}

const extartMethodName = (methodeCallInstruction)=>{
    methodName='';
    for(let i = 0; i < methodeCallInstruction.length; i++){
        c = methodeCallInstruction[i];
        if(c === '('){
            return methodName;
        }else{
            methodName+=c;
        }
    }
    throw Error(`Invalid method call instruction "${methodeCallInstruction}"`);
}

const rplaceActionMethodeWithStubs = (ruleObj)=>{
    let processed = [];
    return (methodeCallInstruction)=>{
        if(!processed.includes(methodeCallInstruction)){
            if(extartLastPartOfMethodName(methodeCallInstruction)==='skip'){
                ruleObj.rule = ruleObj.rule.replaceAll(methodeCallInstruction, 'print_access_tracking_result(); return');
            }else{
                ruleObj.rule = ruleObj.rule.replaceAll(extartMethodName(methodeCallInstruction), 'action_stub');
            }
        }
    };
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
    // --- Adding data-flow tracking logic
    // --- --- Adding tracker closure & action stub definition
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
        `
    };

    // --- --- Adding trackers for each trigger field
    applyForAllVariableOfPackage(rule, triggerKeyword, setAsATrakedParamIfNotYet(newRuleObj));

    // --- --- Replacing each trigger field by its tracker
    onlyRulePartModifObj = {
        rule: rule
    };
    applyForAllVariableOfPackage(rule, triggerKeyword, setReplaceATriggerFiledByItsTracker(onlyRulePartModifObj));

    // --- Replacing action with stub
    applyForAllMethodOfPackage(rule, actionKeyword, rplaceActionMethodeWithStubs(onlyRulePartModifObj));

    newRuleObj.rule += '\n'+onlyRulePartModifObj.rule;

    // Adding print code for accessed params
    newRuleObj.rule += `
print_access_tracking_result();
    `;

    // Printing Result
    console.log('f\' = ');
    console.log(newRuleObj.rule);


}

ruleTransformer(ruleExample, 'Office365Mail', 'Slack');
