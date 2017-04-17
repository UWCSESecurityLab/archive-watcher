// Get global stats

refreshPopup();
setTimeout(refreshPopup, 1000);

function refreshPopup() {
  chrome.runtime.sendMessage(
    {
      type: 'getGlobalCounts' 
    },
    function(response) {
      let total = Object.values(response).reduce((a, b) =>  a + b, 0);
      document.getElementById('total').innerHTML = total;
      document.getElementById('waybackMachineMetaRequest').innerHTML = response.waybackMachineMetaRequest;
      document.getElementById('archiveRequest').innerHTML = response.archiveRequest;
      document.getElementById('archiveEscape').innerHTML = response.archiveEscape;
      document.getElementById('notOnArchive').innerHTML = response.notOnArchive;
      document.getElementById('unclassifiedRequest').innerHTML = response.unclassifiedRequest;
    }
  );

  var query = { 
    active: true, 
    currentWindow: true 
  };
    
  chrome.tabs.query(query, (tabs) => {
    if (tabs.length === 1) {
      let tab = tabs[0];
      console.log('got exactly 1 active tab');
      document.getElementById('currentLocation').innerHTML = tab.url;
      
      chrome.runtime.sendMessage(
        {
          type: 'getVisitForTab',
          tab: tab
        },
        function(response) {
          console.log(response);
          let total = Object.values(response.counts).reduce((a, b) =>  a + b, 0);
          document.getElementById('visitTotal').innerHTML = total;
          document.getElementById('visitWaybackMachineMetaRequest').innerHTML = response.counts.waybackMachineMetaRequest;
          document.getElementById('visitArchiveRequest').innerHTML = response.counts.archiveRequest;
          document.getElementById('visitArchiveEscape').innerHTML = response.counts.archiveEscape;
          document.getElementById('visitNotOnArchive').innerHTML = response.counts.notOnArchive;
          document.getElementById('visitUnclassifiedRequest').innerHTML = response.counts.unclassifiedRequest;

        }
      );

    } else if (tabs.length === 0) {
      console.log('no active tab found');
    } else if (tabs.length > 1) {
      console.log('multiple active tabs found');
    }
  });

}
