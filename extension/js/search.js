function deepClone(source) {
  const temp = [];
  if (source) {
    return JSON.parse(
      JSON.stringify(source, (_key, value) => {
        if (typeof value === "object" && value !== null) {
          if (temp.indexOf(value) !== -1) {
            return undefined;
          }
          temp.push(value);
        }
        return value;
      })
    );
  }
  return {};
}

// ##BUG## Need to add ability to search for data inside array items. Only array keys are supported now.
const deepFilter = (obj, searchText) => {
  //iterate the object
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "object") {
      if (!searchText.includes(key)) {
        if (Array.isArray(val)) {
          if (!searchText.includes(val)) {
            delete obj[key];
          }
        } else {
          deepFilter(val, searchText);
        }
      }
    } else {
      const filteredSearch = searchText.filter(
        (item) =>
          key.toString().includes(item) || obj[key].toString().includes(item)
      );
      if (filteredSearch.length === 0) {
        delete obj[key];
      }
    }
    if (JSON.stringify(val) === "{}" || JSON.stringify(val) === "[]") {
      delete obj[key];
    }
  }
  return obj;
};

// Search through the JSON recursively to find out matched items
function _searchJSON(searchText) {
  if (searchText == "") {
    _formatJSON(JSON.stringify(orgJSON));
  } else {
    const searchKeys = searchText.split(",");
    const filterJSON = deepClone(orgJSON);
    const result = deepFilter(filterJSON, searchKeys);
    if (Object.entries(result).length > 0) {
      _formatJSON(JSON.stringify(result));
    } else {
      _formatJSON(
        JSON.stringify({
          errorCode: "No Match",
          error: "No match for the key/value entered for search",
          searchText: searchText,
        })
      );
    }
  }
}
