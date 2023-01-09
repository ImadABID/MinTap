
console.log("executing extension");

const sendRuleContainer = document.getElementById('send_rule_container');

const sendRuleContainerDoc = new DOMParser().parseFromString(sendRuleContainer.outerHTML, "text/xml");

const sendRuleElement = sendRuleContainerDoc.getElementById('send_rule');
sendRuleElement.setAttribute("onclick","console.log('MinTap')");

sendRuleElement.innerHTML = "Add MinTap compatible rule"

sendRuleContainer.innerHTML = sendRuleContainerDoc.getElementById('send_rule').outerHTML;

const sendRule = () => {
    
    var rule = document.getElementById("transformed_rule").value;
    var name = document.getElementById("rule_name").value;
    var service = document.getElementById("service_name").value;
    var trigger = document.getElementById("trigger_name").value;
    let data = {
        'name': name,
        'filterCode': rule,
        'triggerName': trigger,
        'actuatorName': service,
        'periodInMs': '10000',
    };
    console.log(data)

    hidden = name.match(/^[^a-zA-Z0-9]+$/) ? false : true;
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
        }
        else {
        alert("this name already exist");
        }

    })
    }
}