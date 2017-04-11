window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('mail').addEventListener('click', function() {
    chrome.tabs.update({
      url: 'mailto:drew@aaa.com'
    });
  })
});
