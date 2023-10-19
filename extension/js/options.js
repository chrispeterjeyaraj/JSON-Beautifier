let defaultTabEl,
  themeModeEl,
  currentThemeEl,
  currentThemeWrapper,
  options = {};
const bucket = "JSON_VOIR_OPTIONS";
// eslint-disable-next-line
globalThis.addEventListener("load", () => {
  defaultTabEl = document.getElementById("default_tab");
  themeModeEl = document.getElementById("theme_mode");
  currentThemeEl = document.getElementById("current_theme");
  currentThemeWrapper = document.getElementById("current_theme_wrapper");
  // eslint-disable-next-line
  chrome.storage.local.get(bucket, (data) => {
    Object.assign(options, data[bucket]);
    if (Object.keys(options).length === 0) {
      options = {
        defaultTab: "parsed",
        themeMode: "auto",
        currentTheme: "dark",
      };
      // eslint-disable-next-line
      chrome.storage.local.set({ [bucket]: options });
    }
    defaultTabEl.value = options.defaultTab;
    themeModeEl.value = options.themeMode;
    if (options.themeMode === "auto") {
      currentThemeWrapper.classList.add("hidden");
    } else {
      currentThemeWrapper.classList.remove("hidden");
      currentThemeEl.value = options.currentTheme;
    }
    console.log("Current Options:", options);
  });

  defaultTabEl.addEventListener("input", (e) => {
    options.defaultTab = e.target.value;
    // eslint-disable-next-line
    chrome.storage.local.set({ [bucket]: options });
  });
  themeModeEl.addEventListener("input", (e) => {
    options.themeMode = e.target.value;
    // eslint-disable-next-line
    chrome.storage.local.set({ [bucket]: options });
    if (options.themeMode === "auto") {
      currentThemeWrapper.classList.add("hidden");
    } else {
      currentThemeWrapper.classList.remove("hidden");
      currentThemeEl.value = options.currentTheme;
    }
  });
  currentThemeEl.addEventListener("input", (e) => {
    options.currentTheme = e.target.value;
    // eslint-disable-next-line
    chrome.storage.local.set({ [bucket]: options });
  });
});
