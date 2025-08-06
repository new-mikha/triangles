// Triangle object structure for future enhancements
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
