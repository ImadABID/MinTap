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
    if(packageKeyword == null || packageKeyword.length === 0){
        return;
    }
    let index = rule.indexOf(packageKeyword);
    while(index != -1){
        
        try{
            callback(extractPackageVariable(rule.slice(rule.indexOf(packageKeyword))));
        }catch(e){
            console.error(`${e.name}: ${e.message}`);
        }
        
        rule = rule.slice(rule.indexOf(packageKeyword)+1)

        index = rule.indexOf(packageKeyword);
        console.log(index)
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

const ruleTransformer = (rule, triggerKeyword, actionKeyword)=>{

    // Computing T'
    trrigerList = []
    applyForAllVariableOfPackage(ruleExample, triggerKeyword, addToListIfNotExist(trrigerList));

    console.log('T\' = ')
    console.log(trrigerList);


}

ruleTransformer(ruleExample, 'Office365Mail', '');