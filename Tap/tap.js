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

            console.log('Tap Init : End');
            resolve();
        })
    }

    let initPromise = new Promise(async (resolve)=>{
        await init();
        console.log(triggers);
        console.log(actuators);
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

        // servicesCollection.insertOne({
        //     serviceName : serviceName,
        //     serviceType : serviceType,
        //     serviceApiCallMethodsCode : serviceApiCallMethodsCode,
        // });

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

        console.log('doc inserted');

    }

    const deleteService = async (serviceName)=>{

        await initPromise;

        await servicesCollection.deleteOne({serviceName: serviceName});

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