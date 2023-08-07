const bucket = "JSON_FORMATTER_OPTIONS";
let isDark = true,
    tree;

/**
 * DOM manipulation Functions
 */
function _setupFormatter(str) {
  let code;
  if (typeof str == "object") {
    code = JSON.stringify(str);
    code = JSON.stringify(JSON.parse(formatHTML(JSON.stringify(code))));
  }
  if (typeof str == "string") {
    code = JSON.stringify(JSON.parse(formatHTML(str)));
  }
  parsedRawCode.innerHTML = JSON.stringify(JSON.parse(code), undefined, 2);
  rawCode.innerHTML = JSON.stringify(JSON.parse(code));
  tree = _createTree(code);
  const thme = isDark ? "dark" : "light";
  const renderedCode = _render(tree, parsedCode, { theme: thme, string: true });
  _expandChildren(tree);
  return [renderedCode, JSON.stringify(JSON.parse(code), undefined, 2)];
}

function _formatJSON(str) {
  let obj;
  try {
    obj = JSON.parse(str);
  } catch (_e) {
    // Not JSON
  }
  if (typeof obj !== "object" && typeof obj !== "array") return;
  const formated = _setupFormatter(JSON.stringify(obj));
  setTimeout(function () {
    try {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("js/messenger.js");
      document.head.appendChild(script);
      setTimeout(() => {
        postMessage({ type: "real_json", msg: JSON.parse(formated[1]) });
      }, 100);
    } catch (_err) {
      console.log(
        "JSON Formatter: Sorry but you can't access original JSON in console in this page."
      );
    }
  }, 100);
}
function toggleDarkMode(bool) {
  dontSave = options.themeMode == "auto" ? true : false;
  if (bool != undefined) {
    if (bool == true) {
      document.body.classList.add("JB_dark", "JB_");
      document.querySelectorAll(".JB_json-container") &&
        document.querySelectorAll(".JB_json-container").forEach((e) => {
          e.classList.add("JB_dark");
        });
      document.querySelectorAll(".JB_raw") &&
        document.querySelectorAll(".JB_raw").forEach((e) => {
          e.classList.add("JB_dark");
        });
      isDark = true;
      if (!dontSave) {
        options.currentTheme = isDark ? "dark" : "light";
        chrome.storage.local.set({ [bucket]: options });
      }
    } else {
      document.querySelectorAll(".JB_dark") &&
        document.querySelectorAll(".JB_dark").forEach((e) => {
          e.classList.remove("JB_dark");
        });
      isDark = false;
      if (!dontSave) {
        options.currentTheme = isDark ? "dark" : "light";
        chrome.storage.local.set({ [bucket]: options });
      }
    }
  } else {
    if (isDark) {
      document.querySelectorAll(".JB_dark") &&
        document.querySelectorAll(".JB_dark").forEach((e) => {
          e.classList.remove("JB_dark");
        });
      isDark = false;
      if (!dontSave) {
        options.currentTheme = isDark ? "dark" : "light";
        chrome.storage.local.set({ [bucket]: options });
      }
    } else {
      document.body.classList.add("JB_dark", "JB_");
      document.querySelectorAll(".JB_json-container") &&
        document.querySelectorAll(".JB_json-container").forEach((e) => {
          e.classList.add("JB_dark");
        });
      document.querySelectorAll(".JB_raw") &&
        document.querySelectorAll(".JB_raw").forEach((e) => {
          e.classList.add("JB_dark");
        });
      isDark = true;
      if (!dontSave) {
        options.currentTheme = isDark ? "dark" : "light";
        chrome.storage.local.set({ [bucket]: options });
      }
    }
  }
}

chrome.storage.local.get(bucket, (data) => {
  Object.assign(options, data[bucket]);
  if (Object.keys(options).length === 0) {
    options = {
      defaultTab: "parsed",
      themeMode: "auto",
      currentTheme: "dark",
    };
    chrome.storage.local.set({ [bucket]: options });
  }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[bucket]?.newValue) {
    Object.assign(options, changes[bucket].newValue);
    if (options.themeMode == "manual") {
      const darkbool = options.currentTheme == "dark" ? true : false;
      toggleDarkMode(darkbool);
    }
    if (options.themeMode == "auto") {
      const darkbool = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      toggleDarkMode(darkbool);
    }
  }
});
