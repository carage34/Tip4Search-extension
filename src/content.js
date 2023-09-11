/**
 * Content script
 * A pour but d'intéragir avec les pages des onglets du navigateur
 * Modifie le DOM de twitch si on est sur une VOD de tipstevens du dimanche
 * Insère une icone totem dans la barre droite du player twitch
 * Insère une modal / fenêtre au clic sur le totem qui affiche les morceaux de la VOD
 */
const RIGHT_CONTROLS = '.video-player__default-player .player-controls__right-control-group';
let twitchId = "";
let loading = false;

/**
 * Ajout de l'icone totem
 * @return {Promise<unknown>}
 */
function fetchTotemDom() {
  return new Promise((resolve, reject) => {
    fetch(chrome.runtime.getURL('/totem.html')).then(r => r.text()).then(html => {
      let container = document.querySelector(RIGHT_CONTROLS);
      container.insertAdjacentHTML('afterbegin', html);
      let totem = document.querySelector('#closetotem');

      totem.addEventListener('click', (e) => {
        console.log(e);
        if(document.querySelector('.container-card') != null) {
          if(e.srcElement.id === 'totem' || e.srcElement.id === 'totemplz') {
            console.log("Hide totem");
            document.querySelector('.container-card').classList.toggle('hide');
          }
        }
      });
      resolve();
    }).catch(err => {
      console.log(err);
    });
  });
}

/**
 * Ajout de la modal des morceaux
 * @return {Promise<unknown>}
 */
function fetchModalDom() {
  return new Promise((resolve, reject) => {
    let modals = document.getElementsByClassName('container-card');
    fetch(chrome.runtime.getURL('/modal.html')).then(r => r.text()).then(html => {
      document.getElementsByClassName('gMrqwn')[0].insertAdjacentHTML('beforeend', html);
      let close = document.querySelector('#closemodal');
      console.log(close);
      close.addEventListener('click', (e) => {
        console.log("Hide modal")
        document.querySelector('.container-card').classList.toggle('hide');
      });
      resolve();
    });
  })
}

/**
 * Ajout des morceaux dans la modal
 * @param message
 * @return {Promise<unknown>}
 */
function fetchSongsDom(message) {
  return new Promise((resolve, reject) => {
    // Récupération des morceaux
    fetch(`https://sam.absolumentpc77-informatique.fr/api/messages/twitch/${message.twitchId}`)
      .then((response) => response.json())
      .then((data) => {
        twitchId = message.twitchId;
        // Creation d'une div pour chaque morceaux avec le titre l'artiste et le timecode
        data.forEach((message) => {
          let song = message.song;
          if (song) {
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
            if (message.offsetSeconds < 3600) {
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

/**
 * Vérifie que l'id de la video twitch correspond à une vod de tipstevens du dimanche
 * @param twitchid id de la vod
 * @return {Promise<unknown>}
 */
function isVod(twitchid) {
  return new Promise((resolve, reject) => {
    fetch(`https://sam.absolumentpc77-informatique.fr/api/videos/isVod/${twitchid}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.isVOD) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(err => {
      console.log(err);
    });
  })
}

async function startFetch(message) {
  loading = true;
  console.log("START FETCH");
  let isvod = await isVod(message.twitchId);
  console.log("is Vod" + isvod);
  if (isvod) {
    // Supprime l'icone et la modal pour prévenir un potentiel ajout multiple
    let modals = document.getElementsByClassName('container-card');
    for (let i = 0; i < modals.length; i++) {
      modals[i].remove();
    }

    let totem = document.getElementsByClassName('open');
    for (let i = 0; i < totem.length; i++) {
      totem[i].remove();
    }
    await fetchTotemDom();
    await fetchModalDom();
    await fetchSongsDom(message);
    console.log("END FETCH");

  } else {
    console.log("removed");
    // Supprime l'icone et la modal si on est plus sur une vod de tipstevens
    loading = false;
    let totem = document.getElementsByClassName('open');
    if (totem.length > 0) {
      totem[0].remove();
    }
    let modal = document.getElementsByClassName('container-card');
    if (modal.length > 0) {
      modal[0].remove();
    }
  }

}

// Ecoute les messages envoyés par le background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.offset);
  sendResponse("test");
  console.log("here");
  console.log(loading);
  console.log("Loading status : " + loading);
  if (!loading) {
    startFetch(message);
  }
});
