const express = require("express");
const bodyParser = require("body-parser");

const server = require('websocket').server;
const http = require('http');

const tapModule = require('./tap');
const tap = tapModule.tap;
const logger = tapModule.logger;

const socket = new server({
  httpServer: http.createServer().listen(1337)
});

socket.on('request', function (request) {
  
  logger.addConsumer(
    request,
    ['general', `rule#${request.resourceURL.query.ruleID}`]
  );

});

const app = express();
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html')
})

app.get('/rule_editor', (req, res) => {
  res.sendFile(__dirname + '/rule_editor.html')
})
app.get('/get_filters', async (req, res) => {
  filters = await tap.getAllRules();
  for (let index = 0; index < filters.length; index++) {
    filters[index].status = tap.getRuleStatus(filters[index]._id);
  }
  res.send({ filters: filters });
})
app.get('/get_services', async (req, res) => {
  const services = await tap.getAllServices();
  res.send({ services: services });

})
app.get('/get_filter', async (req, res) => {
  cl = await tap.getRuleByID(req.query._id)
  res.send(cl);
})
app.get('/get_service', async (req, res) => {
  cl = await tap.getServiceByName(req.query.name)
  res.send(cl);

})
app.post('/add_rule', async (req, res) => {

  await tap.setRule(
    req.body.name,
    req.body.filterCode,
    req.body.triggerName,
    req.body.actuatorName,
    req.body.ingredients,
    req.body.periodInMs,
    req.body.properties
  );

  res.send({ msg: 'rule saved' });

})
app.post('/edit_rule', async (req, res) => {

  await tap.editRule(
    req.body._id,
    req.body.name,
    req.body.filterCode,
    req.body.triggerName,
    req.body.actuatorName,
    req.body.ingredients,
    req.body.periodInMs,
    req.body.properties
  )

  res.json({ msg: 'rule updated' });

});

app.post('/edit_service', async (req, res) => {

  await tap.deleteService(req.query.name)
  await tap.registerService(req.body.serviceName, req.body.serviceType, req.body.serviceApiCallMethodsCode);
  res.json({ msg: 'service updated' });

});

app.post('/add_service', async (req, res) => {
  let serviceID = await tap.registerService(req.body.serviceName, req.body.serviceType, req.body.serviceApiCallMethodsCode);
  console.log(req.body);
  res.send({ msg: 'service saved' });
})
app.get('/rule_delete', async (req, res) => {

  await tap.deleteRule(req.query._id);
  res.redirect("/")


});

app.get('/service_delete', async (req, res) => {

  await tap.deleteService(req.query.name);
  res.redirect("/")


});
app.get('/debug', (req, res) => {
  res.sendFile(__dirname + '/index_debug.html')
})
app.get('/rule_transformer.js', (req, res) => {
  res.sendFile(__dirname + '/rule_transformer.js')
})
app.get('/rule_debug', (req, res) => {
  res.sendFile(__dirname + '/public/debug.html')
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

const port = 8080;
app.listen(port, ()=>{
  logger.log('general', `Tap server listening at ${port}`);
});