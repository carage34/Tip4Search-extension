console.log('running this');
/*chrome.runtime.sendMessage({ greeting: 'get-user-data' }, (response) => {
  // 3. Got an asynchronous response with the data from the service worker
  console.log('received user data', response);
});*/
var offsetr = 0;
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log("content script")
  console.log(msg);
  //console.log(video);
  let newURL = "https://www.twitch.tv/videos/";
  chrome.tabs.create({url: `${newURL}${msg.videoid}`}).then((tab) => {
    offsetr = msg.offset;
  });

  chrome.tabs.onUpdated.addListener(function (tabId , info) {
    if (info.status === 'complete') {
      chrome.scripting.executeScript({
        target : {tabId : tabId},
        func : getDom,
        args: [offsetr]
      }).then(res => {
      });
    }
  });

});

function getDom(offset) {
  console.log(document.body);
  let video = document.getElementsByTagName('video')[0];
  setTimeout(() => {
    video.currentTime = offset;
  }, 1000)
  return document.body;
}
