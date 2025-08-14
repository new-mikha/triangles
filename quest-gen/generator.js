const TYPES = {
  "click": new ClickQuestion(),
  // "leg-formula": null,
  // "angle-formula": null,
};

function validateGist(gist) {
  if (gist.from === gist.to)
    return false;

  if (gist.from.startsWith("opposite") && gist.to.startsWith("opposite"))
    return false;

  if (gist.from.startsWith("adjacent") && gist.to.startsWith("adjacent"))
    return false;

  if (gist.from != "hypotenuse" && gist.to != "hypotenuse")
    return false;

  if (gist.figureType === 'triangle' && gist.from.endsWith("2"))
    return false;

  if (gist.figureType === 'triangle' && gist.to.endsWith("2"))
    return false;

  if (!TYPES[gist.type].validateGist(gist))
    return false;

  // Side numerals => side labels,
  // otherwise it could be apex labels like AB, BC, CA
  if (gist.sideNumeral && gist.edgeLabelsType === "apex-labels")
    return false;

  return true;
}

function generateQuestion(suggestedGist) {

  function generateGist() {

    const type = randomElement(Object.keys(TYPES));

    const triangleSides = ["hypotenuse", "opposite", "adjacent"];
    const rectangleSides = [...triangleSides, "opposite2", "adjacent2"];

    for (let i = 0; i < 200; i++) {

      const figureType = Math.random() < 0.5 ? "triangle" : "rectangle";
      const sides = figureType === "triangle" ? triangleSides : rectangleSides;

      const from = randomElement(sides);
      const to = randomElement(sides);


      const sideNumeral = Math.random() < 0.5;
      const edgeLabelsType = Math.random() < 0.5 ? "side-labels" : "apex-labels";
      const angleNumeral = Math.random() < 0.5;

      const result = {
        type,
        typeParams: TYPES[type].generateParams(),
        figureType,
        from,
        to,
        sideNumeral,
        angleNumeral,
        edgeLabelsType: edgeLabelsType
      }

      if (!validateGist(result))
        continue;

      return result;
    }

    throw new Error("Failed to generate question gist");
  }

  function generateGeometry() {

    let hypotenuse = 10.0 + Math.random() * 50.0;
    const r = Math.random();
    if (r < 0.2)
      hypotenuse = hypotenuse / 10.0;
    else if (r < 0.4)
      hypotenuse = hypotenuse / 100.0;
    else if (r < 0.6)
      hypotenuse = hypotenuse * 10.0;
    // else - leave hypotenuse as is

    const angleA = (10 + Math.random() * 70) * Math.PI / 180;

    const geometry = {
      angleA,
      mirrorFactor: Math.random() < 0.5 ? 1 : -1,
      hypotenuse,
      adjacent: hypotenuse * Math.cos(angleA),
      opposite: hypotenuse * Math.sin(angleA)
    }

    return geometry;
  }

  const gist = suggestedGist || generateGist();
  const geometry = generateGeometry();

  const typeHandler = TYPES[gist.type];

  const labels = typeHandler.getLabels(gist, geometry);
  const { prompt, expectedAnswer } = typeHandler.generatePrompt(gist, labels);

  return {
    gist,
    geometry,
    labels,
    prompt,
    expectedAnswer
  };

  /*
  
    const hasSpecificNumbers = Math.random() < 0.5;
  
    let angleLabel;
    let randomLabels;
  
    if (hasSpecificNumbers) {
      const angleFigure = Math.round(radToDeg(angleA));
      angleLabel = angleFigure + DEGREES_SYMBOL;
    } else {
      const allGreekLetters = ['α', 'β', 'γ', 'θ', 'ε', 'δ', 'ϕ', 'χ', 'ω'];
      allGreekLetters.sort(() => Math.random() - 0.5);
      angleLabel = allGreekLetters[0];
      randomLabels = allGreekLetters.slice(0, 3);
      randomLabels.sort(() => Math.random() - 0.5);
    }
  
    const hasOtherEdges = Math.random() < 0.5;
  
    const func = Math.random() < 0.5 ? 'sin' : 'cos';
  
    const edgeLabels = {};
  
    const allUnits = ['cm', 'm', 'km', 'mm', 'in', 'ft', 'yd', 'mi'];
    const unit = allUnits[Math.floor(Math.random() * allUnits.length)];
  
    let text = '';
    let textAnswer = '';
  
    const legLabel = edgeLabelsArray[1];
    const hypotenuse = edgeLabelsArray[0];
  
    if (type === 'simple' && !reversed) {
      edgeLabels.hypotenuse = edgeLabelsArray[0];
  
      if (Math.random() < 1)
        text = `<span class="bold-text">${legLabel} = <i>${hypotenuse}</i> * ${func}(${angleLabel})</span>. Which side is <span class="bold-text"><i>${legLabel}</i></span>&nbsp;?`;
      else
        text = `<span class="bold-text">${edgeLabels.hypotenuse} * ${func}(${angleLabel})</span> projects onto which leg?`;
    } else if (type === 'simple' && reversed) {
      if (func === 'sin') {
        if (hasOtherEdges)
          edgeLabels.opposite2 = legLabel;
        else
          edgeLabels.opposite = legLabel;
      } else {
        if (hasOtherEdges)
          edgeLabels.adjacent2 = legLabel;
        else
          edgeLabels.adjacent = legLabel;
      }
  
      text = `<span class="bold-text">${legLabel} = <i>${hypotenuse}</i> * ${func}(${angleLabel})</span>. Which side is <span class="bold-text"><i>${hypotenuse}</i></span>&nbsp;?`;
    } else if (type === 'formula') {
  
      let l;
      if (hasSpecificNumbers) {
        l = 20 + Math.floor(Math.random() * 50);
        edgeLabels.hypotenuse = l + ' ' + unit;
      } else {
        l = hypotenuse;
        edgeLabels.hypotenuse = hypotenuse;
      }
  
      const unknownTerm = edgeLabelsArray[1];
      const unknownEdgeLabel = hasSpecificNumbers ? `<i>${unknownTerm}</i> ${unit}` : unknownTerm;
      text = `What will be <i>${unknownTerm}</i>`;
      textAnswer = `${unknownTerm} = ${l} * ${func}(${angleLabel.replace(DEGREES_SYMBOL, '')})`;
  
      if (func === 'sin') {
        if (hasOtherEdges)
          edgeLabels.opposite2 = unknownEdgeLabel;
        else
          edgeLabels.opposite = unknownEdgeLabel;
      } else {
        if (hasOtherEdges)
          edgeLabels.adjacent2 = unknownEdgeLabel;
        else
          edgeLabels.adjacent = unknownEdgeLabel;
      }
  
    }
  
    return {
      angleA, question: { type, func, reversed, hasSpecificNumbers },
      edgeLabels, angleLabel, hasOtherEdges, text, textAnswer, randomLabels
    }; */
}
