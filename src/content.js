console.log("CONTENT SCRIPT");
const RIGHT_CONTROLS = '.video-player__default-player .player-controls__right-control-group';
let twitchId = "";
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
  console.log("STAAARTR");
  console.log(message);
  if(twitchId !== message.twitchId) {
    let icon = document.querySelector('.fa-music');
    if (icon) {
      icon.remove();
    }
    let modal = document.querySelector('.container-card');
    console.log(modal);
    if(modal) {
      modal.remove();
    }
    twitchId = message.twitchId;
    console.log("lets go");
    // use `url` here inside the callback because it's asynchronous!
    console.log("loaded");
    /**
     * Begin insert music icon in player bar
     */
    let a = document.querySelector('div.Layout-sc-1xcs6mc-0.beAYWq a');
    if(a.href === 'https://www.twitch.tv/tipstevens') {

      let container = document.querySelector(RIGHT_CONTROLS);
      const thing = container.querySelector('button[data-a-target="player-theatre-mode-button"]') || container.querySelector('button[data-a-target="player-fullscreen-button"]');
      console.log(thing);
      const i = document.createElement("i");
      const div = document.createElement("div");
      div.classList.add("card");
      i.insertBefore(div, i.parentElement);
      i.classList.add("fas");
      i.classList.add("fa-music");
      i.style.cursor = 'pointer';
      if ( thing ) {
        console.log("thing oui")
        container.insertBefore(i, thing.parentElement);
      } else {
        console.log("thing append")
        container.appendChild();
      }

      fetch(chrome.runtime.getURL('/modal.html')).then(r => r.text()).then(html => {
        console.log("add html");
        document.getElementsByClassName('eXTUnT')[0].insertAdjacentHTML('beforeend', html);
        i.addEventListener("click", () => {
          document.querySelector('.container-card').classList.toggle('hide');
        });
        let close = document.querySelector('.close');
        console.log(close);

        close.addEventListener('click', () => {
          document.querySelector('.container-card').classList.toggle('hide');
        })


        fetch(`http://localhost:4000/api/messages/twitch/${message.twitchId}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            data.forEach((message) => {
              let song = message.song;
              if(song) {
                let div = document.createElement('div');
                div.classList.add('songlist');
                let p = document.createElement('p');
                let artistLabel = document.createElement('b');
                artistLabel.innerText = "Artiste : ";
                artistLabel.style.fontWeight = 'bold'
                let artiste = document.createElement('span');
                artiste.innerHTML = `${song.artist}<br/>`;
                let spanTitre = document.createElement('span');
                spanTitre.classList.add('titre');
                let songLabel = document.createElement('b');


                let timestamp = ""
                if(message.offsetSeconds < 3600) {
                  timestamp = new Date(message.offsetSeconds * 1000).toISOString().substring(14, 19);
                } else {
                  timestamp = new Date(message.offsetSeconds * 1000).toISOString().substring(11, 19);
                }
                let a = document.createElement('a');
                a.href = "#";
                a.setAttribute('timestamp', message.offsetSeconds);
                a.innerText = `Joué à ${timestamp}`;
                a.addEventListener('click', (event) => {
                  console.log("oui");
                  timestamp = event.target.getAttribute('timestamp');
                  console.log(timestamp);
                  document.getElementsByTagName('video')[0].currentTime = timestamp;
                });
                songLabel.innerHTML = `<b style="font-weight: bold;"> Titre : </b>${song.name} <br/>`;
                songLabel.append(a);
                spanTitre.append(songLabel);
                p.append(artistLabel);
                p.append(artiste);
                p.append(songLabel);
                div.append(p);
                let divSongs = document.getElementById('songs');
                divSongs.append(div);
              }
            });
          }).catch(err => {
            console.log(err);
        })
        // not using innerHTML as it would break js event listeners of the page
      }).then((res) => {
      }).catch((err) => {
        console.log(err);
      })
    }
  }
});
