chrome.runtime.onInstalled.addListener(() => {
  console.log("installed")
  console.log('background.js running');
});
var tabid = null;
var offsetr = null;
let twitchid = "";
let setOffset = false;
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Message received: ', message);
    let newURL = "https://www.twitch.tv/videos/";

    // Ouvrir une VOD dans un nouvel onglet à un timecode donné
    chrome.tabs.create({url: `${newURL}${message.videoid}`}).then((tab) => {
      setOffset = true;
      offsetr = message.offset;
      tabid = tab.id;
    }).catch((err) => {
      console.log("erreur creation tab");
      console.log(err);
    });
});

chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete') {
    // Nouvel onglet chargé
    chrome.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
      let twitchId = "999";
      // Parsing de l'url pour récupérer l'id de vod twitch
      let url = tabs[0].url;
      let urlSplit = url.split('/')[4];
      if(urlSplit) {
        twitchId = urlSplit.split('?')[0];
      }
      twitchid = twitchId;
      chrome.tabs.sendMessage(tabs[0].id, {action: "loadSongs", twitchId: twitchId}, function(response) {
      })
    });

    // Execution d'un script pour modifier le timecode du lecteur twitch
    console.log("oops");
    if(setOffset) {
      chrome.scripting.executeScript({
        target : {tabId : tabid},
        func : setTimestamp,
        args: [offsetr]
      }).then(res => {
        console.log("script complete");
        setOffset = false;
        console.log(res);
      });
    }
  }
});

// Modifie le timecode du lecteur twitch
function setTimestamp(offset) {
  let video = document.getElementsByTagName('video')[0];
  video.currentTime = offset;
  return document.body;
}
