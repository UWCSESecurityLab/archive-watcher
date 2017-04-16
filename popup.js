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
}
