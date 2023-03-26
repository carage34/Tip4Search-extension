console.log("CONTENT SCRIPT");
const RIGHT_CONTROLS = '.video-player__default-player .player-controls__right-control-group';
let twitchId = "";
let loading = false;

function fetchTotemDom () {
  return new Promise((resolve, reject) => {
    let totem = document.getElementsByClassName( 'open');
    fetch(chrome.runtime.getURL('/totem.html')).then(r => r.text()).then(html => {
      console.log("ajout totem");
      let container = document.querySelector(RIGHT_CONTROLS);
      container.insertAdjacentHTML('afterbegin', html);
      let totem = document.querySelector('.open');

      totem.addEventListener('click', () => {
        document.querySelector('.container-card').classList.toggle('hide');
      });
      resolve();
    });
  });
}

function fetchModalDom() {
  return new Promise((resolve, reject) => {
    let modals = document.getElementsByClassName('container-card');
    fetch(chrome.runtime.getURL('/modal.html')).then(r => r.text()).then(html => {
      console.log("ajout modal");
      document.getElementsByClassName('eXTUnT')[0].insertAdjacentHTML('beforeend', html);
      let close = document.querySelector('.close');

      close.addEventListener('click', () => {
        document.querySelector('.container-card').classList.toggle('hide');
      });
      resolve();
    });
  })
}

function fetchSongsDom(message) {
  return new Promise((resolve, reject) => {


      let container = document.querySelector(RIGHT_CONTROLS);
      const thing = container.querySelector('button[data-a-target="player-theatre-mode-button"]') || container.querySelector('button[data-a-target="player-fullscreen-button"]');

      fetch(`http://localhost:4000/api/messages/twitch/${message.twitchId}`)
        .then((response) => response.json())
        .then((data) => {
          twitchId = message.twitchId;
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
                timestamp = event.target.getAttribute('timestamp');
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
          loading = false;
          resolve();
        }).catch(err => {
        console.log(err);
      })
      // not using innerHTML as it would break js event listeners of the page

  })
}

function isVod(twitchid) {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:4000/api/videos/isVod/${twitchid}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if(data.isVOD) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(err => {
      console.log(err);
    })
  })
}

async function startFetch(message) {
  loading = true;
  console.log("START FETCH");
  let isvod = await isVod(message.twitchId);
  if(isvod) {
      let modals = document.getElementsByClassName('container-card');
      for(let i = 0;i< modals.length;i++) {
        modals[i].remove();
      }

      let totem = document.getElementsByClassName( 'open');
      for(let i = 0;i< totem.length;i++) {
        totem[i].remove();
      }
      await fetchTotemDom();
      await fetchModalDom();
      await fetchSongsDom(message);
      console.log("END FETCH");

  } else {
    loading = false;
    let totem = document.getElementsByClassName( 'open');
    if(totem.length > 0) {
      totem[0].remove();
    }
    let modal = document.getElementsByClassName('container-card');
    if(modal.length > 0) {
      modal[0].remove();
    }
  }

}

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
  console.log(message);
  console.log("Loading status : " + loading);
  if(!loading) {
    startFetch(message);
  }
});
