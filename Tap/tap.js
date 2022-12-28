const ruleClosure = (ruleID, filterCode, periodInMs)=>{
    let intervalID = null;
    let filerCodeFunction = new Function(filterCode);

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
        filerCodeFunction = new Function(filterCode);
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
    const rules = {};

    const getNewID = ()=>{
        lastId++;
        return lastId.toString();
    }

    const setRule = (filterCode, periodInMs = 10000)=>{
        let id = getNewID();
        rules[id] = ruleClosure(id, filterCode, periodInMs);
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
        setRule : setRule,
        editRule : editRule,
        editRulePeriod : editRulePeriod,
        deleteRule : deleteRule
    }
}

const tap = tapClosure();
module.exports.tap = tap;