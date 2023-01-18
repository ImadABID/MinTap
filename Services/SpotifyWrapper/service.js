const express = require("express");
const bodyParser = require("body-parser");
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
    clientId: '0e5b9240a9f040aea281ced3db3818fd',
    clientSecret: 'c86e0453fbdc422ab814b61afc6dd386',
    redirectUri: 'https://MinTapActuator.com'
});
spotifyApi.setAccessToken("BQDViROQmFQ7WTqtjXgqljmmp-vgJFRHu90qTK90nNA8iHnL0Qh_zU-MGfSLNoCAS6OH5LpS5Qy2vf0c1vsnONGjE7VdbbfPgPryEaM1eun6ZQH3ENOpuFqgY_k2ttzfn2T6ZLkhBi4uomQ21DP-m2_W6W3vT9CP9Vks4tOYJeMPbRkxSimDEsC65rNX3le0E5TuAWa3");

const getTriggerData = (askedFields) => {
    return new Promise((resolve, reject) => {
        let returned_data = {};
        spotifyApi.getMyCurrentPlayingTrack()
            .then(function (data) {
                for (let index = 0; index < askedFields.length; index++) {
                    const element = askedFields[index];
                    if (element == "Spotify.currentTrack.artistNames") {
                        let array = [];
                        for (let i = 0; i < data.body.item.artists.length; i++) {
                            array.push(data.body.item.artists[i].name);

                        }
                        returned_data["Spotify.currentTrack.artistNames"] = array;
                    }
                    else if (element == "Spotify.currentTrack.trackName") {
                        returned_data["Spotify.currentTrack.trackName"] = data.body.item.name;
                    }
                    else if (element == "Spotify.currentTrack.albumName") {
                        returned_data["Spotify.currentTrack.albumName"] = data.body.item.album.name;

                    }
                    else if (element == "Spotify.currentTrack.releaseDate") {
                        returned_data["Spotify.currentTrack.releaseDate"] = data.body.item.album.release_date;
                    }
                    else if (element == "Spotify.currentTrack.trackDuration") {
                        returned_data["Spotify.currentTrack.trackDuration"] = data.body.item.duration_ms;
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

app.post('/tap', async (req, res) => {

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
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})