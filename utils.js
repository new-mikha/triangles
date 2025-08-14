function degToRad(deg) {
  return deg * Math.PI / 180;
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

const DEGREES_SYMBOL = '°';

function hide(elementId) {
  document.getElementById(elementId).style.display = 'none';
}

function show(elementId) {
  document.getElementById(elementId).removeAttribute('style');
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

////////////////////////////////////////////////////////////////////////////////
function combinationsCount(keys, possibleValuesMap) {
  let count = 1;

  for (let digitIndex = 0; digitIndex < keys.length; digitIndex++) {
    const key = keys[digitIndex];
    const varValues = possibleValuesMap[key];
    count *= varValues.length;
  }

  return count;
}

////////////////////////////////////////////////////////////////////////////////
function combination(keys, possibleValuesMap, k) {
  const result = {};

  let indexProduct = k;

  for (let digitIndex = 0; digitIndex < keys.length; digitIndex++) {
    const key = keys[digitIndex];
    const varValues = possibleValuesMap[key];
    const indexInThisVar = indexProduct % varValues.length;
    result[key] = varValues[indexInThisVar];
    indexProduct = Math.floor(indexProduct / varValues.length);
  }

  return result;
}
