let orgJSON,
  btn_parsed,
  btn_parsed_raw,
  btn_raw,
  btn_toolbar,
  btn_search_toolbar,
  toolbar,
  searchToolbar,
  parsedCode,
  parsedRawCode,
  input_search_text,
  darkbool,
  rawCode,
  tree,
  isDark = true,
  isToolbarOpen = false,
  isSearchToolbarOpen = false,
  options = { defaultTab: "parsed", themeMode: "auto", currentTheme: "dark" };

const bucket = "JSON_VOIR_OPTIONS",
  hotkeys = {
    toolbar: "t",
    search: "s",
    parsed: "p",
    parsed_raw: "r",
    raw: "r",
    dark: "d",
  };

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
});

// eslint-disable-next-line
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[bucket].newValue) {
    Object.assign(options, changes[bucket].newValue);
    if (options.themeMode == "manual") {
      const darkbool = options.currentTheme == "dark" ? true : false;
      toggleDarkMode(darkbool);
    }
    if (options.themeMode == "auto") {
      const darkbool = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      toggleDarkMode(darkbool);
    }
  }
});

/**
 * Parses a JSON string and formats it.
 *
 * @param {String} str - The JSON string to be parsed and formatted.
 * @return {undefined} This function does not return a value.
 */
function formatJSON(str) {
  try {
    const obj = JSON.parse(str);
    if (!Array.isArray(obj) && typeof obj === "object") {
      const formated = setupFormatter(JSON.stringify(obj));
      loadMessengerScript(formated);
    } else {
      console.log("Invalid JSON format.");
    }
  } catch (error) {
    console.error("JSON parsing error:", error);
  }
}

/**
 * Loads the messenger script by creating a new script element and adding it to the head of the document.
 *
 * @param {Object} formattedJSON - The formatted JSON object to be passed as a message to the loaded script.
 * @return {undefined} This function does not return a value.
 */
function loadMessengerScript(formattedJSON) {
  const script = document.createElement("script");
  // eslint-disable-next-line
  script.src = chrome.runtime.getURL("js/messenger.js");
  script.onload = () => {
    postMessage({ type: "real_json", msg: JSON.parse(formattedJSON[1]) });
  };
  script.onerror = (error) => {
    console.error("Script load error:", error);
  };
  document.head.appendChild(script);
}

function deepClone(source) {
  const temp = [];
  if (source) {
    return JSON.parse(
      JSON.stringify(source, (_key, value) => {
        if (typeof value === "object" && value !== null) {
          // deno-lint-ignore no-cond-assign
          if (temp.indexOf(value) !== -1) {
            return undefined;
          }
          temp.push(value);
        }
        return value;
      }),
    );
  }
  return {};
}

// Recursive deepFilter function to filter based on search keys
const deepFilter = (obj, searchText) => {
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "object") {
      if (!searchText.includes(key)) {
        if (Array.isArray(val)) {
          const filteredArray = val.filter((item) => {
            if (typeof item === "object") {
              return deepFilter(item, searchText);
            } else {
              return searchText.some((query) =>
                item.toString().includes(query),
              );
            }
          });
          if (filteredArray.length === 0) {
            delete obj[key];
          } else {
            obj[key] = filteredArray;
          }
        } else {
          deepFilter(val, searchText);
        }
      }
    } else {
      const filteredSearch = searchText.filter(
        (item) =>
          key.toString().includes(item) || obj[key].toString().includes(item),
      );
      if (filteredSearch.length === 0) {
        delete obj[key];
      }
    }
    if (
      (Array.isArray(val) && val.length === 0) ||
      JSON.stringify(val) === "{}" ||
      JSON.stringify(val) === "[]"
    ) {
      delete obj[key];
    }
  }
  return obj;
};

// Search through the JSON recursively to find out matched items
function searchJSON(searchText) {
  if (searchText == "") {
    formatJSON(JSON.stringify(orgJSON));
  } else {
    const searchKeys = searchText.split(",");
    const filterJSON = deepClone(orgJSON);
    const result = deepFilter(filterJSON, searchKeys);
    if (Object.entries(result).length > 0) {
      formatJSON(JSON.stringify(result));
    } else {
      formatJSON(
        JSON.stringify({
          errorCode: "No Match",
          error: "No match for the key/value entered for search",
          searchText: searchText,
        }),
      );
    }
  }
}

function _() {
  let preCode;
  if (
    !document ||
    !document.body ||
    !document.body.childNodes ||
    document.body === null ||
    document.body === undefined ||
    document.body.childNodes === null ||
    document.body.childNodes === undefined
  ) {
    return false;
  }
  if (document.body.childNodes.length !== 1) {
    let tb = false;
    try {
      JSON.parse(document.body.innerText);
    } catch (_e) {
      tb = true;
    }
    if (tb) {
      return false;
    }
  }
  const pre = document.body.childNodes[0];
  pre.hidden = true;
  var codeTimeout = setTimeout(function () {
    pre.hidden = false;
  }, 1000);
  if (pre.tagName === "PRE" && pre.nodeName === "PRE" && pre.nodeType === 1) {
    preCode = pre.innerText;
  } else if (
    pre.tagName === "DIV" &&
    pre.nodeName === "DIV" &&
    pre.nodeType === 1
  ) {
    preCode = pre.innerText;
  } else if (
    pre.tagName === "CODE" &&
    pre.nodeName === "CODE" &&
    pre.nodeType === 1
  ) {
    preCode = pre.innerText;
  } else if (
    pre.tagName === undefined &&
    pre.nodeName === "#text" &&
    pre.nodeType === 3
  ) {
    preCode = pre.nodeValue;
  } else {
    pre.hidden = false;
    return false;
  }
  const jsonLen = (preCode || "").length;
  if (jsonLen > 100000000 || jsonLen === 0) {
    pre.hidden = false;
    console.log("JSON Formatter: JSON too large to format!");
    return false;
  }
  let isJSON = false,
    obj;
  try {
    obj = JSON.parse(preCode);
    while (typeof obj === "string") {
      obj = JSON.parse(obj);
    }
    if (
      typeof obj === "number" ||
      typeof obj === "boolean" ||
      obj === null ||
      typeof obj === "undefined" ||
      isNaN(obj)
    ) {
      pre.hidden = false;
      return false;
    }
    if (Array.isArray(obj) && obj.length === 0) {
      pre.hidden = false;
      return false;
    }
    if (typeof obj === "object" && Object.keys(obj).length === 0) {
      pre.hidden = false;
      return false;
    }
    isJSON = true;
    clearTimeout(codeTimeout);
  } catch (_e) {
    // Not JSON
    pre.hidden = false;
  }
  if (isJSON) {
    prepareBody();
    orgJSON = obj;
    formatJSON(JSON.stringify(orgJSON));
  }
}
// eslint-disable-next-line
globalThis.addEventListener("load", _);

function expandedTemplate(params = {}) {
  const { key, size } = params;
  return `
    <div class="line">
      <div class="caret-icon"><i class="codicon codicon-chevron-right"></i></div>
      <div class="json-key">${key}</div>
      <div class="json-size">${size}</div>
    </div>
  `;
}

function notExpandedTemplate(params = {}) {
  const { key, value, type } = params;
  return `
    <div class="line">
      <div class="empty-icon"></div>
      <div class="json-key">${key}</div>
      <div class="json-separator">:</div>
      <div class="json-value json-${type}">${value}</div>
    </div>
  `;
}

function hideNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.add("hide");
    if (child.isExpanded) {
      hideNodeChildren(child);
    }
  });
}

function showNodeChildren(node) {
  node.children.forEach((child) => {
    child.el.classList.remove("hide");
    if (child.isExpanded) {
      showNodeChildren(child);
    }
  });
}

function setCaretIconDown(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector(".codicon");
    if (icon) {
      icon.classList.replace("codicon-chevron-right", "codicon-chevron-down");
    }
  }
}

function setCaretIconRight(node) {
  if (node.children.length > 0) {
    const icon = node.el.querySelector(".codicon");
    if (icon) {
      icon.classList.replace("codicon-chevron-down", "codicon-chevron-right");
    }
  }
}

function toggleNode(node) {
  if (node.isExpanded) {
    node.isExpanded = false;
    setCaretIconRight(node);
    hideNodeChildren(node);
  } else {
    node.isExpanded = true;
    setCaretIconDown(node);
    showNodeChildren(node);
  }
}

function createContainerElement(dark) {
  const el = document.createElement("div");
  el.className = dark ? "JB_json-container JB_dark" : "JB_json-container";
  return el;
}

/**
 * Create node html element
 * @param {object} node
 * @return html element
 */
function createNodeElement(node) {
  const el = document.createElement("div");

  const getSizeString = (node) => {
    const len = node.children.length;
    if (node.type === "array" || node.type === "object") return `(${len})`;
    return null;
  };

  if (node.children.length > 0) {
    el.innerHTML = expandedTemplate({
      key: node.key,
      size: getSizeString(node),
    });

    const caretEl = el.querySelector(".caret-icon");
    caretEl.addEventListener("click", () => {
      toggleNode(node);
    });
  } else {
    let val = node.value;
    if (typeof node.value == "string") {
      val = '"' + node.value + '"';
      val = linkify(formatHTML(val));
    }
    const ky = linkify(formatHTML(node.key));
    el.innerHTML = notExpandedTemplate({
      key: ky,
      value: val,
      type: typeof node.value,
    });
  }

  const lineEl = el.children[0];

  if (node.parent !== null) {
    lineEl.classList.add("hide");
  }

  lineEl.style = "margin-left: " + node.depth * 18 + "px;";

  return lineEl;
}

/**
 * Get value data type
 * @param {*} data
 */
function getDataType(val) {
  let type = typeof val;
  if (Array.isArray(val)) type = "array";
  if (val === null) type = "null";
  return type;
}

/**
 * Recursively traverse Tree object
 * @param {Object} node
 * @param {Callback} callback
 */
function traverseTree(node, callback) {
  callback(node);
  if (node.children.length > 0) {
    node.children.forEach((child) => {
      traverseTree(child, callback);
    });
  }
}

/**
 * Create node object
 * @param {object} opt options
 * @return {object}
 */
function createNode(opt = {}) {
  var isOptOwnProp = Object.prototype.hasOwnProperty.call(opt, "value");
  return {
    key: opt.key || null,
    parent: opt.parent || null,
    value: isOptOwnProp ? opt.value : null,
    isExpanded: opt.isExpanded || false,
    type: opt.type || null,
    children: opt.children || [],
    el: opt.el || null,
    depth: opt.depth || 0,
  };
}

/**
 * Create subnode for node
 * @param {object} Json data
 * @param {object} node
 */
function createSubnode(data, node) {
  if (typeof data === "object") {
    for (const key in data) {
      const child = createNode({
        value: data[key],
        key: key,
        depth: node.depth + 1,
        type: getDataType(data[key]),
        parent: node,
      });
      node.children.push(child);
      createSubnode(data[key], child);
    }
  }
}

/**
 * Create tree
 * @param {object | string} jsonData
 * @return {object}
 */
function createTree(jsonData) {
  const data =
    typeof jsonData === "string" ? JSON.parse(formatHTML(jsonData)) : jsonData;

  const rootNode = createNode({
    value: data,
    key: "ROOT",
    type: getDataType(data),
  });
  createSubnode(data, rootNode);
  return rootNode;
}

/**
 * Render tree into DOM container
 * @param {object} tree
 * @param {htmlElement} targetElement
 */
function render(
  tree,
  targetElement,
  option = { theme: "dark", string: false },
) {
  if (option.theme != "dark" && option.theme != "light") {
    throw new TypeError("Not a valid theme name!");
  }
  if (option.string === undefined || typeof (option.string !== "boolean")) {
    option.string = false;
  }
  const isDark = option.theme == "dark" ? true : false;
  const containerEl = createContainerElement(isDark);

  traverseTree(tree, function (node) {
    node.el = createNodeElement(node);
    containerEl.appendChild(node.el);
  });
  const removeChilds = function (node) {
    let last;
    // deno-lint-ignore no-cond-assign
    while ((last = node.lastChild)) node.removeChild(last);
  };
  removeChilds(targetElement);
  targetElement.appendChild(containerEl);
  if (option.string == true) {
    return containerEl.outerHTML;
  } else {
    return containerEl;
  }
}

function expandChildren(node) {
  traverseTree(node, function (child) {
    child.el.classList.remove("hide");
    child.isExpanded = true;
    setCaretIconDown(child);
  });
}

// function collapseChildren(node) {
//   traverseTree(node, function (child) {
//     child.isExpanded = false;
//     if (child.depth > node.depth) child.el.classList.add("hide");
//     setCaretIconRight(child);
//   });
// }

/**
 * HTML Formatter
 */
function formatHTML(html) {
  let str = html;
  str = str.replace(/</gm, "&lt;");
  str = str.replace(/>/gm, "&gt;");
  return str;
}

/**
 * DOM manipulation Functions
 */

function prepareBody() {
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
    // input_search_text.value = "";
    // setTimeout(() => {
    //   searchJSON("");
    // }, 30);
  });
  input_search_text.addEventListener("keydown", function (evt) {
    if (evt.key === "Enter") {
      searchJSON(input_search_text.value);
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
  // eslint-disable-next-line
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
function setupFormatter(str) {
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
  tree = createTree(code);
  const thme = isDark ? "dark" : "light";
  const renderedCode = render(tree, parsedCode, { theme: thme, string: true });
  expandChildren(tree);
  return [renderedCode, JSON.stringify(JSON.parse(code), undefined, 2)];
}

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
      // setTimeout(() => {
      searchToolbar.style.display = "none";
      // }, 170);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M4%2018h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zm0-5h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201s.45%201%201%201zM3%207c0%20.55.45%201%201%201h16c.55%200%201-.45%201-1s-.45-1-1-1H4c-.55%200-1%20.45-1%201z%22%2F%3E%3C%2Fsvg%3E";
      isSearchToolbarOpen = true;
    } else {
      searchToolbar.style.display = "inline-flex";
      // setTimeout(() => {
      searchToolbar.style.opacity = "1";
      // }, 30);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='50px' height='50px'%3E%3Cpath d='M 21 3 C 11.654545 3 4 10.654545 4 20 C 4 29.345455 11.654545 37 21 37 C 24.701287 37 28.127393 35.786719 30.927734 33.755859 L 44.085938 46.914062 L 46.914062 44.085938 L 33.875 31.046875 C 36.43682 28.068316 38 24.210207 38 20 C 38 10.654545 30.345455 3 21 3 z M 21 5 C 29.254545 5 36 11.745455 36 20 C 36 28.254545 29.254545 35 21 35 C 12.745455 35 6 28.254545 6 20 C 6 11.745455 12.745455 5 21 5 z'/%3E%3C/svg%3E";
      isSearchToolbarOpen = false;
      // searchJSON("");
    }
  } else {
    if (isSearchToolbarOpen) {
      searchToolbar.style.opacity = "0";
      // setTimeout(() => {
      searchToolbar.style.display = "none";
      // }, 170);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50' width='50px' height='50px'%3E%3Cpath d='M 21 3 C 11.654545 3 4 10.654545 4 20 C 4 29.345455 11.654545 37 21 37 C 24.701287 37 28.127393 35.786719 30.927734 33.755859 L 44.085938 46.914062 L 46.914062 44.085938 L 33.875 31.046875 C 36.43682 28.068316 38 24.210207 38 20 C 38 10.654545 30.345455 3 21 3 z M 21 5 C 29.254545 5 36 11.745455 36 20 C 36 28.254545 29.254545 35 21 35 C 12.745455 35 6 28.254545 6 20 C 6 11.745455 12.745455 5 21 5 z'/%3E%3C/svg%3E";
      isSearchToolbarOpen = false;
      // searchJSON("");
    } else {
      searchToolbar.style.display = "inline-flex";
      // setTimeout(() => {
      searchToolbar.style.opacity = "1";
      // }, 30);
      btn_search_toolbar.querySelector("img").src =
        "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0V0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012%2019%206.41z%22%2F%3E%3C%2Fsvg%3E";
      isSearchToolbarOpen = true;
    }
  }
}

function toggleDarkMode(bool) {
  const dontSave = options.themeMode == "auto" ? true : false;
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
        chrome.storage.local.set({ [bucket]: options });
      }
    }
  }
}

function linkify(inputText) {
  // URLs starting with http://, https://, or ftp://
  let P1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim,
    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    P2 = /(^|[^/])(www\.[\S]+(\b|$))/gim,
    // Change email addresses to mailto:: links.
    P3 = /(([a-zA-Z0-9-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim,
    text = inputText.replace(
      P1,
      '<a class="JB_linkify-link" href="$1" target="_blank">$1</a>',
    );
  text = text.replace(
    P2,
    '$1<a class="JB_linkify-link" href="http://$2" target="_blank">$2</a>',
  );
  text = text.replace(P3, '<a class="JB_linkify-link" href="mailto:$1">$1</a>');
  return text;
}
