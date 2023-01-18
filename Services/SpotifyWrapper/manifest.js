//MANIFEST.js

// Only for trigger manifest
let dataArray = {
  "Spotify.currentTrack.artistNames": null,
  "Spotify.currentTrack.trackName": null,
  "Spotify.currentTrack.albumName": null,
  "Spotify.currentTrack.releaseDate": null,
  "Spotify.currentTrack.trackDuration": null,
}

class SpotifyClass {

  constructor() {

    // ------ Define the service object --------

    this.currentTrack = {
      get artistNames() {
        return dataArray["Spotify.currentTrack.artistNames"];
      },
      get trackName() {
        return dataArray["Spotify.currentTrack.trackName"];
      },
      get trackDuration() {
        return dataArray["Spotify.currentTrack.trackDuration"];
      },
      get albumName() {
        return dataArray["Spotify.currentTrack.albumName"];
      },
      get Duration() {
        return dataArray["Spotify.currentTrack.releaseDate"];
      },
    };

    // -----------------------------------------

  }

  static SpotifyClassFactory(
    askedFields,
    properties = null
  ) {

    return new Promise((resolve)=>{

      // Only for trigger manifest
      // ------ Type here the code that populates dataArray --------

      const API_URL = "127.0.0.1:3006";

      fetch(`http://${API_URL}/tap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          askedFields: askedFields,
          properties: properties
        }),
      })
      .then(res => res.json())
      .then((json) => {
        dataArray = json;
        resolve(new SpotifyClass());
      })

      // -----------------------------------------------------------

    });

  }

}

// Testing

// const main = async ()=>{
//   const Spotify = await SpotifyClass.SpotifyClassFactory([]);
//   console.log(Spotify.currentTrack.title);
// }

// main();