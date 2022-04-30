function clearSyncStorage(e) {
  e.preventDefault();
  chrome.storage.sync.remove("source");
  chrome.storage.sync.remove("fields");
  chrome.storage.sync.remove("ahsData");
  chrome.storage.sync.remove("ahsRecord");
}
document
  .getElementById("clear-sync")
  .addEventListener("click", clearSyncStorage);
