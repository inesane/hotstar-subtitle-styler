chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PRESS_KEY" && sender.tab) {
    const tabId = sender.tab.id;
    const key = message.key || "f";

    chrome.debugger.attach({ tabId }, "1.3", () => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false });
        return;
      }

      chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
        type: "keyDown", key,
      }, () => {
        chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
          type: "keyUp", key,
        }, () => {
          sendResponse({ success: true });
          // Detach immediately and force-retry if it fails
          chrome.debugger.detach({ tabId }, () => {
            if (chrome.runtime.lastError) {
              // Retry detach after a short delay
              setTimeout(() => chrome.debugger.detach({ tabId }, () => {}), 100);
            }
          });
        });
      });
    });
    return true;
  }
});

// Also detach if the tab navigates or closes while attached
chrome.debugger.onDetach.addListener(() => {});
