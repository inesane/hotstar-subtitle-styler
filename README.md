# JioHotstar Tools

A collection of Chrome extensions to enhance the [JioHotstar](https://www.hotstar.com) viewing experience.

## Extensions

### 1. Subtitle Styler (`chrome-extension/`)

Customize subtitle appearance on JioHotstar. Hotstar doesn't provide built-in subtitle customization — this extension fills that gap.

**Features:**
- **Font**: Size, family, color, weight (bold via text-stroke), italic
- **Background**: Color and opacity (applied to text spans only, not the container)
- **Text Shadow**: None, outline, drop shadow, raised, depressed — with color and opacity controls
- **Layout**: Vertical position, line spacing, text transform

### 2. Auto Skip (`auto-skip/`)

Automatically skip intros and bypass long mid-roll ad breaks.

**Features:**
- **Skip Intro / Recap**: Auto-clicks skip buttons when they appear
- **Skip Long Ads**: Detects mid-roll ad breaks (the "1 of 3" counter) and refreshes the page to get a shorter ad instead
- **Auto Fullscreen**: Restores fullscreen after an ad refresh
- **Profile Reselect**: Auto-selects your profile if Hotstar prompts "Who's Watching?" after a refresh

## Install

1. Clone this repo or download as ZIP
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the extension folder (`chrome-extension/` or `auto-skip/`)
5. Repeat step 4 for the other extension if desired

## How They Work

### Subtitle Styler
- A content script injects into Hotstar pages and overrides subtitle styles via CSS `!important` rules and inline style overrides
- A `MutationObserver` watches for dynamically added subtitle elements and applies styles in real-time
- Settings are synced via `chrome.storage.sync` and persist across sessions

### Auto Skip
- A `MutationObserver` and polling interval watch for skip intro/recap buttons and auto-click them
- Ad detection scans for the "X of Y" counter text inside the video player area
- On ad detection, the page refreshes to get a shorter ad (Hotstar resumes playback from where it left off)
- After refresh, the extension polls for the video element, then sends a trusted `F` keypress via `chrome.debugger` to restore player fullscreen
- Settings (skip intro, skip ads, profile name) are configurable via the extension popup
