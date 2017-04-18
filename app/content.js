chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'start') {
    window.NCC.imageChecker.showImagesInfo();
  }

  if (request.message === 'stop') {
    window.NCC.imageChecker.hideImagesInfo();
  }

  if (request.message === 'info') {
    window.NCC.imageChecker.isImagesInfoActive()
      ? sendResponse({message: 'active'})
      : sendResponse({message: 'inactive'});
  }
});

chrome.runtime.sendMessage({message: 'loaded'});
