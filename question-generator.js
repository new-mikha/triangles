function generateQuestion() {
  const angleA = (10 + Math.random() * 70) * Math.PI / 180;

  const types = [
    'simple',
    'formula'
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  const reversed = true; // Math.random() < 0.5;

  const edgeLabelsArray =
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  edgeLabelsArray.sort(() => Math.random() - 0.5);
  for (let i = 0; i < edgeLabelsArray.length; i++) {
    // uppercase i looks too similar to l with some fonts
    if ((Math.random() < 0.3 && edgeLabelsArray[i] !== 'i') ||
      edgeLabelsArray[i] === 'l') //
    {
      edgeLabelsArray[i] = edgeLabelsArray[i].toUpperCase();
    }
  }

  const hasNumbers = Math.random() < 0.5;

  let angleLabel;
  if (hasNumbers) {
    const angleFigure = Math.round(radToDeg(angleA));
    angleLabel = angleFigure + DEGREES_SYMBOL;
  } else {
    const allGreekLetters = ['α', 'β', 'γ', 'θ', 'ε', 'δ', 'ϕ', 'χ', 'ω'];
    angleLabel = allGreekLetters[Math.floor(Math.random() * allGreekLetters.length)];
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

    if (Math.random() < 0.5)
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
    if (hasNumbers) {
      l = 20 + Math.floor(Math.random() * 50);
      edgeLabels.hypotenuse = l + ' ' + unit;
    } else {
      l = hypotenuse;
      edgeLabels.hypotenuse = hypotenuse;
    }

    const unknownTerm = edgeLabelsArray[1];
    const unknownEdgeLabel = hasNumbers ? `<i>${unknownTerm}</i> ${unit}` : unknownTerm;
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

  return { angleA, question: { type, func, reversed }, edgeLabels, angleLabel, hasOtherEdges, text, textAnswer };
}
