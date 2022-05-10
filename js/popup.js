let btnClear = document.getElementById("clear-sync");
if (btnClear) {
  btnClear.addEventListener("click", function (e) {
    e.preventDefault();
    chrome.storage.sync.remove("source");
    chrome.storage.sync.remove("fields");
    chrome.storage.sync.remove("ahsData");
    chrome.storage.sync.remove("ahsRecord");
  });
}
