chrome.runtime.onInstalled.addListener(() => {
  console.log("installed")
  console.log('background.js running');
});
var tabid = null;
var offsetr = null;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
