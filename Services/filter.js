const syncRequest = require('sync-request');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 5000;

app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`filter running on port ${port}`)
});

//BARRIER
app.post('/filter', (req, res) => {

    let ruleCode = `
      if(myService.lastMail.author == "john.deer@localhost"){
        if(myService.lastMail.content.includes("hello world")){
          console.log("heho");
        }
      }
    `;//req.body.ruleCode;
    let dataArray = {};


    function requestURL(url){
      try {
        let res = syncRequest('GET', url, {encoding: 'utf8', timeout: 1000});
        return res.getBody().toString();
      } catch (err) {
        return -1;
      }
    }

    //MANIFEST
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
    //END MANIFEST


    eval(ruleCode);



    res.status(200).send(dataArray);

});
