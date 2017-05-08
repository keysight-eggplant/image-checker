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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'start') {
    window.NCC.imageChecker.showImagesInfo();
  }

  if (request.message === 'stop') {
    window.NCC.imageChecker.hideImagesInfo();
  }

  if (request.message === 'info') {
    if (window.NCC.imageChecker.isImagesInfoActive()) {
      sendResponse({message: 'active'});
    } else {
      sendResponse({message: 'inactive'});
    }
  }
});

chrome.runtime.sendMessage({message: 'loaded'});
