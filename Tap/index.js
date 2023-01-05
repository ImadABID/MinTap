const bodyParser = require("body-parser");
const { exec } = require("child_process");

const express = require("express");

const tap = require('./tap').tap;

var app = express();
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  console.log("here")
})

app.get('/rule_editor', (req, res) => {
  res.sendFile(__dirname + '/rule_editor.html')
})

app.post('/add_rule', (req, res) => {
  let ruleID = tap.setRule(req.body.name,
    req.body.filterCode,
    req.body.minimizedAuxiliaryInformation,
    req.body.triggerName,
    req.body.actuatorName,
    req.body.periodInMs
  );
  console.log(req.body);
  res.send({ msg: 'rule saved' });
})
app.post('/edit_rule', (req, res) => {

  tap.deleteRule(req.body._id)

  let ruleID = tap.setRule(req.body.name,
    req.body.filterCode,
    req.body.minimizedAuxiliaryInformation,
    req.body.triggerName,
    req.body.actuatorName,
    req.body.periodInMs
  );
  res.json({ msg: 'rule updated' });
  console.log(req.body.rule + " ==> updated")

});

app.post('/edit_service', (req, res) => {

  tap.deleteService(req.body._id)
  let serviceID = tap.registerService(req.body.serviceName, req.body.serviceType, req.body.serviceApiCallMethodsCode);


  res.json({ msg: 'service updated' });
  console.log(req.body._id + " ==> updated")

});

app.post('/add_service', (req, res) => {
  let serviceID = tap.registerService(req.body.serviceName, req.body.serviceType, req.body.serviceApiCallMethodsCode);
  console.log(req.body);
  res.send({ msg: 'rule saved' });
})
app.get('/rule_delete', (req, res) => {

  tap.deleteRule(req.query._id);
  res.redirect("/")


});

app.get('/service_delete', (req, res) => {

  tap.deleteService(req.query._id);
  res.redirect("/")


});
app.get('/debug', (req, res) => {
  res.sendFile(__dirname + '/index_debug.html')
})
app.get('/rule_transformer.js', (req, res) => {
  res.sendFile(__dirname + '/rule_transformer.js')
})

app.get('/rule_add', (req, res) => {
  res.sendFile(__dirname + '/public/rule_add.html')
})
app.get('/service_add', (req, res) => {
  res.sendFile(__dirname + '/public/service_add.html')
})
app.get('/rule_edit', (req, res) => {
  res.sendFile(__dirname + '/public/rule_edit.html')
})
app.get('/service_edit', (req, res) => {
  res.sendFile(__dirname + '/public/service_edit.html')
})
app.post('/post_filter_code', (req, res) => {

  console.log(req.body.filter_code);
  res.sendFile(__dirname + '/index.html')
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080 !`));