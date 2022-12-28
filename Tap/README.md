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
    - tap
3. Trigger API
4. Actuators API
5. Web interface API
6. Debug user interface API

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

### tap :

This object is the business logic of the tap application.

Its implementation is done in "tap.js" and it is imported in "index.js"

It has the following methods :

    tap.setRule(filterCode, periodInMs = 10000)

This function takes a filterCode and returns an ID of the created rule.

periodInMs is an optional parameter that defines the period in milliseconds between two rule executions. By default it takes 10 seconds. To edit it use the following function :

    tap.editRulePeriod(periodInMs, ruleID)

To edit the rule use :

    tap.editRule(filterCode, ruleID)

This function takes a filterCode and a rule and returns nothing.

    tap.deleteRule(ruleID)

This function takes a filterCode and returns an ID as an int of the created rule.

Other functions are going to be added for the debug part.

## 3 - Trigger API
A compatible trigger with our tap's API must have the flowing route :

    /tap/get_info

The request object :

    <!-- /tap/get_info reqObj-->
    {
        minimizedAuxiliaryInformation : {},
    }

The respond object :

    <!-- /tap/get_info resObj-->
    {
        minimizedAuxiliaryInformation : {},
    }

The respond object :

    <!-- /tap/get_info resObj-->
    {
        minimizedTriggerData : {}
    }

## 4 - Actuators API
A compatible actuator with our tap's API must have the flowing route :

    /tap/act

The request object :

    <!-- /tap/act reqObj-->
    {
        actionMethodName : String,
        actionMethodParamsList : Array
    }

The respond object :

    <!-- /tap/act resObj-->
    {
        message : String
    }

## 5 - Web interface API

TODO : by Aymen.

## 6 - Debug user interface API

TODO : by Imad & Hicham.