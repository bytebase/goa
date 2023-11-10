document.addEventListener('DOMContentLoaded', function() {
  var feedInput = document.getElementById('feedInput');
  var addButton = document.getElementById('addButton');
  var syncButton = document.getElementById('syncButton');
  var listDiv = document.getElementById('feeds');

  // Load the list on popup open.
  loadList();

  addButton.addEventListener('click', function() {
    var newFeed = feedInput.value;
    // Add feed to the list in Chrome storage
    chrome.storage.sync.get('feeds', function(result) {
      var feeds = result.feeds || [];
      feeds.push(newFeed);
      // Save the updated feeds.
      chrome.storage.sync.set({'feeds': feeds}, function() {
        console.log('Feed added: ', newFeed);
        // Reload the feed list and update feeds after adding an feed.
        loadList();
        updateFeeds();
      });
    });
  });

  function removeFeed(feedToRemove) {
    chrome.storage.sync.get('feeds', function(result) {
      var feeds = result.feeds || [];
      var updatedList = feeds.filter(feed => feed !== feedToRemove);
      // Save the updated list
      chrome.storage.sync.set({'feeds': updatedList}, function() {
        console.log('Feed removed: ', feedToRemove);
        // Reload the feed list and update feeds after removing an feed.
        loadList();
        updateFeeds();
      });
    });
  }

  function loadList() {
    chrome.storage.sync.get('feeds', function(result) {
      var feeds = result.feeds || [];
      // Clear the list before re-rendering.
      listDiv.innerHTML = '';
  
      feeds.forEach(function(feed) {
        var listFeed = document.createElement('div');
        listFeed.className = 'list-feed';
        listFeed.innerHTML = `
          <span>${feed}</span>
          <button class="remove-button" data-feed="${feed}">X</button>
        `;
        listDiv.appendChild(listFeed);

        // Add click event listener to the remove button.
        listFeed.querySelector('.remove-button').addEventListener('click', function(event) {
          var feedToRemove = event.target.dataset.feed;
          removeFeed(feedToRemove);
        });
      });
    });
  }

  syncButton.addEventListener('click', function() {
    updateFeeds();
  });

  function updateFeeds() {
    // Example: "https://github.com/bytebase/secret/raw/main/goto/data.json".
    console.log('Syncing data...');
    // Clear links,
    chrome.storage.local.set({'links': []});
    chrome.storage.sync.get('feeds', function(result) {
      for (var feed of result.feeds || []) {
        fetch(feed).then(response => {
          if (!response.ok) {
            throw new Error('response not ok');
          }
          return response;
        }).then(data => {
          data.json().then(list => {
            chrome.storage.local.get('links', function(result) {
              var links = result.links || [];
              links.push(...list);
              chrome.storage.local.set({'links': links});
            });
          });
        }).catch(error => {
          console.log('Failed to make request: ', error);
        });
      }
    });
  }
});
