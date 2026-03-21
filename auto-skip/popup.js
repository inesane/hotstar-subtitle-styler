const DEFAULTS = {
  skipIntro: true,
  skipAds: true,
  profileName: "",
};

const skipIntroEl = document.getElementById("skipIntro");
const skipAdsEl = document.getElementById("skipAds");
const profileNameEl = document.getElementById("profileName");

// Load saved settings
chrome.storage.sync.get(DEFAULTS, (settings) => {
  skipIntroEl.checked = settings.skipIntro;
  skipAdsEl.checked = settings.skipAds;
  profileNameEl.value = settings.profileName;
});

function saveAndNotify() {
  const settings = {
    skipIntro: skipIntroEl.checked,
    skipAds: skipAdsEl.checked,
    profileName: profileNameEl.value.trim(),
  };

  chrome.storage.sync.set(settings);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SETTINGS_UPDATE",
        settings,
      }).catch(() => {});
    }
  });
}

skipIntroEl.addEventListener("change", saveAndNotify);
skipAdsEl.addEventListener("change", saveAndNotify);
profileNameEl.addEventListener("input", saveAndNotify);


