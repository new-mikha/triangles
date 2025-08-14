const gistParams = {
  type: ["click"],
  typeParamsQuestionType: ["basic", "projects-where", "which-side-from-formula"],
  typeParamsReversed: [true, false],
  figureType: ["triangle", "rectangle"],
  from: ["hypotenuse", "opposite", "adjacent", "opposite2", "adjacent2"],
  to: ["hypotenuse", "opposite", "adjacent", "opposite2", "adjacent2"],
  sideNumeral: [true, false],
  angleNumeral: [true, false],
  edgeLabelsType: ["side-labels", "apex-labels"],
};

const testGists = [];

{
  const keys = Object.keys(gistParams).sort(); // to make it deterministic

  const fullCount = combinationsCount(keys, gistParams);

  for (let i = 0; i < fullCount; i++) {
    const gist = combination(keys, gistParams, i);

    gist.typeParams = {
      questionType: gist.typeParamsQuestionType,
      reversed: gist.typeParamsReversed,
    };

    delete gist.typeParamsQuestionType;
    delete gist.typeParamsReversed;

    if (gist.typeParams.questionType !== "which-side-from-formula" && gist.typeParams.reversed)
      continue;

    if (!validateGist(gist))
      continue;

    gist.__index = testGists.length;
    testGists.push(gist);
  }

  console.log("testGists.length: " + testGists.length);
}
