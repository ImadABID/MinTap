function sendMinTapCompatibleRule(){
        
    const rule = document.getElementById("transformed_rule").value;
    const name = document.getElementById("rule_name").value;
    const actuator = document.getElementById("service_name").value;
    const trigger = document.getElementById("trigger_name").value;

    const minimizedAuxiliaryInformation = ruleTransformer(rule, trigger, actuator);

    const data = {
        'name': name,
        'filterCode': rule,
        'triggerName': trigger,
        'actuatorName': actuator,
        'periodInMs': '10000',
        'properties' : {
            'minimizedAuxiliaryInformation' : minimizedAuxiliaryInformation,
        },
    };

    let hidden = name.match(/^[^a-zA-Z0-9]+$/) ? false : true;
    console.log(hidden);
    if (hidden) {
        fetch(
            '/add_rule',
            {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                'Content-Type': 'application/json'
                //'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            }
        ).then(resjs => resjs.json()).then((res) => {
            if (res.msg == 'rule saved') {
                window.location.replace("/");
            }else{
                alert("this name already exist");
            }

        })
    }else{
        text = document.getElementById('text')
        text.setAttribute('style', "margin: 10px; color: tomato; visibility :visible;")
    }
}



const sendRuleButton = document.getElementById('send_rule');

const newSendRuleButton = document.createElement('div');
newSendRuleButton.setAttribute('id', 'send_MinTap_rule');
newSendRuleButton.setAttribute('class', sendRuleButton.getAttribute('class'));
newSendRuleButton.setAttribute('style', sendRuleButton.getAttribute('style'));
newSendRuleButton.addEventListener('click', sendMinTapCompatibleRule);
newSendRuleButton.innerHTML = 'Add MinTap compatible rule';

const sendRuleContainer = document.getElementById('send_rule_container');
sendRuleContainer.appendChild(newSendRuleButton);

sendRuleButton.outerHTML = '';