const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 4000;

app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`minTAP service running on port ${port}`)
});

let lastMail = {
    "timestamp" : "1638139032",
    "author": "john.deer@localhost",
    "subject": "debugging",
    "content": "is this service working ?"
};

app.get('/', (req, res) => {
  res.send({'message': 'hello world'});
});



//TRIGGERS
app.get('/triggers/:trigger_slug', (req, res) => {

  let slug = req.params.trigger_slug;

  if(slug == "last_mail"){
    res.send(lastMail);
    return;
  }

  if(slug == "room_temperature"){
    res.send({
      'timestamp': Math.floor(Date.now()/1000),
      'temperature': (Math.random()*10 + 10).toFixed(1)
    });
    return;
  }

  res.status(404).send({'error': '404 slug not found'});
});


//ACTIONS
app.post('/actions/:action_slug', (req, res) => {

  let slug = req.params.action_slug;

  if(slug == "push_notification"){
    console.log("PUSH NOTIFICATION");
    console.log('\u0007');
    res.status(200).send();
    return;
  }

  if(slug == "new_mail"){
    lastMail.author = req.body.author;
    lastMail.subject = req.body.subject;
    lastMail.content = req.body.content;
    lastMail.timestamp = Math.floor(Date.now()/1000);
    res.send(lastMail);
    return;
  }

  res.status(404).send({'error': 'an error occured'});
});
