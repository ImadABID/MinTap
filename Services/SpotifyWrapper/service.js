const express = require("express");
const bodyParser = require("body-parser");

const getTriggerData = async (askedFields)=>{

}

let dataArray = {};

class SpotifyClass { 

    constructor(){

        // ------ Define the service object --------
        
        this.currentTrack = {
            get artistNames(){
                return dataArray["Spotify.currentTrack.artistNames"];
            },
            get trackDuration(){
                return dataArray["Spotify.currentTrack.trackDuration"];
            },
            get albumName(){
                return dataArray["Spotify.currentTrack.albumName"];
            },
            get Duration(){
                return dataArray["Spotify.currentTrack.releaseDate"];
            },
        };

        // -----------------------------------------

    }

    static async SpotifyClassFactory(
        askedFields
    ){

        // Only for trigger manifest
        // ------ Type here the code that populates dataArray --------

        dataArray = await getTriggerData(askedFields);

        // -----------------------------------------------------------

    }

}

const app = express();
app.use(bodyParser.json());

app.post('/tap', (req, res)=>{

    const askedFields = req.body.askedFields;
    const minimizedAuxiliaryInformation = null;
    if(req.body.properties && req.body.properties.minimizedAuxiliaryInformation){
        minimizedAuxiliaryInformation = req.body.properties.minimizedAuxiliaryInformation;
    }

    const responseData = {};

    const SpotifyClass = SpotifyClass.SpotifyClassFactory(askedFields);

    if(minimizedAuxiliaryInformation){
    
        eval(minimizedAuxiliaryInformation.transformedFilterCode);

        const accessedFields = getAccessedFields();

        askedFields.forEach((field) => {
            if(dataArray[field] && accessedFields.includes(field)){
                responseData[field] = dataArray[field];
            }else{
                responseData[field] = "#Filtered";
            }
        });

    }else{
        askedFields.forEach((field) => {
            if(dataArray[field]){
                responseData[field] = dataArray[field];
            }else{
                responseData[field] = "#Filtered";
            }
        });
    }

    res.send(JSON.stringify(responseData));

});

const port = 3006;
app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})