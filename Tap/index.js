const bodyParser = require("body-parser");
const { query } = require("express");
var ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const express = require("express");
var app = express();
const url = 'mongodb://localhost:27017';
//app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
MongoClient.connect(url)
  // On commence par récupérer la collection que l'on va utiliser et la passer
  .then(function (client) {
    return client.db("filters");
  })
  .then((db) => {

    app.get('/get_filters', (req, res) => {
      db.collection("filters").find({}).toArray(async (err, filters) => {
        //console.log( filters );
        //res.json({ parking: parking });
        res.send({ filters: filters });
      })
      console.log("get_filters")
    })
    app.get('/get_filter', (req, res) => {
      console.log(req.query.name)
      db.collection("filters").findOne(
        { "name": req.query.name },
        (err, cl) => {
          res.send(cl);

        });
      //res.json({ parking: parking });
    })
    app.post('/edit_rule', (req, res) => {

      db.collection("filters").updateOne({ "_id": ObjectId(req.body._id) }, {
        $set: {
          "name": req.body.name,
          "filterCode": req.body.filterCode,
          "triggerName": req.body.triggerName,
          "actuatorName": req.body.actuatorName,
          "periodInMs": req.body.periodInMs,
        }
      }, (insertOne_err, insertOne_res) => {
        if (insertOne_err) {
          console.log(insertOne_err);
          res.json({ msg: 'Uknown problem' });
        } else {
          res.json({ msg: 'rule updated' });
          console.log(req.body.rule + " ==> updated")
        }
      });
    });
    app.get('/rule_delete', (req, res) => {
      db.collection("filters").deleteOne({ "_id": ObjectId(req.query._id) },
        (err, cl) => {

          if (err) {

          }
          else {
            res.redirect("/")
          }

        });

    });
    app.get('/drop_db', (req, res) => {
      //db.collection('users').drop();
      db.collection('filters').drop();
      res.send("drop_db");
    });
    app.post('/add_rule', (req, res) => {
      // console.log(req.body);
      filter = {};
      filter.name = req.body.name;
      filter.filterCode = req.body.filterCode;
      filter.triggerName = req.body.triggerName;
      filter.actuatorName = req.body.actuatorName;
      filter.periodInMs = req.body.periodInMs;
      db.collection("filters").findOne(
        { "name": req.body.name },
        (err, cl) => {
          if (cl) {
            res.send({ msg: 'name already used' });
          } else {
            db.collection("filters").insertOne(filter, (insertOne_err, insertOne_res) => {
              if (insertOne_err) {
                console.log(insertOne_err);
                res.send({ msg: 'Uknown problem' });
              } else {
                res.send({ msg: 'rule saved' });
                console.log(req.body.name + " ==> added")
              }
            });

          }
        }
      )
    })

  });


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html')
  console.log("here")
})
app.post('/minimisation', (req, res) => {
  console.log("here minimisation")
  console.log(req.body);
  console.log("to do your minimisation")
  res.redirect('/');

})
app.get('/debug', (req, res) => {
  res.sendFile(__dirname + '/public/index_debug.html')
})
app.get('/rule_transformer.js', (req, res) => {
  res.sendFile(__dirname + '/public/rule_transformer.js')
})
app.get('/rule_add', (req, res) => {
  res.sendFile(__dirname + '/public/rule_add.html')
})
app.get('/rule_edit', (req, res) => {
  res.sendFile(__dirname + '/public/rule_edit.html')
})

app.post('/post_filter_code', (req, res) => {

  console.log(req.body.filter_code);
  res.sendFile(__dirname + '/public/index.html')
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080 !`));