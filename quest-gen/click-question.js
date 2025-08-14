class ClickQuestion {

  generateParams() {
    const questionTypes = [
      "basic",
      "projects-where",
      "which-side-from-formula",
    ];

    return {
      questionType: randomElement(questionTypes),
      reversed: Math.random() < 0.5
    }
  }

  validateGist(gist) {
    if (gist.typeParams.questionType == 'basic' && gist.from != 'hypotenuse')
      return false;

    return true;
  }

  getLabels(gist, geometry) {

    // All labels.
    // Numeric values possible.
    // Which leg corresponds to cos/sin(χ)?

    // All labels.
    // Angle could be numeric, side not
    // T * fun(α) projects onto which side? 
    // T / fun(α) projects onto which side?

    // Single label.
    // Angle could be numeric, side not
    // J = L * fun(α). Which side is J?  // L -> J  <- normal 
    // J = L / fun(α). Which side is J?  // L -> J  <- normal
    // J = L * fun(α). Which side is L?  // J -> L  <- reversed
    // J = L / fun(α). Which side is L?  // J -> L  <- reversed


    const result = {
      renderEdgeLabels: {},
      formulaEdgeLabels: {},
      apexLabels: {},
      renderAngleLabel: null,
      formulaAngleLabel: null,
      randomDisplayAngleLabels: null
    }

    const allLabels = getAllLabels();

    if (gist.typeParams.questionType === "which-side-from-formula") {
      // Single label, like:
      //    J = L * fun(α). Which side is J?

      setFormulaLabelForSide(result, gist, geometry, allLabels, 'hypotenuse');
      setFormulaLabelForSide(result, gist, geometry, allLabels, 'opposite');
      setFormulaLabelForSide(result, gist, geometry, allLabels, 'adjacent');
      setFormulaLabelForSide(result, gist, geometry, allLabels, 'opposite2');
      setFormulaLabelForSide(result, gist, geometry, allLabels, 'adjacent2');

      setRenderLabelForSide(result, gist, geometry, allLabels, gist.from);
    } else {
      setLabelsForSide(result, gist, geometry, allLabels, 'hypotenuse');
      setLabelsForSide(result, gist, geometry, allLabels, 'opposite');
      setLabelsForSide(result, gist, geometry, allLabels, 'adjacent');
      setLabelsForSide(result, gist, geometry, allLabels, 'opposite2');
      setLabelsForSide(result, gist, geometry, allLabels, 'adjacent2');
    }

    // A, β, 42°
    if (gist.angleNumeral) {
      result.renderAngleLabel = result.formulaAngleLabel =
        Math.round(radToDeg(geometry.angleA)) + DEGREES_SYMBOL;
    } else if (gist.edgeLabelsType === "side-labels" || !result.apexLabels.main) {
      result.renderAngleLabel = result.formulaAngleLabel =
        allLabels.angleLabel;
    } else if (gist.figureType === "rectangle") {
      result.renderAngleLabel = result.formulaAngleLabel =
        allLabels.angleLabel;
    } else {
      result.formulaAngleLabel = result.apexLabels.main;
    }

    result.unit = allLabels.unit;

    return result;
  }

  generatePrompt(gist, labels) {
    const { func, operator, inversedOperator } = getFunction(gist);
    const fromLabel = labels.formulaEdgeLabels[gist.from];

    let prompt = "";
    let expectedAnswer = "";

    const displayToLabels = ["XXX", "NNN", "##", "@@"]
    const toLabel = randomElement(displayToLabels);

    if (gist.typeParams.questionType === "basic") {
      prompt = `Which leg corresponds to ${func}(${labels.formulaAngleLabel})?`;
    } else if (gist.typeParams.questionType === "projects-where") {
      prompt = `${fromLabel} ${operator} ${func}(${labels.formulaAngleLabel}) projects onto which side?`;
    } else if (!gist.typeParams.reversed) { // now it's 'which-side-from-formula', straight
      // J = L * fun(α). Which side is J?  // L -> J  <- normal
      prompt = `${toLabel} = ${fromLabel} ${operator} ${func}(${labels.formulaAngleLabel}). Which side is ${toLabel}?`;
    } else { // now it's 'which-side-from-formula', reversed
      // J = L * fun(α). Which side is L?  // J -> L  <- reversed
      prompt = `${fromLabel} = ${toLabel} ${inversedOperator} ${func}(${labels.formulaAngleLabel}). Which side is ${toLabel}?`;
    }

    return { prompt, expectedAnswer };
  }
}
