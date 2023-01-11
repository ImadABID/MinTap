//MANIFEST.js
//l'objet dataArray est la reponse en JSON à la requete contenant r' vers le filtre

const API_URL = "127.0.0.1:4000";

// Only for trigger manifest
const dataArray = {
  "lastMail.author" : null,
  "lastMail.content" : null,
  "lastMail.subject" : null,
  "roomTemperature" : null,
}

// Only for trigger manifest
const getTriggerData = (
  
  askedFields,
  // A subset of Object.keys(dataArray)

  minimizedAuxiliaryInformation = null
  // Contains the transformed rule and more (See the tap doc). 
  // Optional and must be null for MinTap incompatible rules.

)=>{
  // To implements
  // Contains the fetch
  // Populates dataArray fields with asked values
}

class serviceClass {
  constructor(
    askedFields,
    minimizedAuxiliaryInformation = null
  ) {

    getTriggerData(
      askedFields,
      minimizedAuxiliaryInformation
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
    requestURL(`http://${API_URL}/actions/push_notification`);
    //definir une fonction "requestURL" de fetch qui tourne dans l'environnement du TAP
    //en async si possible
  }
}

// let service = new serviceClass([]);
