const DEFAULTS = {
  enabled: true,
  fontSize: 28,
  fontFamily: "Inconsolata-SemiBold, sans-serif",
  fontColor: "#ffffff",
  fontWeight: "normal",
  fontStyle: "normal",
  textShadow: "none",
  shadowColor: "#000000",
  shadowOpacity: 100,
  bgColor: "#000000",
  bgOpacity: 80,
  bgPadding: 0,
  bgRadius: 0,
  bottomOffset: 10,
  lineHeight: 129,
  textTransform: "none",
};

const rangeControls = {
  fontSize: { suffix: "px" },
  shadowOpacity: { suffix: "%" },
  bgOpacity: { suffix: "%" },
  // bgPadding: { suffix: "px" },
  // bgRadius: { suffix: "px" },
  bottomOffset: { suffix: "%" },
  lineHeight: { suffix: "%" },
};

const colorControls = ["fontColor", "shadowColor", "bgColor"];
const selectControls = [
  "fontFamily",
  "fontWeight",
  "fontStyle",
  "textShadow",
  "textTransform",
];

function getSettings(callback) {
  chrome.storage.sync.get(DEFAULTS, callback);
}

function saveSettings(settings) {
  chrome.storage.sync.set(settings);
  notifyContentScript(settings);
}

function notifyContentScript(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SUBTITLE_STYLE_UPDATE",
        settings,
      });
    }
  });
}



function populateUI(settings) {
  // Enabled toggle
  document.getElementById("enabled").checked = settings.enabled;
  document
    .getElementById("controls")
    .classList.toggle("disabled", !settings.enabled);

  // Range controls
  for (const [id, meta] of Object.entries(rangeControls)) {
    const input = document.getElementById(id);
    input.value = settings[id];
    document.getElementById(id + "Val").textContent =
      settings[id] + meta.suffix;
  }

  // Color controls
  for (const id of colorControls) {
    document.getElementById(id).value = settings[id];
    document.getElementById(id + "Hex").textContent = settings[id];
  }

  // Select controls
  for (const id of selectControls) {
    document.getElementById(id).value = settings[id];
  }

}

function collectSettings() {
  const settings = {
    enabled: document.getElementById("enabled").checked,
  };

  for (const id of Object.keys(rangeControls)) {
    settings[id] = parseInt(document.getElementById(id).value, 10);
  }
  for (const id of colorControls) {
    settings[id] = document.getElementById(id).value;
  }
  for (const id of selectControls) {
    settings[id] = document.getElementById(id).value;
  }

  return settings;
}

function attachListeners() {
  // Enable toggle
  document.getElementById("enabled").addEventListener("change", (e) => {
    document
      .getElementById("controls")
      .classList.toggle("disabled", !e.target.checked);
    const settings = collectSettings();
    saveSettings(settings);
  });

  // Range controls
  for (const [id, meta] of Object.entries(rangeControls)) {
    document.getElementById(id).addEventListener("input", (e) => {
      document.getElementById(id + "Val").textContent =
        e.target.value + meta.suffix;
      const settings = collectSettings();
      saveSettings(settings);

    });
  }

  // Color controls
  for (const id of colorControls) {
    document.getElementById(id).addEventListener("input", (e) => {
      document.getElementById(id + "Hex").textContent = e.target.value;
      const settings = collectSettings();
      saveSettings(settings);

    });
  }

  // Select controls
  for (const id of selectControls) {
    document.getElementById(id).addEventListener("change", () => {
      const settings = collectSettings();
      saveSettings(settings);

    });
  }

  // Reset button
  document.getElementById("resetBtn").addEventListener("click", () => {
    chrome.storage.sync.set(DEFAULTS, () => {
      populateUI(DEFAULTS);
      notifyContentScript(DEFAULTS);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getSettings((settings) => {
    populateUI(settings);
    attachListeners();
  });
});
