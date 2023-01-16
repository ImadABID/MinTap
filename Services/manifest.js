//MANIFEST.js
//l'objet dataArray est la reponse en JSON à la requete contenant r' vers le filtre
const API_URL = "127.0.0.1:5000";

// Only for trigger manifest
let dataArray = {
  "service.lastMail.author" : null,
  "service.lastMail.content" : null,
  "service.lastMail.subject" : null,
  "service.roomTemperature" : null,
}

// Only for trigger manifest
const getTriggerData = function(askedFields, properties){

      let ruleCode = null;
      if (!properties.minimizedAuxiliaryInformation) ruleCode = properties.minimizedAuxiliaryInformation.transformedFilterCode;

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
        return dataArray["service.lastMail.author"];
      },
      get content(){
        return dataArray["service.lastMail.content"];
      },
      get subject(){
        return dataArray["service.lastMail.subject"];
      }
    };
  }

  get roomTemperature(){
    return dataArray["service.roomTemperature"] ;
  }

  push_notification(){
    fetch(`http://${API_URL}/actions/push_notification`, {method: 'POST'});
  }
}
