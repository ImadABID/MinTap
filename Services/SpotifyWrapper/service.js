const express = require("express");
const bodyParser = require("body-parser");

const getTriggerData = async (askedFields)=>{

}

const app = express();
app.use(bodyParser.json());

app.post('/tap', (req, res)=>{

})

const port = 3006;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})