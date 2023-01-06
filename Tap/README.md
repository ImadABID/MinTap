# MinTap

## Tap

A TAP server mimicking real TAPs like IFTTT.

## Introduction

A TAP communicates with those components:
1. Triggers
2. Actuators
3. The web interface for creating/editing/deleting rules
4. The debug user interface

For that reason, we define in this document an API specification for each component.

This document presents :
1. HTTP request headers and format
2. The main objects used across all APIs
    - filterCode
    - minimizedAuxiliaryInformation
    - minimizedTriggerData
3. The TAP's business logic
4. Web interface API
5. Debug user interface API

## 1 - HTTP request headers and format

All http requests must respect the following convention presented in JavaScript code example :

    let reqObj = {'data': 'ok'};
    fetch(
        './add_rule',
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
            'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(reqObj)
        }
    ).then(resjs => resjs.json()).then((resObj) => {
        console.log(resObj.msg);
    })

The data object can be retrieved in nodeJS by using the following code :

    app.post('/add_rule', (req, res) => {
        let reqObj = req.body
        let resObj = {msg : 'rule saved'}
        // Displaying the data object
        console.log(reqObj);
        res.send(resObj);
    })

Note that in the rest of this documentation only the reqObj and resObj are going to be presented for API calls.

## 2 - The main objects used across all APIs

### filterCode :

It is a JavaScript code edited by the user when setting up a rule. It must be a String.

### minimizedAuxiliaryInformation :

    <!-- minimizedAuxiliaryInformation -->
    {
        transformedFilterCode : String,
        dependencySet : Array<String>
        signature : String
    }

- transformedFilterCode : The filter code transformed by the chrome extension.
- dependencySet : The list of static required fields computed by the chrome extension.
- signature : Not used for the moment. It can be an empty String.

### minimizedTriggerData :

    <!-- minimizedTriggerData -->
    {
        "field 1" : "value 1",
        "field 2" : "value 2",
        "field 3" : null
    }

This object is the response of a trigger to the TAP. If a field is not required, it return null as a value.

## The TAP's business logic  :

The tap object is the business logic of the tap application. Its responsible for :
- Registering triggers and actuators.
- Creating/editing/deleting rules.
- Executing rules periodically.
- Giving information to the debug user interface.

Its implementation is done in "tap.js" and it is imported in "index.js" using this line of code :

    const tap = require('./tap').tap;

### Registering triggers and actuators :

To register a service which can be a trigger or an actuator, use the following method :

    await tap.registerService(
        serviceName,
        serviceType,
        serviceApiCallMethodsCode
    )

* serviceName : It's the name given to the service. It must be unique. If call this method multiple times with the same serviceName, the service will be registered once according to the last call.
* serviceType : It takes "trigger" or "actuator".
* serviceApiCallMethodsCode : It's the JavaScript code as a String defining and implementing the methods that can be used in the filter code for this service.

For deleting a service use :

    await tap.deleteService(serviceName)

Getting service names :

    await tap.getServiceNames()

Returns :

    {
        "triggerNames" : ["trigger", "names", ...],
        "actuatorsNames" : ["actuator", "names", ...],
    }

### Creating/editing/deleting rules :

To preform this task, the tap object offers the following methods :

    await tap.setRule(
        filterCode,
        minimizedAuxiliaryInformation,
        triggerName,
        actuatorName,
        periodInMs = 10000
    )

This function takes a filterCode and returns an ID of the created rule.

* filterCode : It's the JavaScript code as a String that represents the filter code.
* minimizedAuxiliaryInformation : As described in section 2.
* triggerName : the trigger name as registered in tap.registerService().
* actuatorName : the actuator name as registered in tap.registerService().
* periodInMs : it's an optional parameter that defines the period in milliseconds between two rule executions. By default it takes 10 seconds.

To edit the rule execution period, use :

    await tap.editRulePeriod(periodInMs, ruleID)

To edit the rule, use :

    await tap.editRule(filterCode, ruleID)

This function takes a filterCode and a rule and returns nothing.

    await tap.deleteRule(ruleID)

This function takes a filterCode and returns an ID as an int of the created rule.

### Executing rules periodically :

This functionality  is done automatically by the tap object ;
- It starts executing the rule once added.
- At rule edition, it restart its execution.
- At rule deletion, it stops its execution.

### Giving information to the debug user interface :

Not yet implemented.

## 5 - Web interface API

TODO : by Aymen.

## 6 - Debug user interface API

TODO : by Imad & Hicham.