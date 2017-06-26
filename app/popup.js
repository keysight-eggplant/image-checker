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
      getLoading().classList.add('ncc-hide');
      getStartButton().classList.remove('ncc-hide');
      getStopButton().classList.add('ncc-hide');
    }
  });

  getStartButton().classList.add('ncc-hide');
  getStopButton().classList.add('ncc-hide');

  getStartButton().addEventListener('click', start, false);
  getStopButton().addEventListener('click', stop, false);
  getOptionsLink().addEventListener('click', openOptions, false);

  sendMessageToActiveTab({message: 'info'}, (response) => {
    if (response.message === 'inactive') {
      getLoading().classList.add('ncc-hide');
      getStartButton().classList.remove('ncc-hide');
      getStopButton().classList.add('ncc-hide');
    }

    if (response.message === 'active') {
      getLoading().classList.add('ncc-hide');
      getStartButton().classList.add('ncc-hide');
      getStopButton().classList.remove('ncc-hide');
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
    getStartButton().classList.add('ncc-hide');
    getStopButton().classList.remove('ncc-hide');
    sendMessageToActiveTab({message: 'start'});
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      ga('send', {
        hitType: 'event',
        eventCategory: 'imageInfo',
        eventAction: 'show',
        eventLabel: tabs[0].url
      });
    });
  }

  function stop() {
    getStartButton().classList.remove('ncc-hide');
    getStopButton().classList.add('ncc-hide');
    sendMessageToActiveTab({message: 'stop'});
  }

  function getOptionsLink() {
    return document.getElementById('options');
  }

  function openOptions() {
    chrome.runtime.openOptionsPage();
  }

  function sendMessageToActiveTab(message, callback) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
  }
}());
