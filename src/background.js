chrome.runtime.onInstalled.addListener(() => {
  console.log("installed")
  console.log('background.js running');
});
var tabid = null;
var offsetr = null;
let twitchid = "";
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Message received: ', message);
    let newURL = "https://www.twitch.tv/videos/";
    chrome.tabs.create({url: `${newURL}${message.videoid}`}).then((tab) => {
      offsetr = message.offset;
      tabid = tab.id;
      console.log("backgroud script");
      console.log(tab.id);

      console.log("creation tab");
      chrome.scripting.executeScript(
        {
          target : {tabId : tabid},
          func: () => {
            return document.body;
          },
        }
      ).then(res => {
        console.log(res);
      })
        .catch(err => {
          console.log(err);
        })

    }).then(res => {

    }).catch((err) => {
      console.log("erreur creation tab");
      console.log(err);
    })

});

chrome.tabs.onUpdated.addListener(function (tabId , info) {

  if (info.status === 'complete') {
    chrome.tabs.query({active: true, lastFocusedWindow: true}).then((tabs) => {
      console.log(tabs);
      let twitchId = "";
      let url = tabs[0].url;
      let urlSplit = url.split('/')[4];
      if(urlSplit) {
        console.log(urlSplit);
        twitchId = urlSplit.split('?')[0];
      } else {
        twitchId = "999";
      }
      let parsed = parseInt(twitchId);
      console.log(!isNaN(parsed));
          twitchid = twitchId;
          chrome.tabs.sendMessage(tabs[0].id, {action: "loadSongs", twitchId: twitchId}, function(response) {
          })

    });
    console.log(info);
    console.log(offsetr);
    chrome.scripting.executeScript({
      target : {tabId : tabid},
      func : setTimestamp,
      args: [offsetr]
    }).then(res => {
      console.log("script complete");
      console.log(res);
    });
  }
});

function setTimestamp(offset) {
  console.log(offset);
  let video = document.getElementsByTagName('video')[0];
  video.currentTime = offset;
  return document.body;
}
