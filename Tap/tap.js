const ruleClosure = (ruleID, filterCode, triggerApiCallMethodsCode, actuatorApiCallMethodsCode, periodInMs)=>{
 
    let intervalID = null;

    let filerCodeFunction = new Function(
        triggerApiCallMethodsCode   + '\n' +
        actuatorApiCallMethodsCode  + '\n' +
        filterCode
    );

    const start = ()=>{
        if(intervalID != null){
            console.log(`rule #${ruleID} is already started and cannot be started again.`)
        }else{
            intervalID = setInterval(()=>{
                console.log(`rule #${ruleID} : executing rule`);
                filerCodeFunction();
            },periodInMs);
        }  
    };

    const stop = ()=>{
        if(intervalID == null){
            console.log(`rule #${ruleID} is not running and cannot be stopped.`)
        }else{
            clearInterval(intervalID);
            intervalID = null;
        }
    };

    const editRule = (newFilterCode)=>{
        stop();
        filterCode = newFilterCode;
        filerCodeFunction = new Function(
            triggerApiCallMethodsCode   + '\n' +
            actuatorApiCallMethodsCode  + '\n' +
            filterCode
        );
        start();
    };

    const editRulePeriod = (newPeriodInMs)=>{
        stop();
        periodInMs = newPeriodInMs;
        start();
    };

    return {
        start : start,
        stop : stop,
        editRule : editRule,
        editRulePeriod : editRulePeriod,
    }
};

// Rule Test
// let rule = ruleClosure(1, `console.log("Hello world every 2 seconds.")`, 2000);
// rule.start();
// setTimeout(()=>{rule.editRule(`console.log("Hello world every 1 seconds.")`)}, 5000)
// setTimeout(()=>{rule.editRulePeriod(1000)}, 5000)

const tapClosure = ()=>{
    
    let lastId = 0;
    
    const triggers = {};
    const actuators = {};
    const rules = {};

    /*
    serviceType : trigger | actuator
    serviceApiCallMethodsCode : a JavaScript containing the definition of server methods
    */
    const registerService = (serviceName, serviceType, serviceApiCallMethodsCode)=>{
        switch(serviceType){
            case 'trigger':
                triggers[serviceName] = {
                    serviceApiCallMethodsCode : serviceApiCallMethodsCode,
                }
                break;
            case 'actuator':
                actuators[serviceName] = {
                    serviceApiCallMethodsCode : serviceApiCallMethodsCode,
                }
                break;
            default :
                console.log("Unknown service type.");
                break; 
        }
    }

    const deleteService = (serviceName)=>{

        if(triggers[serviceName]){
            delete triggers[serviceName]
        }else if(actuators[serviceName]){
            delete actuators[serviceName];
        }

    }

    const getServiceNames = ()=>{

        const services = {
            "triggerNames" : Object.keys(triggers),
            "actuatorsNames" : Object.keys(actuators),
        }

        return services;

    }

    const getNewID = ()=>{
        lastId++;
        return lastId.toString();
    }

    const setRule = (
        filterCode,
        minimizedAuxiliaryInformation,
        triggerName="random int generator",
        actuatorName = "message logger" ,
        periodInMs = 10000
    )=>{
        
        let id = getNewID();
        let triggerApiCallMethodsCode;
        let actuatorApiCallMethodsCode;

        if(triggers[triggerName]){
            triggerApiCallMethodsCode = triggers[triggerName].serviceApiCallMethodsCode;
        }else{
            console.log("Unknown trigger name");
        }

        if(actuators[actuatorName]){
            actuatorApiCallMethodsCode = actuators[actuatorName].serviceApiCallMethodsCode;
        }else{
            console.log("Unknown actuator name");
        }

        rules[id] = ruleClosure(
            id,
            filterCode,
            triggerApiCallMethodsCode,
            actuatorApiCallMethodsCode,
            periodInMs
        );

        rules[id].start();

    };

    const editRule = (newFilterCode, ruleID)=>{
        if(rules[ruleID]){
            rules[ruleID].editRule(newFilterCode);
        }else{
            console.log('ruleID not found');
        }
    }

    const editRulePeriod = (periodInMs, ruleID)=>{
        if(rules[ruleID]){
            rules[ruleID].editRulePeriod(periodInMs);
        }else{
            console.log('ruleID not found');
        }
    }

    const deleteRule = (ruleID)=>{
        if(rules[ruleID]){
            rules[ruleID].stop();
            delete rules[ruleID];
        }else{
            console.log('ruleID not found');
        }
    }

    return {
        registerService : registerService,
        deleteService : deleteService,
        getServiceNames : getServiceNames,
        setRule : setRule,
        editRule : editRule,
        editRulePeriod : editRulePeriod,
        deleteRule : deleteRule
    }
}

const tap = tapClosure();

// register default services
tap.registerService(
    "random int generator",
    "trigger",
    `const getRandomInt = (max=100)=>{return Math.floor(Math.random() * max);};`
);

tap.registerService(
    "message logger",
    "actuator",
    `const log = (msg)=>{console.log(msg)};`
);

module.exports.tap = tap;