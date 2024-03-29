const syncRequest = require('sync-request');

const API_URL = "127.0.0.1:4000";
exports.dataArray = {};

function requestURL(url){
  try {
    let res = syncRequest('GET', url, {encoding: 'utf8', timeout: 1000});
    return res.getBody().toString();
  } catch (err) {
    return -1;
  }
}

exports.Service = class Service {
  constructor() {
    this.lastMail = {
      get author(){
        let res = requestURL(`http://${API_URL}/triggers/lastMail/author`);
        exports.dataArray["service.lastMail.author"] = res;
        return res;
      },
      get content(){
        let res = requestURL(`http://${API_URL}/triggers/lastMail/content`);
        exports.dataArray["service.lastMail.content"] = res;
        return res;
      },
      get subject(){
        let res = requestURL(`http://${API_URL}/triggers/lastMail/subject`);
        exports.dataArray["service.lastMail.subject"] = res;
        return res;
      },
    }
  }

  get roomTemperature(){
    let res = requestURL(`http://${API_URL}/triggers/roomTemperature`);
    exports.dataArray["service.roomTemperature"] = res;
    return res;
  }

  get seconds(){
    let res = requestURL(`http://${API_URL}/triggers/seconds`);
    exports.dataArray["service.seconds"] = res;
    return res;
  }


  push_notification(){
    //nothing
  }
}
