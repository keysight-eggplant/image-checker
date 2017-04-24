(function() {
  ga('send', 'pageview', '/popup.html');

  chrome.runtime.onMessage.addListener(function(request) {
    if (request.message === 'loaded') {
      getStartButton().style.display = 'inline-block';
      getStopButton().style.display = 'none';
    }
  });

  getStartButton().style.display = 'none';
  getStopButton().style.display = 'none';

  getStartButton().addEventListener('click', start, false);
  getStopButton().addEventListener('click', stop, false);

  sendMessageToActiveTab({message: 'info'}, function(response) {
    if (response.message === 'inactive') {
      getStartButton().style.display = 'inline-block';
      getStopButton().style.display = 'none';
    }

    if (response.message === 'active') {
      getStartButton().style.display = 'none';
      getStopButton().style.display = 'inline-block';
    }
  });

  function getStartButton() {
    return document.getElementById('start');
  }

  function getStopButton() {
    return document.getElementById('stop');
  }

  function start() {
    getStartButton().style.display = 'none';
    getStopButton().style.display = 'block';
    sendMessageToActiveTab({message: 'start'});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      ga('send', {
        hitType: 'event',
        eventCategory: 'imageInfo',
        eventAction: 'show',
        eventLabel: tabs[0].url
      });
    });
  }

  function stop() {
    getStartButton().style.display = 'block';
    getStopButton().style.display = 'none';
    sendMessageToActiveTab({message: 'stop'});
  }

  function sendMessageToActiveTab(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
  }
}());
