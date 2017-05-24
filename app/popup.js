/**
 Copyright 2017 NCC Group PLC http://www.nccgroup.trust/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function() {
  ga('send', 'pageview', '/popup.html');

  chrome.runtime.onMessage.addListener((request) => {
    if (request.message === 'loaded') {
      getLoading().style.display = 'none';
      getStartButton().style.display = 'inline-block';
      getStopButton().style.display = 'none';
    }
  });

  getStartButton().style.display = 'none';
  getStopButton().style.display = 'none';

  getStartButton().addEventListener('click', start, false);
  getStopButton().addEventListener('click', stop, false);

  sendMessageToActiveTab({message: 'info'}, (response) => {
    if (response.message === 'inactive') {
      getLoading().style.display = 'none';
      getStartButton().style.display = 'inline-block';
      getStopButton().style.display = 'none';
    }

    if (response.message === 'active') {
      getLoading().style.display = 'none';
      getStartButton().style.display = 'none';
      getStopButton().style.display = 'inline-block';
    }
  });

  function getLoading() {
    return document.getElementById('loading');
  }

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
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
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
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
  }
}());
