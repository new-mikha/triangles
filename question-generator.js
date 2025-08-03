function generateQuestion() {
  const edgeLabelsArray =
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  edgeLabelsArray.sort(() => Math.random() - 0.5);
  for (let i = 0; i < edgeLabelsArray.length; i++) {
    if (Math.random() < 0.3)
      edgeLabelsArray[i] = edgeLabelsArray[i].toUpperCase();
  }

  const allGreekLetters = ['α', 'β', 'γ', 'θ', 'ε', 'δ', 'ϕ', 'χ', 'ω'];
  const angleLabel = allGreekLetters[Math.floor(Math.random() * allGreekLetters.length)];

  const hasOtherEdges = Math.random() < 0.5;

  const types = ['simple'];
  const type = types[Math.floor(Math.random() * types.length)];
  const func = Math.random() < 0.5 ? 'sin' : 'cos';

  const edgeLabels = {};

  let text = '';
  if (type === 'simple') {
    edgeLabels.hypotenuse = edgeLabelsArray[0];
    if (Math.random() < 0.5)
      text = `Which leg corresponds to <span class="bold-text">${func}(${angleLabel})</span>?`;
    else
      text = `<span class="bold-text">${edgeLabels.hypotenuse} * ${func}(${angleLabel})</span> projects onto which leg?`;
  }

  return { question: { type, func }, edgeLabels, angleLabel, hasOtherEdges, text };
}
