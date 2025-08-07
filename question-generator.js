function generateQuestion() {
  const angleA = (10 + Math.random() * 70) * Math.PI / 180;

  const types = [
    'simple',
    'reversed-simple',
    'specific-numbers'
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  const edgeLabelsArray =
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  edgeLabelsArray.sort(() => Math.random() - 0.5);
  for (let i = 0; i < edgeLabelsArray.length; i++) {
    if (Math.random() < 0.3)
      edgeLabelsArray[i] = edgeLabelsArray[i].toUpperCase();
  }

  const allGreekLetters = ['α', 'β', 'γ', 'θ', 'ε', 'δ', 'ϕ', 'χ', 'ω'];
  let angleLabel = allGreekLetters[Math.floor(Math.random() * allGreekLetters.length)];

  const hasOtherEdges = Math.random() < 0.5;

  const func = Math.random() < 0.5 ? 'sin' : 'cos';

  const edgeLabels = {};

  const allUnits = ['cm', 'm', 'km', 'mm', 'in', 'ft', 'yd', 'mi'];
  const unit = allUnits[Math.floor(Math.random() * allUnits.length)];

  let text = '';
  let textAnswer = '';
  if (type === 'simple') {
    edgeLabels.hypotenuse = edgeLabelsArray[0];
    if (Math.random() < 0.5)
      text = `Which leg corresponds to <span class="bold-text">${func}(${angleLabel})</span>?`;
    else
      text = `<span class="bold-text">${edgeLabels.hypotenuse} * ${func}(${angleLabel})</span> projects onto which leg?`;
  } else if (type === 'reversed-simple') {
    const hypotenuse = edgeLabelsArray[0];

    if (Math.random() < 0.5) {
      const angleFigure = Math.round(radToDeg(angleA));
      angleLabel = angleFigure + DEGREES_SYMBOL;
    }

    const legLabel = edgeLabelsArray[1];
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
  } else if (type === 'specific-numbers') {

    const l = 20 + Math.floor(Math.random() * 50);
    edgeLabels.hypotenuse = l + ' ' + unit;
    const angleFigure = Math.round(radToDeg(angleA));
    angleLabel = angleFigure + DEGREES_SYMBOL;

    const unknownTerm = edgeLabelsArray[0];
    const unknownEdgeLabel = `<i>${unknownTerm}</i> ${unit}`;
    text = `What will be <i>${unknownTerm}</i>`;
    textAnswer = `${unknownTerm} = ${l} * ${func}(${angleFigure})`;

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

  return { angleA, question: { type, func }, edgeLabels, angleLabel, hasOtherEdges, text, textAnswer };
}
