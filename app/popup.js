/*global chrome*/
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('mail').addEventListener('click', function() {
    chrome.tabs.update({
      url: 'mailto:webperfinfo@nccgroup.trust'
    });
  });

  document.getElementById('start').addEventListener('click', start, false);
  document.getElementById('stop').addEventListener('click', stop, false);

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'info'}, function(response) {
      // this logs undefined apparently due to racing conditions
      console.log(response);

      response = response || {message: 'inactive'};

      if (response.message === 'inactive') {
        document.getElementById('stop').style.display = 'none';
        document.getElementById('start').style.display = 'inline-block';
      }

      if (response.message === 'active') {
        document.getElementById('stop').style.display = 'inline-block';
        document.getElementById('start').style.display = 'none';
      }

    });
  });
});

function start() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'start'});
    document.getElementById('start').style.display = 'none';
    document.getElementById('stop').style.display = 'block';
  });
}

function stop() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: 'stop'});
    document.getElementById('start').style.display = 'block';
    document.getElementById('stop').style.display = 'none';
  });
}
