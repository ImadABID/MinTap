const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient('mongodb://localhost:27017/');
const tapDB = mongoClient.db('tap');

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
    const rulesObject = {};

    const servicesCollection = tapDB.collection('services');
    const rulesCollection = tapDB.collection('rules');

    const init = ()=>{
        return new Promise(async (resolve)=>{
            console.log('Tap Init : Start');

            const _servicesCursor = servicesCollection.find({});
            await _servicesCursor.forEach((service)=>{

                _registerService(
                    service.serviceName,
                    service.serviceType,
                    service.serviceApiCallMethodsCode
                );

            })

            const _rulesCursor = rulesCollection.find({});
            await _rulesCursor.forEach((rule)=>{

                _setRule(
                    rule.filterCode,
                    rule.minimizedAuxiliaryInformation,
                    rule.triggerName,
                    rule.actuatorName,
                    rule.periodInMs,
                );

            })

            console.log('Tap Init : End');
            resolve();
        })
    }

    let initPromise = new Promise(async (resolve)=>{
        await init();
        console.log(triggers);
        console.log(actuators);
        console.log(rulesObject);
        resolve();
    });

    const deleteAllDB = async ()=>{
        await servicesCollection.deleteMany({});
        await rulesCollection.deleteMany({});
    }

    /*
    serviceType : trigger | actuator
    serviceApiCallMethodsCode : a JavaScript containing the definition of server methods
    */
    const _registerService = (serviceName, serviceType, serviceApiCallMethodsCode)=>{
        
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

    const registerService = async (
        serviceName,
        serviceType,
        serviceApiCallMethodsCode
    )=>{
      
        console.log('register service');

        await initPromise;
        
        _registerService(
            serviceName,
            serviceType,
            serviceApiCallMethodsCode
        );

        // create a filter for a service to update
        const filter = {
            serviceName: serviceName,
            serviceType : serviceType,
        };
        
        // this option instructs the method to create a document if no documents match the filter
        const options = { upsert: true };

        // create a document that sets the doc
        const updateDoc = {
            $set: {
                serviceName : serviceName,
                serviceType : serviceType,
                serviceApiCallMethodsCode : serviceApiCallMethodsCode,
            },
        };
        await servicesCollection.updateOne(filter, updateDoc, options);

    }

    const deleteService = async (serviceName)=>{

        await initPromise;

        if(triggers[serviceName]){
            delete triggers[serviceName]
        }else if(actuators[serviceName]){
            delete actuators[serviceName];
        }

        await servicesCollection.deleteOne({serviceName: serviceName});

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

    const _setRule = (
        filterCode,
        minimizedAuxiliaryInformation,
        triggerName,
        actuatorName,
        periodInMs
    )=>{

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

        rulesObject[id] = {
            filterCode : filterCode,
            minimizedAuxiliaryInformation : minimizedAuxiliaryInformation,
            triggerName : triggerName,
            actuatorName : actuatorName,
            periodInMs : periodInMs,
        }

    };

    const setRule = async (
        filterCode,
        minimizedAuxiliaryInformation,
        triggerName,
        actuatorName,
        periodInMs
    )=>{

        await initPromise;

        _setRule(
            filterCode,
            minimizedAuxiliaryInformation,
            triggerName,
            actuatorName,
            periodInMs
        );

        // create a filter for a service to update
        const filter = {
            filterCode: filterCode,
            triggerName : triggerName,
            actuatorName : actuatorName,
        };
        
        // this option instructs the method to create a document if no documents match the filter
        const options = { upsert: true };

        // create a document that sets the doc
        const updateDoc = {
            $set: {
                filterCode : filterCode,
                minimizedAuxiliaryInformation : minimizedAuxiliaryInformation,
                triggerName : triggerName,
                actuatorName : actuatorName,
                periodInMs : periodInMs,
            },
        };
        await rulesCollection.updateOne(filter, updateDoc, options);

    }

    const deleteRule = async (ruleID)=>{

        await initPromise;

        if(rules[ruleID]){
            rules[ruleID].stop();

            const ruleObj = rulesObject[ruleID];

            await servicesCollection.deleteOne({
                filterCode: ruleObj.filterCode,
                triggerName : ruleObj.triggerName,
                actuatorName : ruleObj.triggerName,
            });

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