const bodyParser = require("body-parser");
const {exec} = require("child_process") ; 
 
const express = require("express");


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
    console.log(req.body);
    res.send({msg : 'rule saved'});
})

app.get('/debug', (req, res) => {
    res.sendFile(__dirname + '/index_debug.html')
})
app.get('/rule_transformer.js', (req, res) => {
    res.sendFile(__dirname + '/rule_transformer.js')
})


app.post('/post_filter_code', (req, res) => {
    
    console.log(req.body.filter_code);
    res.sendFile(__dirname + '/index.html')
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080 !`));