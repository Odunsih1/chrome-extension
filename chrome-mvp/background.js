import { createSelectionContext } from "./selection-context.mjs";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    serviceUrl: "http://127.0.0.1:4317",
    root: ""
  });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab?.id) return;
  if (message.type === "aria-ease-selection") {
    const selection = createSelectionContext(message.selection, sender.tab);
    chrome.storage.local.set({ latestSelection: selection, latestSelectionError: "", selectionCancelled: false });
  } else if (message.type === "aria-ease-selection-error") {
    chrome.storage.local.set({ latestSelectionError: message.message, selectionCancelled: false });
  } else if (message.type === "aria-ease-selection-cancelled") {
    chrome.storage.local.set({ selectionCancelled: true, latestSelectionError: "" });
  } else if (message.type === "aria-ease-selection-ready") {
    chrome.storage.local.set({ selectionCancelled: false, latestSelectionError: "" });
  }
});

async function clearSelectionForTab(tabId) {
  const { latestSelection } = await chrome.storage.local.get({ latestSelection: null });
  if (latestSelection?.tabId !== tabId) return;
  await chrome.storage.local.set({ latestSelection: null, latestSelectionError: "", selectionCancelled: false });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading" || changeInfo.url) clearSelectionForTab(tabId).catch(() => {});
});

chrome.tabs.onRemoved.addListener((tabId) => {
  clearSelectionForTab(tabId).catch(() => {});
});
