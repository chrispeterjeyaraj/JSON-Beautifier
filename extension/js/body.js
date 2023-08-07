let btn_parsed,
  btn_parsed_raw,
  btn_raw,
  btn_toolbar,
  btn_search_toolbar,
  toolbar,
  searchToolbar,
  parsedCode,
  rawCode,
  isToolbarOpen = false,
  isSearchToolbarOpen = false;
const options = { defaultTab: "parsed", themeMode: "auto", currentTheme: "dark" },
hotkeys = {
    toolbar: "t",
    search: "s",
    parsed: "p",
    parsed_raw: "r",
    raw: "r",
    dark: "d",
  };
function openView(type) {
  if (type != "parsed" && type != "raw" && type != "parsed_raw") {
    throw new TypeError(type + " is not a valid type!");
  }
  if (type == "parsed") {
    parsedRawCode.hidden = true;
    rawCode.hidden = true;
    parsedCode.hidden = false;
    btn_parsed.classList.add("active");
    btn_parsed_raw.classList.remove("active");
    btn_raw.classList.remove("active");
  } else if (type == "raw") {
    parsedRawCode.hidden = true;
    parsedCode.hidden = true;
    rawCode.hidden = false;
    btn_parsed.classList.remove("active");
    btn_parsed_raw.classList.remove("active");
    btn_raw.classList.add("active");
  } else if (type == "parsed_raw") {
    rawCode.hidden = true;
    parsedCode.hidden = true;
    parsedRawCode.hidden = false;
    btn_parsed.classList.remove("active");
    btn_raw.classList.remove("active");
    btn_parsed_raw.classList.add("active");
  }
}
function toggleToolbar(bool) {
  if (bool != undefined) {
    if (bool == false) {
      toolbar.style.opacity = "0";
      setTimeout(() => {
        toolbar.style.display = "none";
      }, 170);
      btn_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M4%2018h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zm0-5h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zM3%207c0%20.55.45%201%201%201h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201z%22%2F%3E%3C%2Fsvg%3E";
      isToolbarOpen = true;
    } else {
      toolbar.style.display = "inline-flex";
      setTimeout(() => {
        toolbar.style.opacity = "1";
      }, 30);
      btn_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012%2019%206.41z%22%2F%3E%3C%2Fsvg%3E";
      isToolbarOpen = false;
    }
  } else {
    if (isToolbarOpen) {
      toolbar.style.opacity = "0";
      setTimeout(() => {
        toolbar.style.display = "none";
      }, 170);
      btn_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M4%2018h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zm0-5h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zM3%207c0%20.55.45%201%201%201h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201z%22%2F%3E%3C%2Fsvg%3E";
      isToolbarOpen = false;
    } else {
      toolbar.style.display = "inline-flex";
      setTimeout(() => {
        toolbar.style.opacity = "1";
      }, 30);
      btn_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012%2019%206.41z%22%2F%3E%3C%2Fsvg%3E";
      isToolbarOpen = true;
    }
  }
}

function toggleSearchToolbar(bool) {
  if (bool != undefined) {
    if (bool == false) {
      searchToolbar.style.opacity = "0";
      setTimeout(() => {
        searchToolbar.style.display = "none";
      }, 170);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M4%2018h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zm0-5h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zM3%207c0%20.55.45%201%201%201h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201z%22%2F%3E%3C%2Fsvg%3E";
      isSearchToolbarOpen = true;
    } else {
      searchToolbar.style.display = "inline-flex";
      setTimeout(() => {
        searchToolbar.style.opacity = "1";
      }, 30);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='50px' height='50px'%3E%3Cpath d='M 21 3 C 11.654545 3 4 10.654545 4 20 C 4 29.345455 11.654545 37 21 37 C 24.701287 37 28.127393 35.786719 30.927734 33.755859 L 44.085938 46.914062 L 46.914062 44.085938 L 33.875 31.046875 C 36.43682 28.068316 38 24.210207 38 20 C 38 10.654545 30.345455 3 21 3 z M 21 5 C 29.254545 5 36 11.745455 36 20 C 36 28.254545 29.254545 35 21 35 C 12.745455 35 6 28.254545 6 20 C 6 11.745455 12.745455 5 21 5 z'/%3E%3C/svg%3E";
      isSearchToolbarOpen = false;
      _searchJSON("");
    }
  } else {
    if (isSearchToolbarOpen) {
      searchToolbar.style.opacity = "0";
      setTimeout(() => {
        searchToolbar.style.display = "none";
      }, 170);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='50px' height='50px'%3E%3Cpath d='M 21 3 C 11.654545 3 4 10.654545 4 20 C 4 29.345455 11.654545 37 21 37 C 24.701287 37 28.127393 35.786719 30.927734 33.755859 L 44.085938 46.914062 L 46.914062 44.085938 L 33.875 31.046875 C 36.43682 28.068316 38 24.210207 38 20 C 38 10.654545 30.345455 3 21 3 z M 21 5 C 29.254545 5 36 11.745455 36 20 C 36 28.254545 29.254545 35 21 35 C 12.745455 35 6 28.254545 6 20 C 6 11.745455 12.745455 5 21 5 z'/%3E%3C/svg%3E";
      isSearchToolbarOpen = false;
      _searchJSON("");
    } else {
      searchToolbar.style.display = "inline-flex";
      setTimeout(() => {
        searchToolbar.style.opacity = "1";
      }, 30);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012%2019%206.41z%22%2F%3E%3C%2Fsvg%3E";
      isSearchToolbarOpen = true;
    }
  }
}

function _prepareBody() {
  document.body.innerHTML = `<svg class="defs_svg" xmlns="http://www.w3.org/2000/svg" height="0" width="0" aria-hidden="true">
    <defs>
      <clipPath fill-rule="evenodd" clip-rule="evenodd" id="chevron-down">
        <path
          d="M8.973 11.331L13.8746 6.42937L14.5721 7.12462L9.3195 12.375H8.62425L3.375 7.12462L4.07137 6.42937L8.973 11.331Z">
        </path>
      </clipPath>
      <clipPath fill-rule="evenodd" clip-rule="evenodd" id="chevron-right">
        <path
          d="M11.331 9.027L6.42938 4.12538L7.12463 3.42788L12.375 8.6805V9.37575L7.12463 14.625L6.42938 13.9286L11.331 9.027V9.027Z">
        </path>
      </clipPath>
    </defs>
  </svg>
    <div class="JB_actions notranslate" id="actions" translate="no">
    <div class="JB_json_toolbar" id="json_toolbar">
      <button id="toggle_dark" class="JB_toggle_dark JB_cr-button" aria-label="Toggle Dark Mode: D key" title="Toggle Dark Mode: D key"role="button">
        <img width="24px" height="24px"
          src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224px%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224px%22%20fill%3D%22rgb(30,30,30)%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M20%2015.31L23.31%2012%2020%208.69V4h-4.69L12%20.69%208.69%204H4v4.69L.69%2012%204%2015.31V20h4.69L12%2023.31%2015.31%2020H20v-4.69zM12%2018V6c3.31%200%206%202.69%206%206s-2.69%206-6%206z%22%2F%3E%3C%2Fsvg%3E"
          alt="Toggle Dark mode" /></button>
      <div class="JB_button-wrapper">
        <button type="button" class="JB_cr-button ${
          options.defaultTab == "parsed" ? "active" : ""
        }" aria-label="Toggle Parsed Format: P key" title="Toggle Parsed Format: P key" id="open_parsed">Parsed</button>
        <button type="button" class="JB_cr-button ${
          options.defaultTab == "parsed_raw" ? "active" : ""
        }" aria-label="Toggle Formatted Raw Format: Shift + R key" title="Toggle Formatted Raw Format: Shift + R key" id="open_parsed_raw">Formatted Raw</button>
        <button type="button" class="JB_cr-button ${
          options.defaultTab == "raw" ? "active" : ""
        }" aria-label="Toggle Raw Format: R key" title="Toggle Raw Format: R key" id="open_raw">Raw</button>
      </div>
    </div>
    <button type="button" class="JB_toggle_toolbar JB_cr-button" aria-label="Content Format" title="Content Format" id="toggle_toolbar"><img width="24px" height="24px" alt="Toggle Toolbar" src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M4%2018h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zm0-5h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zM3%207c0%20.55.45%201%201%201h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201z%22%2F%3E%3C%2Fsvg%3E"/></button>
  </div>


   <div class="JB_search notranslate" id="search" translate="no">
    <div class="JB_json_toolbar" id="json_search_toolbar">
      <div class="JB_button-wrapper">
        <input id="json_search_text" class="JB_search_textbox" placeholder="Enter keys/values to search"/>
      </div>
    </div>
    <button type="button" class="JB_toggle_toolbar JB_cr-button" aria-label="Search JSON (comma seperated multiple keys / values allowed, search is case sensitive)" title="Search JSON (comma seperated multiple keys / values allowed, search is case sensitive)" id="toggle_search_toolbar"><img width="24px" height="24px" alt="Toggle Toolbar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='50px' height='50px'%3E%3Cpath d='M 21 3 C 11.654545 3 4 10.654545 4 20 C 4 29.345455 11.654545 37 21 37 C 24.701287 37 28.127393 35.786719 30.927734 33.755859 L 44.085938 46.914062 L 46.914062 44.085938 L 33.875 31.046875 C 36.43682 28.068316 38 24.210207 38 20 C 38 10.654545 30.345455 3 21 3 z M 21 5 C 29.254545 5 36 11.745455 36 20 C 36 28.254545 29.254545 35 21 35 C 12.745455 35 6 28.254545 6 20 C 6 11.745455 12.745455 5 21 5 z'/%3E%3C/svg%3E"/></button>
  </div>

  <div class="JB_parsed notranslate" id="parsed" translate="no" ${
    options.defaultTab == "parsed" ? "" : "hidden"
  }></div>
  <pre class="JB_raw JB_dark notranslate" id="parsed_raw" translate="no" ${
    options.defaultTab == "parsed_raw" ? "" : "hidden"
  }></pre>
  <pre class="JB_raw JB_dark notranslate" id="raw" translate="no" ${
    options.defaultTab == "raw" ? "" : "hidden"
  }></pre>`;
  (btn_parsed = document.getElementById("open_parsed")),
    (btn_parsed_raw = document.getElementById("open_parsed_raw")),
    (btn_raw = document.getElementById("open_raw")),
    (parsedCode = document.getElementById("parsed")),
    (parsedRawCode = document.getElementById("parsed_raw")),
    (rawCode = document.getElementById("raw")),
    (toolbar = document.getElementById("json_toolbar")),
    (searchToolbar = document.getElementById("json_search_toolbar")),
    (btn_toolbar = document.getElementById("toggle_toolbar"));
  (btn_search_toolbar = document.getElementById("toggle_search_toolbar")),
    (input_search_text = document.getElementById("json_search_text")),
    btn_parsed.addEventListener("click", function () {
      openView("parsed");
    });
  btn_parsed_raw.addEventListener("click", function () {
    openView("parsed_raw");
  });
  btn_raw.addEventListener("click", function () {
    openView("raw");
  });
  btn_toolbar.addEventListener("click", function () {
    toggleToolbar();
  });
  btn_search_toolbar.addEventListener("click", function () {
    toggleSearchToolbar();
    input_search_text.focus();
    input_search_text.value = "";
  });
  input_search_text.addEventListener("keydown", function (evt) {
    if (evt.key === "Enter") {
      _searchJSON(input_search_text.value);
    }
  });
  document.getElementById("toggle_dark").addEventListener("click", function () {
    toggleDarkMode();
  });

  if (options.themeMode == "auto") {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      toggleDarkMode(false);
    } else {
      toggleDarkMode(true);
    }
    window.matchMedia &&
      window
        .matchMedia("(prefers-color-scheme: light)")
        .addEventListener("change", function (e) {
          if (options.themeMode == "auto") {
            if (e.matches) {
              toggleDarkMode(false);
            } else {
              toggleDarkMode(true);
            }
          }
        });
  }
  if (options.themeMode == "manual") {
    darkbool = options.currentTheme == "dark" ? true : false;
    toggleDarkMode(darkbool);
  }
  globalThis.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.isContentEditable) {
      return false;
    }
    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.shiftKey) {
      if (
        e.key === hotkeys.parsed_raw ||
        e.code === "Key" + hotkeys.parsed_raw.toUpperCase()
      ) {
        e.preventDefault();
        openView("parsed_raw");
      }
    }
    if (!e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      if (
        e.key === hotkeys.toolbar ||
        e.code === "Key" + hotkeys.toolbar.toUpperCase()
      ) {
        e.preventDefault();
        toggleToolbar();
      }
      if (
        e.key === hotkeys.dark ||
        e.code === "Key" + hotkeys.dark.toUpperCase()
      ) {
        e.preventDefault();
        toggleDarkMode();
      }
      if (
        e.key === hotkeys.parsed ||
        e.code === "Key" + hotkeys.parsed.toUpperCase()
      ) {
        e.preventDefault();
        openView("parsed");
      }
      if (
        e.key === hotkeys.raw ||
        e.code === "Key" + hotkeys.raw.toUpperCase()
      ) {
        e.preventDefault();
        openView("raw");
      }
    }
  });
}
