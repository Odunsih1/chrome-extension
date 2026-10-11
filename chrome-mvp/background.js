chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    serviceUrl: "http://127.0.0.1:4317",
    root: ""
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return;
  if (message.type === "aria-ease-selection") {
    chrome.storage.local.set({ latestSelection: message.selection, latestSelectionError: "", selectionCancelled: false });
  } else if (message.type === "aria-ease-selection-error") {
    chrome.storage.local.set({ latestSelectionError: message.message, selectionCancelled: false });
  } else if (message.type === "aria-ease-selection-cancelled") {
    chrome.storage.local.set({ selectionCancelled: true, latestSelectionError: "" });
  } else if (message.type === "aria-ease-selection-ready") {
    chrome.storage.local.set({ selectionCancelled: false, latestSelectionError: "" });
  }
});
