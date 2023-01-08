//MANIFEST.js
//l'objet dataArray est la reponse en JSON à la requete contenant r' vers le filtre

const API_URL = "127.0.0.1:4000";

class service {
  constructor() {
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

let myService = new service();
