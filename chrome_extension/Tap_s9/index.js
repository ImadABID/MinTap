const {exec} = require("child_process") ; 
 
const express = require("express");


var app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
    console.log("here")
 })


app.post('/post_filter_code', (req, res) => {
    
    console.log(req.body.filter_code);
    res.sendFile(__dirname + '/index.html')
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080 !`));