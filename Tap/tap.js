
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

    const init = ()=>{
        return new Promise((resolve)=>{
            console.log('Tap Init : Start');
            setTimeout(()=>{
                console.log('Tap Init : End');
                resolve();
            }, 6000);
        })
    }

    let initPromise = new Promise(async (resolve)=>{
        await init();
        resolve();
    });

    /*
    serviceType : trigger | actuator
    serviceApiCallMethodsCode : a JavaScript containing the definition of server methods
    */
    const registerService = async (serviceName, serviceType, serviceApiCallMethodsCode)=>{
        
        await initPromise;
        
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

    const deleteService = async (serviceName)=>{

        await initPromise;

        if(triggers[serviceName]){
            delete triggers[serviceName]
        }else if(actuators[serviceName]){
            delete actuators[serviceName];
        }

    }

    const getServiceNames = async ()=>{

        await initPromise;

        const services = {
            "triggerNames" : Object.keys(triggers),
            "actuatorsNames" : Object.keys(actuators),
        }

        return services;

    }

    const getNewRuleID = ()=>{
        lastId++;
        return lastId.toString();
    }

    const setRule = async (
        filterCode,
        minimizedAuxiliaryInformation,
        triggerName="random int generator",
        actuatorName = "message logger" ,
        periodInMs = 10000
    )=>{
        
        await initPromise;

        let id = getNewRuleID();
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

    const editRule = async (newFilterCode, ruleID)=>{
        await initPromise;
        if(rules[ruleID]){
            rules[ruleID].editRule(newFilterCode);
        }else{
            console.log('ruleID not found');
        }
    }

    const editRulePeriod = async (periodInMs, ruleID)=>{
        await initPromise;
        if(rules[ruleID]){
            rules[ruleID].editRulePeriod(periodInMs);
        }else{
            console.log('ruleID not found');
        }
    }

    const deleteRule = async (ruleID)=>{
        await initPromise;
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