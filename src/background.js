chrome.runtime.onInstalled.addListener(() => {
  console.log("installed")
  console.log('background.js running');
});
var tabid = null;
var offsetr = null;
let twitchid = "";
let setOffset = false;
let setOffsetCompleted = false;
let browsers = null;
let messageSaved = null;
let idSaved = null;
let onHistoryStart = false;
let count = 0;
if( typeof browser === 'undefined' ){
  browsers = chrome;
}
else{
  browsers = browser;
}
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Message received: ', message);
  messageSaved = message;
    let newURL = "";
    let id = "";

    if(message.available) {
      newURL = "https://www.twitch.tv/videos/";
      id = message.videoid;
    } else {
      newURL = "https://www.youtube.com/watch?v=";
      id = message.videoid;
    }
    idSaved = id;
    // Ouvrir une VOD dans un nouvel onglet à un timecode donné
    browsers.tabs.create({url: `${newURL}${id}`}).then((tab) => {
      console.log("create complete");
      console.log(tab);
      setOffset = true;
      setOffsetCompleted = true;
      onHistoryStart = false;
      offsetr = message.offset;
      tabid = tab.id;
      /*browsers.scripting.executeScript({
        target : {tabId : tabid},
        func : setTimestamp,
        args: [offsetr]
      }).then(res => {
        console.log("script complete");
        setOffset = false;
        console.log(res);
      })
        .catch(err => {
          console.log(err);
        });*/
    }).catch((err) => {
      console.log("erreur creation tab");
      console.log(err);
    });
});

chrome.webNavigation.onCompleted.addListener(function(details) {
  console.log("onCompleted");
  if(details.frameId === 0) {
    // Fires only when details.url === currentTab.url
    chrome.tabs.get(details.tabId, function(tab) {
      console.log(details.url);
      //if(tab.url === details.url) {

        // Execution d'un script pour modifier le timecode du lecteur twitch
        if(setOffsetCompleted) {
          console.log("lets go onCompleted");
        } else {
          console.log("pas offset onCompleted")
        }

        // Nouvel onglet chargé
        browsers.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
          console.log(tabid);
          console.log(tabs);
          tabid=tabs[0].id;
          let twitchId = "999";
          // Parsing de l'url pour récupérer l'id de vod twitch
          let url = tabs[0].url;

          let urlSplit = url.split('/')[4];
          console.log(url.split('/'));
          if(urlSplit) {
            twitchId = urlSplit.split('?')[0];
          }
          twitchid = twitchId;
          if(tabs.filter(item => item.id === tabid).length > 0 && setOffsetCompleted === true) {
            console.log("Trigger");
            fetch(`https://sam.absolumentpc77-informatique.fr/api/videos/isVod/${twitchid}`)
              .then((response) => response.json())
              .then((data) => {
                if (data.isVOD || (!messageSaved.available)) {

                  if(!messageSaved.available && setOffset) {
                    setTimeout(() => {
                      setOffset = false;
                      console.log("timeout onCompleted")
                      browsers.scripting.executeScript({
                        target : {tabId : tabid},
                        func : setTimestamp,
                        args: [offsetr]
                      }).then(res => {
                        console.log("script complete onCompleted");
                        console.log(res);
                        onHistoryStart = false;
                      })
                        .catch(err => {
                          console.log(err);
                        });
                    }, 500);
                  }

                  console.log("offset onCompleted")
                  console.log(offsetr)

                  try {
                    chrome.tabs.sendMessage(details.tabId, {action: "loadSongs", twitchId: twitchId, offset: offsetr}, function(response) {
                      console.log(response)
                    })
                  } catch (e) {
                    console.log("Erreur : " + e);
                  }
                } else {
                  console.log("offset false onCompleted");
                }
              }).catch(err => {
              console.log(err);
            });
          } else {
            try {
              chrome.tabs.sendMessage(tabs[0].id, {action: "loadSongs", twitchId: twitchId, offset: offsetr}, function(response) {
              })
            } catch (e) {
            }
          }
        });
      //}
    });
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  onHistoryStart = true;
  console.log("onHistoryStateUpdated");
  if(details.frameId === 0) {


    // Fires only when details.url === currentTab.url
    chrome.tabs.get(details.tabId, function(tab) {
      console.log(tab.url);
      console.log(details.url);
      if(tab.url === details.url) {

        // Execution d'un script pour modifier le timecode du lecteur twitch
        if(setOffset) {
          console.log("lets go onHistoryStateUpdated");
        } else {
          console.log("pas offset onHistoryStateUpdated")
        }

        // Nouvel onglet chargé
        browsers.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
          console.log(tabid);
          console.log(tabs);
          tabid=tabs[0].id;
          let twitchId = "999";
          // Parsing de l'url pour récupérer l'id de vod twitch
          let url = tabs[0].url;

          let urlSplit = url.split('/')[4];
          console.log(url.split('/'));
          if(urlSplit) {
            twitchId = urlSplit.split('?')[0];
          }
          twitchid = twitchId;
          if(tabs.filter(item => item.id === tabid).length > 0 && setOffset === true) {
            fetch(`https://sam.absolumentpc77-informatique.fr/api/videos/isVod/${twitchid}`)
              .then((response) => response.json())
              .then((data) => {
                if (data.isVOD || (!messageSaved.available)) {
                  console.log("offset onHistoryStateUpdated")
                  console.log(offsetr)
                  try {
                    chrome.tabs.sendMessage(tabs[0].id, {action: "loadSongs", twitchId: twitchId, offset: offsetr}, function(response) {
                      console.log(response)
                    })
                  } catch (e) {
                    console.log("Erreur : " + e);
                  }
                  setTimeout(() => {
                    setOffset = false;
                    console.log("timeout onHistoryStateUpdated")
                    browsers.scripting.executeScript({
                      target : {tabId : tabid},
                      func : setTimestamp,
                      args: [offsetr]
                    }).then(res => {
                      console.log("script complete onHistoryStateUpdated");
                      console.log(res);
                      onHistoryStart = false;
                    })
                      .catch(err => {
                        console.log(err);
                      });
                  }, 1500);
                } else {
                  console.log("offset false onHistoryStateUpdated");
                }
              }).catch(err => {
              console.log(err);
            });
          } else {
            onHistoryStart = false;
            try {
              console.log("load songs")
              chrome.tabs.sendMessage(tabs[0].id, {action: "loadSongs", twitchId: twitchId, offset: offsetr}, function(response) {
                console.log("response : " + response)
              })
            } catch (e) {
            }
          }
        });
      }
    });
  }
});


function callContentJs() {
  try {
    chrome.tabs.sendMessage(tabs[0].id, {action: "loadSongs", twitchId: twitchId, offset: offsetr}, function(response) {
      console.log(response)
    })
  } catch (e) {
    console.log("Erreur : " + e);
  }
}

// Modifie le timecode du lecteur twitch
function setTimestamp(offset) {
  console.log(offset)
  let video = document.getElementsByTagName('video')[0];
  video.currentTime = offset;
  if(typeof video.currentTime === 'number') {

  }
  return typeof video.currentTime;
}

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
    })
  })
}
