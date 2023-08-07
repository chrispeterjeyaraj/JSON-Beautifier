let orgJSON;

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
  codeTimeout = setTimeout(function () {
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
      typeof obj === "null" ||
      typeof obj === "undefined" ||
      typeof obj === "NaN"
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
    _prepareBody();
    orgJSON = obj;
    _formatJSON(JSON.stringify(orgJSON));
  }
}

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

function _createContainerElement(dark) {
  const el = document.createElement("div");
  el.className = dark ? "JB_json-container JB_dark" : "JB_json-container";
  return el;
}

/**
 * Create node html element
 * @param {object} node
 * @return html element
 */
function _createNodeElement(node) {
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
      val = _linkify(formatHTML(val));
    }
    const ky = _linkify(formatHTML(node.key));
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
