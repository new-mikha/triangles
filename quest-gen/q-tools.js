////////////////////////////////////////////////////////////////////////////////
function roundSize(size) {
  if (size >= 10) {
    return Math.round(size);
  }
  if (size >= 1) {
    return Math.round(size * 10) / 10;
  }
  // For numbers < 1, find first non-zero digit and include one more
  const magnitude = Math.floor(Math.log10(size));
  const scale = Math.pow(10, -magnitude + 1);
  return Math.round(size * scale) / scale;
}

////////////////////////////////////////////////////////////////////////////////
function withUnits(size, allLabels) {
  return `${roundSize(size)} ${allLabels.unit}`;
}

////////////////////////////////////////////////////////////////////////////////
function setRenderLabelForSide(labels, gist, geometry, allLabels, edgeName, forceNonNumeral) {

  if (gist.edgeLabelsType === "side-labels") {
    if (gist.sideNumeral && !forceNonNumeral) {
      const size = geometry[edgeName.replace("2", "")];
      labels.renderEdgeLabels[edgeName] = withUnits(size, allLabels);
    } else {
      labels.renderEdgeLabels[edgeName] = allLabels.edgeLabels[edgeName];
    }
  } else {
    if (gist.sideNumeral)
      throw new Error("Side numerals not allowed for apex labels");

    if (edgeName === "hypotenuse") {
      labels.apexLabels.main = allLabels.apexLabels.main;
      labels.apexLabels.opposite = allLabels.apexLabels.opposite;
    } else if (edgeName === "opposite") {
      labels.apexLabels.opposite = allLabels.apexLabels.opposite;
      labels.apexLabels.right = allLabels.apexLabels.right;
    } else if (edgeName === "adjacent") {
      labels.apexLabels.main = allLabels.apexLabels.main;
      labels.apexLabels.right = allLabels.apexLabels.right;
    } else if (edgeName === "opposite2") {
      labels.apexLabels.main = allLabels.apexLabels.main;
      labels.apexLabels.rectangleRight = allLabels.apexLabels.rectangleRight;
    } else if (edgeName === "adjacent2") {
      labels.apexLabels.rectangleRight = allLabels.apexLabels.rectangleRight;
      labels.apexLabels.opposite = allLabels.apexLabels.opposite;
    } else {
      throw new Error("Invalid edge name: " + edgeName);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
function setFormulaLabelForSide(labels, gist, geometry, allLabels, edgeName, forceNonNumeral) {
  if (gist.edgeLabelsType === "side-labels") {
    if (gist.sideNumeral && !forceNonNumeral) {
      const size = geometry[edgeName.replace("2", "")];
      labels.formulaEdgeLabels[edgeName] = roundSize(size) + ' ' + allLabels.unit;
    } else {
      labels.formulaEdgeLabels[edgeName] = allLabels.edgeLabels[edgeName];
    }
  } else {
    if (gist.sideNumeral)
      throw new Error("Side numerals not allowed for apex labels");

    if (edgeName === "hypotenuse") {
      labels.formulaEdgeLabels.hypotenuse =
        allLabels.apexLabels.main + allLabels.apexLabels.opposite;
    } else if (edgeName === "opposite") {
      labels.formulaEdgeLabels.opposite =
        allLabels.apexLabels.opposite + allLabels.apexLabels.right;
    } else if (edgeName === "adjacent") {
      labels.formulaEdgeLabels.adjacent =
        allLabels.apexLabels.main + allLabels.apexLabels.right;
    } else if (edgeName === "opposite2") {
      labels.formulaEdgeLabels.opposite2 =
        allLabels.apexLabels.main + allLabels.apexLabels.rectangleRight;
    } else if (edgeName === "adjacent2") {
      labels.formulaEdgeLabels.adjacent2 =
        allLabels.apexLabels.rectangleRight + allLabels.apexLabels.opposite;
    } else {
      throw new Error("Invalid edge name: " + edgeName);
    }
  }
}

function setLabelsForSide(labels, gist, geometry, allLabels, edgeName, forceNonNumeral) {
  setRenderLabelForSide(labels, gist, geometry, allLabels, edgeName, forceNonNumeral);
  setFormulaLabelForSide(labels, gist, geometry, allLabels, edgeName, forceNonNumeral);
}

////////////////////////////////////////////////////////////////////////////////
function getAllLabels() {

  // ----------------------------

  const edgeLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z'];

  edgeLabels.sort(() => Math.random() - 0.5);

  for (let i = 0; i < edgeLabels.length; i++) {
    // uppercase i looks too similar to l with some fonts
    if ((Math.random() < 0.3 && edgeLabels[i] !== 'i') ||
      edgeLabels[i] === 'l') //
    {
      edgeLabels[i] = edgeLabels[i].toUpperCase();
    }
  }

  // ----------------------------

  const apexLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  apexLabels.sort(() => Math.random() - 0.5);

  // ----------------------------

  const allGreekLetters = ['α', 'β', 'γ', 'θ', 'ε', 'δ', 'ϕ', 'χ', 'ω'];
  allGreekLetters.sort(() => Math.random() - 0.5);
  const angleLabel = allGreekLetters[0];
  const randomDisplayLabels = allGreekLetters.slice(0, 3);
  randomDisplayLabels.sort(() => Math.random() - 0.5);

  // ----------------------------

  const allUnits = ['cm', 'm', 'km', 'mm', 'in', 'ft', 'yd', 'mi'];
  const unit = allUnits[Math.floor(Math.random() * allUnits.length)];

  // ----------------------------

  return {
    edgeLabels: {
      hypotenuse: edgeLabels[0],
      opposite: edgeLabels[1],
      adjacent: edgeLabels[2],
      opposite2: edgeLabels[3],
      adjacent2: edgeLabels[4],
    },
    apexLabels: {
      main: apexLabels[0], // the angleA apex
      right: apexLabels[1], // the 90° apex
      opposite: apexLabels[2], // apex opposite to angleA
      rectangleRight: apexLabels[3], // if rectangle, the other 90° apex
    },
    angleLabel,
    randomDisplayLabels,
    unit,
  }
}

////////////////////////////////////////////////////////////////////////////////
function getFunction(gist) {
  let func, operator, inversedOperator;

  if (gist.from === "hypotenuse") {
    if (gist.to.startsWith("opposite")) {
      func = "sin";
    } else {
      func = "cos";
    }
    operator = "*";
    inversedOperator = "/";
  } else if (gist.from.startsWith("opposite")) {
    if (gist.to === "hypotenuse") {
      func = "sin";
      operator = "/";
      inversedOperator = "*";
    } else {
      func = "cotan";
      operator = "*";
      inversedOperator = "/";
    }
  } else { // from.startsWith("adjacent")
    if (gist.to === "hypotenuse") {
      func = "cos";
      operator = "/";
      inversedOperator = "*";
    } else {
      func = "tan";
      operator = "*";
      inversedOperator = "/";
    }
  }

  return { func, operator, inversedOperator };
}
