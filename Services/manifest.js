//MANIFEST.js
//l'objet dataArray est la reponse en JSON à la requete contenant r' vers le filtre
const API_URL = "127.0.0.1:5000";

// Only for trigger manifest
let dataArray = {
  "lastMail.author" : null,
  "lastMail.content" : null,
  "lastMail.subject" : null,
  "roomTemperature" : null,
}

// Only for trigger manifest
const getTriggerData = function(askedFields, properties){
      let ruleCode = properties.minimizedAuxiliaryInformation.transformedFilterCode ?? null;

      fetch(`http://${API_URL}/filter`, {
      method: 'POST',
      body: JSON.stringify({
        fields: askedFields,
        ruleCode: ruleCode
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(function(json){
        dataArray = json;
      }).catch(err => console.error(err));
}

class serviceClass {
  constructor(
    askedFields,
    properties = null
  ) {

    getTriggerData(
      askedFields,
      properties
    );

    this.lastMail = {
      get author(){
        return dataArray["lastMail.author"];
      },
      get content(){
        return dataArray["lastMail.content"];
      },
      get subject(){
        return dataArray["lastMail.subject"];
      }
    };
  }

  get roomTemperature(){
    return dataArray["roomTemperature"] ;
  }

  push_notification(){
    fetch(`http://${API_URL}/actions/push_notification`);
  }
}
