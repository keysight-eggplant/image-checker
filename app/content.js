chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'start') {
    let domNodes = window.NCC.imageChecker._nodeListToArray(document.getElementsByTagName('*'));
    window.NCC.imageChecker.showImagesInfo(domNodes);
  }

  if (request.message === 'stop') {
    window.NCC.imageChecker._nodeListToArray(document.querySelectorAll('.ncc-image-checker-overlay')).map(o => o.remove());
  }

  if (request.message === 'info') {
    document.querySelectorAll('.ncc-image-checker-overlay').length > 0
      ? sendResponse({message: 'active'})
      : sendResponse({message: 'inactive'});
  }
});

chrome.runtime.sendMessage({message: 'loaded'});
