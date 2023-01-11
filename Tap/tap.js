const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient('mongodb://localhost:27017/');
const tapDB = mongoClient.db('tap');

const ruleClosure = (
    ruleID,
    filterCode,
    triggerApiCallMethodsCode,
    actuatorApiCallMethodsCode,
    ingredients,
    periodInMs,
    properties
)=>{

    let intervalID = null;

    let filerCodeFunction = new Function(
        triggerApiCallMethodsCode   + '\n' +
        actuatorApiCallMethodsCode  + '\n' +
        // getTriggerData(ingredients, properties)
        filterCode
    );

    const start = ()=>{
        if(intervalID != null){
            console.log(`rule #${ruleID} is already started and cannot be started again.`)
        }else{

            intervalID = setInterval(
                ()=>{

                    try{ 
                        console.log(`rule #${ruleID} : executing rule`);
                        filerCodeFunction();
                    }catch(err){
                        if(intervalID){
                            clearInterval(intervalID);
                        }
                        intervalID = null;
                        console.log(err);
                    }
                },
                parseInt(periodInMs)
            );

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

const tapClosure = ()=>{
    
    let lastId = 0;
    
    const triggers = {};
    const actuators = {};
    const rules = {};

    // Used to store data fields that the user specified at the set up
    // and are not necessary for rule execution
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
                    rule.ruleName,
                    rule.filterCode,
                    rule.triggerName,
                    rule.actuatorName,
                    rule.ingredients,
                    rule.periodInMs,
                    rule.properties
                );

            })

            console.log('Tap Init : End');
            resolve();
        })
    }

    const deleteAllDB = async ()=>{
        await servicesCollection.deleteMany({});
        await rulesCollection.deleteMany({});
    }

    let initPromise = new Promise(async (resolve)=>{
        await deleteAllDB();
        await init();
        resolve();
    });

    const _getTriggerIngredientsFromManifest = (manifest)=>{
        
        const manifestFunc = new Function(
            manifest + 'return Object.keys(dataArray);'
        )
        
        return manifestFunc();
    }

    /*
    serviceType : trigger | actuator
    serviceApiCallMethodsCode : a JavaScript containing the definition of server methods
    */
    const _registerService = (serviceName, serviceType, serviceApiCallMethodsCode)=>{

        switch(serviceType){
            case 'trigger':

                triggers[serviceName] = {
                    ingredients : _getTriggerIngredientsFromManifest(serviceApiCallMethodsCode),
                    serviceApiCallMethodsCode : serviceApiCallMethodsCode,
                }

                console.log(`registering a trigger with the name ${serviceName}`);
                console.log(triggers[serviceName])

                break;
            case 'actuator':
                actuators[serviceName] = {
                    serviceApiCallMethodsCode : serviceApiCallMethodsCode,
                }
                break;
            default :
                correctType =  false;
                console.log("Unknown service type.");
                break; 
        }

    }

    const getAllServices = async ()=>{

        await initPromise;

        const services = []


        Object.keys(triggers).forEach((triggerName)=>{
            services.push({
                'serviceName' : triggerName,
                'serviceType': 'trigger',
                'ingredients': triggers[triggerName].ingredients,
                'serviceApiCallMethodsCode' : triggers[triggerName].serviceApiCallMethodsCode,
            })
        })

        Object.keys(actuators).forEach((actuatorName)=>{
            services.push({
                'serviceName' : actuatorName,
                'serviceType': 'actuator',
                'serviceApiCallMethodsCode' : actuators[actuatorName].serviceApiCallMethodsCode,
            })
        })

        return services;

    }

    const getServiceByName = async (name)=>{

        await initPromise;
        
        if(triggers[name]){
            return {
                'serviceName' : name,
                'serviceType': 'trigger',
                'serviceApiCallMethodsCode' : triggers[name].serviceApiCallMethodsCode, 
            }
        }

        if(actuators[name]){
            return {
                'serviceName' : name,
                'serviceType': 'actuator',
                'serviceApiCallMethodsCode' : actuators[name].serviceApiCallMethodsCode, 
            }
        }

        console.log('getServiceByName : Service not found');
        return null;

    }

    const getServiceNames = async ()=>{

        await initPromise;

        const servicesNames = {
            "triggerNames" : Object.keys(triggers),
            "actuatorsNames" : Object.keys(actuators),
        }

        return servicesNames;

    }

    const registerService = async (
        serviceName,
        serviceType,
        serviceApiCallMethodsCode
    )=>{

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

    const getNewRuleID = ()=>{
        lastId++;
        return lastId.toString();
    }

    const getAllRules = async ()=>{
        
        await initPromise;

        const rulesArray = [];

        Object.keys(rulesObject).forEach((ruleID)=>{
            rulesArray.push({
                _id : ruleID,
                name : rulesObject[ruleID].ruleName,
                filterCode : rulesObject[ruleID].filterCode,
                triggerName : rulesObject[ruleID].triggerName,
                actuatorName : rulesObject[ruleID].actuatorName,
                ingredients : rulesObject[ruleID].ingredients,
                periodInMs : rulesObject[ruleID].periodInMs,
                properties : rulesObject[ruleID].properties
            })
        });

        return rulesArray;
    }

    const getRuleByID = async (id)=>{
    
        await initPromise;
        
        const ruleObject = {}

        if(rulesObject[id]){

            ruleObject['_id'] = id;
            ruleObject['name'] = rulesObject[id].ruleName;
            ruleObject['filterCode'] = rulesObject[id].filterCode;
            ruleObject['triggerName'] = rulesObject[id].triggerName;
            ruleObject['actuatorName'] = rulesObject[id].actuatorName;
            ruleObject['ingredients'] = rulesObject[id].ingredients;
            ruleObject['periodInMs'] = rulesObject[id].periodInMs;
            ruleObject['properties'] = rulesObject[id].properties;

            return ruleObject;
        }

        console.log('getRuleByID : Rule not found');
        return null;

    }

    const _setRule = (
        ruleName,
        filterCode,
        triggerName,
        actuatorName,
        ingredients,
        periodInMs,
        properties
    )=>{

        let id = getNewRuleID();
        let triggerApiCallMethodsCode;
        let actuatorApiCallMethodsCode;

        if(triggers[triggerName]){
            triggerApiCallMethodsCode = triggers[triggerName].serviceApiCallMethodsCode;
        }else{
            console.log("setRule : Unknown trigger name");
        }

        if(actuators[actuatorName]){
            actuatorApiCallMethodsCode = actuators[actuatorName].serviceApiCallMethodsCode;
        }else{
            console.log("setRule : Unknown actuator name");
        }

        rules[id] = ruleClosure(
            id,
            filterCode,
            triggerApiCallMethodsCode,
            actuatorApiCallMethodsCode,
            ingredients,
            periodInMs,
            properties
        );

        rules[id].start();

        rulesObject[id] = {
            ruleName : ruleName,
            filterCode : filterCode,
            triggerName : triggerName,
            actuatorName : actuatorName,
            ingredients : ingredients,
            periodInMs : periodInMs,
            properties : properties,
        }

        return id;

    };

    const setRule = async (
        ruleName,
        filterCode,
        triggerName,
        actuatorName,
        ingredients,
        periodInMs,
        properties
    )=>{

        await initPromise;

        const ruleID = _setRule(
            ruleName,
            filterCode,
            triggerName,
            actuatorName,
            ingredients,
            periodInMs,
            properties
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
                ruleName : ruleName,
                filterCode : filterCode,
                triggerName : triggerName,
                actuatorName : actuatorName,
                ingredients : ingredients,
                periodInMs : periodInMs,
                properties : properties,
            },
        };
        await rulesCollection.updateOne(filter, updateDoc, options);

        return ruleID;
    }

    const _editRule = (
        ruleID,
        ruleName,
        filterCode,
        triggerName,
        actuatorName,
        ingredients,
        periodInMs,
        properties
    )=>{

        let triggerApiCallMethodsCode;
        let actuatorApiCallMethodsCode;

        if(triggers[triggerName]){
            triggerApiCallMethodsCode = triggers[triggerName].serviceApiCallMethodsCode;
        }else{
            console.log("editRule : Unknown trigger name");
        }

        if(actuators[actuatorName]){
            actuatorApiCallMethodsCode = actuators[actuatorName].serviceApiCallMethodsCode;
        }else{
            console.log("editRule : Unknown actuator name");
        }

        if(rules[ruleID]){

            rules[ruleID].stop();
            delete rules[ruleID];

            rules[ruleID] = ruleClosure(
                ruleID,
                filterCode,
                triggerApiCallMethodsCode,
                actuatorApiCallMethodsCode,
                ingredients,
                periodInMs,
                properties
            );
    
            rules[ruleID].start();
    
            rulesObject[ruleID] = {
                ruleName : ruleName,
                filterCode : filterCode,
                triggerName : triggerName,
                actuatorName : actuatorName,
                ingredients : ingredients,
                periodInMs : periodInMs,
                properties : properties
            }

        }else{
            console.log("editRule : Unknown rule ID");
        }

    };

    const editRule = async (
        ruleId,
        ruleName,
        filterCode,
        triggerName,
        actuatorName,
        ingredients,
        periodInMs,
        properties
    )=>{

        await initPromise;

        if(!rulesObject[ruleId]){
            return ;
        }


        // create a filter for a service to update
        const filter = {
            filterCode: rulesObject[ruleId].filterCode,
            triggerName : rulesObject[ruleId].triggerName,
            actuatorName : rulesObject[ruleId].actuatorName,
        };

        _editRule(
            ruleId,
            ruleName,
            filterCode,
            triggerName,
            actuatorName,
            ingredients,
            periodInMs,
            properties
        );
        
        // this option instructs the method to create a document if no documents match the filter
        const options = { upsert: true };

        // create a document that sets the doc
        const updateDoc = {
            $set: {
                ruleName : ruleName,
                filterCode : filterCode,
                triggerName : triggerName,
                actuatorName : actuatorName,
                ingredients : ingredients,
                periodInMs : periodInMs,
                properties : properties
            },
        };

        await rulesCollection.updateOne(filter, updateDoc, options);

    }

    const deleteRule = async (ruleID)=>{

        await initPromise;

        if(rules[ruleID]){
            rules[ruleID].stop();
            delete rules[ruleID];

            await rulesCollection.deleteOne({
                filterCode: rulesObject[ruleID].filterCode,
                triggerName : rulesObject[ruleID].triggerName,
                actuatorName : rulesObject[ruleID].actuatorName,
            });

            delete rulesObject[ruleID];

        }else{
            console.log('deleteRule : ruleID not found');
        }

    }

    return {
        getServiceByName : getServiceByName,
        getAllServices : getAllServices,
        getServiceNames : getServiceNames,
        registerService : registerService,
        deleteService : deleteService,
        getRuleByID : getRuleByID,
        getAllRules : getAllRules,
        setRule : setRule,
        editRule : editRule,
        deleteRule : deleteRule
    }
}

const tap = tapClosure();

// register default services
tap.registerService(
    "RandomIntGenerator",
    "trigger",
    `
        // define ingredient & minimizedAuxiliaryInformation

        const dataArray = {
            "RandomIntGenerator.getRandomInt" : null,
        }

        const getTriggerData = (
            askedFields,
            minimizedAuxiliaryInformation = null
        )=>{
            dataArray['RandomIntGenerator.getRandomInt'] = Math.floor(Math.random() * 100);
        }

        class RandomIntGeneratorClass{
            constructor(
                askedFields,
                minimizedAuxiliaryInformation = null
            ){
                getTriggerData(
                    askedFields,
                    minimizedAuxiliaryInformation = null
                )
            }

            get getRandomInt(){
                return dataArray['RandomIntGenerator.getRandomInt'];
            }
        }

        // let RandomIntGenerator = new RandomIntGeneratorClass([]);
    `
);

tap.registerService(
    "MessageLogger",
    "actuator",
    `
        const MessageLogger = {};
        MessageLogger.log = (msg)=>{console.log(msg)};
    `
);

module.exports.tap = tap;