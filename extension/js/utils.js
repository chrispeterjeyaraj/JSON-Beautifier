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
 * HTML Formatter
 */
function formatHTML(html) {
  let str = html;
  str = str.replace(/</gm, "&lt;");
  str = str.replace(/>/gm, "&gt;");
  return str;
}

function _expandChildren(node) {
  traverseTree(node, function (child) {
    child.el.classList.remove("hide");
    child.isExpanded = true;
    setCaretIconDown(child);
  });
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
 * Create node object
 * @param {object} opt options
 * @return {object}
 */
function createNode(opt = {}) {
  return {
    key: opt.key || null,
    parent: opt.parent || null,
    // deno-lint-ignore no-prototype-builtins
    value: opt.hasOwnProperty("value") ? opt.value : null,
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
function _createTree(jsonData) {
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
function _render(
  tree,
  targetElement,
  option = { theme: "dark", string: false }
) {
  if (option.theme != "dark" && option.theme != "light") {
    throw new TypeError("Not a valid theme name!");
  }
  if (option.string === undefined || typeof (option.string !== "boolean")) {
    option.string = false;
  }
  const isDark = option.theme == "dark" ? true : false;
  const containerEl = _createContainerElement(isDark);

  traverseTree(tree, function (node) {
    node.el = _createNodeElement(node);
    containerEl.appendChild(node.el);
  });
  const removeChilds = function (node) {
    let last;
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
