chrome.webRequest.onBeforeRequest.addListener((param) => {
  chrome.storage.local.get('links').then(result => {
    if (!result.links) {
      return;
    }
    for (v of result.links) {
      if (v.short === param.url || 'http://' + v.short === param.url || 'https://' + v.short === param.url ) {
        chrome.tabs.update({url: v.full})
        return;
      }
    }
  });
}, {urls: ['*://*/*']})