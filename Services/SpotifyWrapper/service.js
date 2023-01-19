const express = require("express");
const bodyParser = require("body-parser");
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: '0e5b9240a9f040aea281ced3db3818fd',
    clientSecret: 'c86e0453fbdc422ab814b61afc6dd386',
    redirectUri: 'https://MinTapActuator.com'
});
spotifyApi.setAccessToken("BQAERKNqKDC2_DOyArOIcU5oVCzhjVG04zzib-cC4tuNRqGP_A2u1c-npYOPys_uwz8vt43GBLl4TXuO9bcrernXD8VfbDIEEPW1mCuyFYLuUTGZDJTmKMqQj9SunY8DgkbqTTCKKR25RFleqgeIhW-9_sMRX60B4yYtAaPTRLj0HdlI_qxex4JMxjSIJS931rOmkcUW");

const getTriggerData = (askedFields) => {
    return new Promise((resolve, reject) => {
        let returned_data = {};
        spotifyApi.getMyCurrentPlayingTrack()
            .then(function (data) {
                for (let index = 0; index < askedFields.length; index++) {
                    const element = askedFields[index];
                    if (element == "Spotify.currentTrack.artistNames") {
                        let array = [];
                        for (let i = 0; i < data.body?.item?.artists?.length; i++) {
                            array.push(data.body?.item?.artists[i]?.name);

                        }
                        returned_data["Spotify.currentTrack.artistNames"] = array;
                    }
                    else if (element == "Spotify.currentTrack.trackName") {
                        returned_data["Spotify.currentTrack.trackName"] = data.body?.item?.name;
                    }
                    else if (element == "Spotify.currentTrack.albumName") {
                        returned_data["Spotify.currentTrack.albumName"] = data.body?.item?.album?.name;

                    }
                    else if (element == "Spotify.currentTrack.releaseDate") {
                        returned_data["Spotify.currentTrack.releaseDate"] = data.body?.item?.album?.release_date;
                    }
                    else if (element == "Spotify.currentTrack.trackDuration") {
                        returned_data["Spotify.currentTrack.trackDuration"] = data.body?.item?.duration_ms;
                    }
                }
                resolve(returned_data);
            }, function (err) {
                console.log('Something went wrong!', err);
                reject();
            });
    })


}

let dataArray = {};

class SpotifyClass { 

    constructor(){

        // ------ Define the service object --------
        
        this.currentTrack = {
            get artistNames(){
                return dataArray["Spotify.currentTrack.artistNames"];
            },
            get trackName() {
                return dataArray["Spotify.currentTrack.trackName"];
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

    

        // -----------------------------------------------------------

        return new Promise(async (resolve)=>{

            // Only for trigger manifest
            // ------ Type here the code that populates dataArray --------
            
            dataArray = await getTriggerData(askedFields);

            resolve(new SpotifyClass())
            
            // -----------------------------------------------------------
    
        });

    }

}

const app = express();
app.use(bodyParser.json());

app.post('/tap', async (req, res) => {

    let askedFields = req.body.askedFields;
    let minimizedAuxiliaryInformation = null;
    if(req.body.properties && req.body.properties.minimizedAuxiliaryInformation){
        minimizedAuxiliaryInformation = req.body.properties.minimizedAuxiliaryInformation;
    }

    const responseData = {};

    const Spotify = await SpotifyClass.SpotifyClassFactory(askedFields);

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
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})