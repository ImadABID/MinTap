const express = require('express')
const bodyParser = require('body-parser');
const manifest = require("./manifest_filter");
import fetch from "node-fetch";

const app = express()
const port = 5000;

app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`filter running on port ${port}`)
});

//BARRIER
app.get('/filter', (req, res) => {
    let ruleCode = `
      if(myService.lastMail.author == "john.deer@localhost"){
        if(myService.lastMail.content.includes("hello world")){
          //ee
        }
      }
    `;
    let myService = new manifest.Service();

    eval(ruleCode);
    res.status(200).send(manifest.dataArray);
});

app.post('/filter', (req, res) => {

    console.log(req.body);

    let ruleCode = req.body.ruleCode;
    if(ruleCode != null){
      eval(ruleCode);
    } else {
      let fields = req.body.fields;
      if(fields != null){
        fields.forEach((field) => {eval(field)});
      }
    }

    let myService = new manifest.Service();
    console.log(manifest.dataArray);
    res.status(200).send(manifest.dataArray);
});
