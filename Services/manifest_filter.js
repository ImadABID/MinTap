const API_URL = "127.0.0.1:4000";

class service {
  constructor() {
    this.lastMail = {
      get author(){
        let res = requestURL(`http://${API_URL}/triggers/lastMail/author`);
        dataArray["lastMail.author"] = res;
        return res;
      },
      get content(){
        let res = requestURL(`http://${API_URL}/triggers/lastMail/content`);
        dataArray["lastMail.content"] = res;
        return res;
      },
      get subject(){
        let res = requestURL(`http://${API_URL}/triggers/lastMail/subject`);
        dataArray["lastMail.subject"] = res;
        return res;
      },
    }
  }
  get roomTemperature(){
    let res = requestURL(`http://${API_URL}/triggers/roomTemperature`);
    dataArray["roomTemperature"] = res;
    return res;
  }
}
let myService = new service();
