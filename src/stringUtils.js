function removeLeftPad(pattern) {
  return (pattern || '').replace(/^ */g, '');
}

function addLeftPad(str, pattern) {
  const trimmedPattern = removeLeftPad(pattern);
  const index = str.indexOf(trimmedPattern);
  if (index > -1) {
    return (new Array(index + 1).fill('').join(' ') + trimmedPattern);
  }
  return trimmedPattern;
}

module.exports = {
  addLeftPad,
  removeLeftPad
};
