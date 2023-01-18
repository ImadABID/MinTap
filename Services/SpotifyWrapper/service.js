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

const app = express();
app.use(bodyParser.json());

app.post('/tap', async (req, res) => {

})

const port = 3006;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})