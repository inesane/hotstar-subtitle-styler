(() => {
  "use strict";

  const STYLE_ID = "hotstar-subtitle-styler";

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

  // Known subtitle selectors for Hotstar / JioHotstar player
  // Hotstar uses shaka-player and custom overlays — these cover known structures
  const SUBTITLE_SELECTORS = [
    // Shaka player text containers
    ".shaka-text-container",
    ".shaka-text-container *",
    // Common cue containers
    '[class*="subtitle"]',
    '[class*="Subtitle"]',
    '[class*="caption"]',
    '[class*="Caption"]',
    // VTT / WebVTT rendered cues
    "video::cue",
    // Hotstar specific
    '[class*="cue"]',
    '[class*="Cue"]',
    ".player-subtitles",
    ".player-subtitles *",
    // Generic text track rendering
    ".text-track-cue",
    ".text-track-cue *",
  ].join(",\n");

  // Selectors that target the cue container (for positioning)
  const CONTAINER_SELECTORS = [
    ".shaka-text-container",
    '[class*="subtitle"]:not([class*="subtitle"] *)',
    ".player-subtitles",
  ].join(",\n");

  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  function buildTextShadow(type, color, opacity) {
    const rgba = hexToRgba(color, opacity);
    switch (type) {
      case "none":
        return "none";
      case "outline":
        return `1px 1px 0 ${rgba}, -1px -1px 0 ${rgba}, 1px -1px 0 ${rgba}, -1px 1px 0 ${rgba}, 0 1px 0 ${rgba}, 0 -1px 0 ${rgba}, 1px 0 0 ${rgba}, -1px 0 0 ${rgba}`;
      case "drop-shadow":
        return `2px 2px 4px ${rgba}`;
      case "raised":
        return `1px 1px 0 ${rgba}, 2px 2px 0 ${hexToRgba(color, opacity * 0.6)}`;
      case "depressed":
        return `-1px -1px 0 ${rgba}, -2px -2px 0 ${hexToRgba(color, opacity * 0.6)}`;
      default:
        return "none";
    }
  }

  function buildStylesheet(s) {
    if (!s.enabled) {
      return "";
    }

    const textShadowCSS = buildTextShadow(
      s.textShadow,
      s.shadowColor,
      s.shadowOpacity
    );
    const bgRgba = hexToRgba(s.bgColor, s.bgOpacity);

    return `
      /* Hotstar Subtitle Styler — injected styles */

      /* Target all known subtitle text elements */
      ${SUBTITLE_SELECTORS} {
        font-size: ${s.fontSize}px !important;
        font-family: ${s.fontFamily} !important;
        color: ${s.fontColor} !important;
        font-weight: ${s.fontWeight} !important;
        font-style: ${s.fontStyle} !important;
        text-shadow: ${textShadowCSS} !important;
        line-height: ${s.lineHeight}% !important;
        text-transform: ${s.textTransform} !important;
        -webkit-font-smoothing: antialiased !important;
      }

      /* Background styling on spans only (not container divs) */
      .shaka-text-container span,
      .shaka-text-container div > span,
      [class*="subtitle"] span,
      [class*="caption"] span,
      .player-subtitles span,
      #video-container span {
        background-color: ${bgRgba} !important;
        padding: ${s.bgPadding}px ${s.bgPadding + 16}px !important;
        border-radius: ${s.bgRadius}px !important;
      }

      /* Ensure container divs have NO background */
      .shaka-text-container,
      .shaka-text-container > div,
      [class*="subtitle"]:not(span),
      #video-container > div {
        background-color: transparent !important;
      }

      /* Container positioning — target containers and their classless child divs */
      ${CONTAINER_SELECTORS},
      .shaka-text-container > div,
      [class*="subtitle"] > div {
        bottom: ${s.bottomOffset}% !important;
      }

      /* Bold simulation via text-stroke for fonts without weight variants */
      ${s.fontWeight === "bold" || s.fontWeight === "900" ? `
      ${SUBTITLE_SELECTORS} {
        -webkit-text-stroke-width: ${s.fontWeight === "900" ? "1px" : "0.5px"} !important;
        -webkit-text-stroke-color: ${s.fontColor} !important;
      }` : ""}

      /* WebVTT ::cue pseudo-element (limited browser support for some props) */
      video::cue {
        font-size: ${s.fontSize}px !important;
        font-family: ${s.fontFamily} !important;
        color: ${s.fontColor} !important;
        font-weight: ${s.fontWeight} !important;
        font-style: ${s.fontStyle} !important;
        background-color: ${bgRgba} !important;
        text-shadow: ${textShadowCSS} !important;
        line-height: ${s.lineHeight}% !important;
        text-transform: ${s.textTransform} !important;
      }
    `;
  }

  function injectStyles(settings) {
    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = buildStylesheet(settings);
  }

  // Also apply inline styles directly to subtitle elements found in DOM,
  // in case !important CSS is overridden by the player's inline styles.
  function applyInlineOverrides(settings) {
    if (!settings.enabled) return;

    const containers = document.querySelectorAll(
      ".shaka-text-container, [class*='subtitle'], [class*='caption'], .player-subtitles"
    );

    containers.forEach((container) => {
      // Ensure container div itself has no background
      container.style.setProperty("background-color", "transparent", "important");

      // Apply vertical position to the container itself
      container.style.setProperty("bottom", settings.bottomOffset + "%", "important");

      // Also apply to direct child divs (Hotstar puts bottom on an inner classless div)
      const innerDivs = container.querySelectorAll(":scope > div");
      innerDivs.forEach((div) => {
        div.style.setProperty("bottom", settings.bottomOffset + "%", "important");
        div.style.setProperty("background-color", "transparent", "important");
      });

      // Apply text styles to all child elements with text
      const textEls = container.querySelectorAll("span, div, p");
      textEls.forEach((el) => {
        if (el.textContent.trim().length === 0) return;

        el.style.setProperty("font-size", settings.fontSize + "px", "important");
        el.style.setProperty("color", settings.fontColor, "important");
        el.style.setProperty("font-weight", settings.fontWeight, "important");
        el.style.setProperty("font-style", settings.fontStyle, "important");
        el.style.setProperty(
          "text-shadow",
          buildTextShadow(
            settings.textShadow,
            settings.shadowColor,
            settings.shadowOpacity
          ),
          "important"
        );
        el.style.setProperty("line-height", settings.lineHeight + "%", "important");
        el.style.setProperty("text-transform", settings.textTransform, "important");

        if (settings.fontFamily !== "inherit") {
          el.style.setProperty("font-family", settings.fontFamily, "important");
        }

        // Simulate bold via text-stroke when font doesn't support weight changes
        if (settings.fontWeight === "bold" || settings.fontWeight === "900") {
          var strokeWidth = settings.fontWeight === "900" ? "1px" : "0.5px";
          el.style.setProperty("-webkit-text-stroke-width", strokeWidth, "important");
          el.style.setProperty("-webkit-text-stroke-color", settings.fontColor, "important");
        } else {
          el.style.setProperty("-webkit-text-stroke-width", "0px", "important");
        }

        // Only apply background/padding to span elements (not container divs)
        if (el.tagName === "SPAN") {
          el.style.setProperty(
            "background-color",
            hexToRgba(settings.bgColor, settings.bgOpacity),
            "important"
          );
          el.style.setProperty(
            "padding",
            `${settings.bgPadding}px ${settings.bgPadding + 16}px`,
            "important"
          );
          el.style.setProperty("border-radius", settings.bgRadius + "px", "important");
        } else {
          el.style.setProperty("background-color", "transparent", "important");
        }
      });
    });
  }

  // Watch for dynamically added subtitle elements
  let currentSettings = { ...DEFAULTS };

  const observer = new MutationObserver((mutations) => {
    if (!currentSettings.enabled) return;

    let hasSubtitleChange = false;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (
            el.matches?.(".shaka-text-container, [class*='subtitle'], [class*='caption']") ||
            el.querySelector?.(".shaka-text-container, [class*='subtitle'], [class*='caption']") ||
            el.closest?.(".shaka-text-container")
          ) {
            hasSubtitleChange = true;
            break;
          }
        }
      }
      if (hasSubtitleChange) break;
    }

    if (hasSubtitleChange) {
      applyInlineOverrides(currentSettings);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SUBTITLE_STYLE_UPDATE") {
      currentSettings = message.settings;
      injectStyles(currentSettings);
      applyInlineOverrides(currentSettings);
    }
  });

  // Initial load
  chrome.storage.sync.get(DEFAULTS, (settings) => {
    currentSettings = settings;
    injectStyles(settings);
    // Small delay to let player render subtitles first
    setTimeout(() => applyInlineOverrides(settings), 1000);
    setTimeout(() => applyInlineOverrides(settings), 3000);
  });
})();
