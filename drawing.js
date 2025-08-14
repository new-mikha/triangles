class Drawing {

  //////////////////////////////////////////////////////////////////////////////
  constructor(suggestedGist) {

    this.question = generateQuestion(suggestedGist);

    //rotation = 25 * Math.PI / 180;
    this.rotation = Math.random() * 2 * Math.PI;

    const canvas = document.getElementById('canvas');

    this.size = 200 + Math.random() * 120;

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    if (Math.min(canvasWidth, canvasHeight) < 500) {
      this.centerX = canvasWidth / 2;
      this.centerY = canvasHeight / 2;
    }
    else {
      const margin = Math.min(100, Math.min(canvasWidth, canvasHeight) * 0.1);
      const maxOffset = this.size + margin;
      this.centerX = maxOffset + Math.random() * (canvasWidth - 2 * maxOffset);
      this.centerY = maxOffset + Math.random() * (canvasHeight - 2 * maxOffset);
    }

    // Color assignments - ensure no repetition
    const colorsArray = ['red', 'green', 'blue'];
    this.colors = {};
    colorsArray.sort(() => Math.random() - 0.5);
    this.colors.adjacent = colorsArray[0];
    this.colors.opposite = colorsArray[1];
    this.colors.hypotenuse = colorsArray[2];
    colorsArray.sort(() => Math.random() - 0.5);
    this.colors.adjacent2 = colorsArray[0];
    this.colors.opposite2 = colorsArray[1];

    this.calcPositions();

    this.setupElements();
  }

  //////////////////////////////////////////////////////////////////////////////
  calcPositions() {
    // Calculate the three points of the drawing
    const adjacent = this.size * Math.cos(this.question.geometry.angleA);
    const opposite = this.size * Math.sin(this.question.geometry.angleA);

    // Base points before rotation
    const basePoints = [
      { x: 0, y: 0 }, // Right angle
      { x: this.question.geometry.mirrorFactor * adjacent, y: 0 }, // Adjacent leg end
      { x: 0, y: opposite }  // Opposite leg end
    ];

    const cg = { x: basePoints[0].x + basePoints[1].x + basePoints[2].x, y: basePoints[0].y + basePoints[1].y + basePoints[2].y };

    if (this.question.gist.figureType === "rectangle") {
      basePoints.push({ x: this.question.geometry.mirrorFactor * adjacent, y: opposite });

      cg.x += basePoints[3].x;
      cg.y += basePoints[3].y;
    }

    cg.x /= basePoints.length;
    cg.y /= basePoints.length;

    basePoints.forEach(point => { point.x -= cg.x; point.y -= cg.y; });

    // Apply rotation and translation
    const newPoints = basePoints.map(point => {
      const rotatedX = point.x * Math.cos(this.rotation) - point.y * Math.sin(this.rotation);
      const rotatedY = point.x * Math.sin(this.rotation) + point.y * Math.cos(this.rotation);
      return {
        x: rotatedX + this.centerX,
        y: rotatedY + this.centerY
      };
    });

    const drawingCenter =
    {
      x: (newPoints[0].x + newPoints[1].x + newPoints[2].x) / 3,
      y: (newPoints[0].y + newPoints[1].y + newPoints[2].y) / 3
    };

    if (!this.points) {
      this.points = newPoints;
      this.drawingCenter = drawingCenter;
    }
    else {
      this.points.forEach((point, i) => {
        point.x = newPoints[i].x;
        point.y = newPoints[i].y;
      });
      this.drawingCenter.x = drawingCenter.x;
      this.drawingCenter.y = drawingCenter.y;
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  setupElements() {

    this.edges = [
      new Edge('adjacent', this.points[0], this.points[1],
        this.question.labels.renderEdgeLabels.adjacent, this.colors.adjacent, this.drawingCenter),
      new Edge('opposite', this.points[0], this.points[2],
        this.question.labels.renderEdgeLabels.opposite, this.colors.opposite, this.drawingCenter)
    ];

    const isRectangle = this.question.gist.figureType === "rectangle";
    if (isRectangle) {
      this.edges.push(new Edge('adjacent2', this.points[3], this.points[2],
        this.question.labels.renderEdgeLabels.adjacent2, this.colors.adjacent2, this.drawingCenter));
      this.edges.push(new Edge('opposite2', this.points[3], this.points[1],
        this.question.labels.renderEdgeLabels.opposite2, this.colors.opposite2, this.drawingCenter));
    }

    // add at the end to it's on top of everything else in Z-order:
    this.edges.push(new Edge('hypotenuse', this.points[2], this.points[1],
      this.question.labels.renderEdgeLabels.hypotenuse, this.colors.hypotenuse, this.drawingCenter,
      isRectangle, this.question.geometry.angleA));

    if (this.question.labels.renderAngleLabel)
      this.angleArc = new AngleArc(this.points[1], this.rotation, this.question.geometry.angleA,
        this.question.labels.renderAngleLabel, this.question.geometry.mirrorFactor);

    this.angleBracket = new AngleBracket(this.points[0], this.rotation, this.question.geometry.mirrorFactor);

    this.apexLabels = [];

    const addApexLabelIfNeeded = (iPoint, labelName) => {
      if (!this.question.labels.apexLabels)
        return;

      if (!this.question.labels.apexLabels[labelName])
        return;

      if (iPoint >= this.points.length)
        return;

      this.apexLabels.push(new ApexLabel(this.points[iPoint], this.rotation,
        this.question.labels.apexLabels[labelName], this.drawingCenter));
    }

    addApexLabelIfNeeded(1, 'main');
    addApexLabelIfNeeded(2, 'opposite');
    addApexLabelIfNeeded(0, 'right');
    addApexLabelIfNeeded(3, 'rectangleRight');
  }

  //////////////////////////////////////////////////////////////////////////////
  checkMouseProximity(mouseX, mouseY) {
    if (this.answer)
      return;

    if (this.question.type === 'formula')
      return;

    for (const edge of this.edges)
      edge.checkMouseProximity(mouseX, mouseY);
  }

  //////////////////////////////////////////////////////////////////////////////
  rotate(angle) {
    this.rotation += angle;
    this.rotation = Math.round(this.rotation / (Math.PI / 20)) * (Math.PI / 20);
    this.rotation = this.rotation % (2 * Math.PI);
    this.angleArc.rotate(this.rotation);
    this.angleBracket.rotate(this.rotation);
    this.calcPositions();
  }

  //////////////////////////////////////////////////////////////////////////////
  handleMouseLeave() {
    for (const edge of this.edges)
      edge.handleMouseLeave();
  }

  //////////////////////////////////////////////////////////////////////////////
  draw(ctx) {
    for (const edge of this.edges)
      edge.draw(ctx);

    if (this.angleArc)
      this.angleArc.draw(ctx);

    this.angleBracket.draw(ctx);

    for (const label of this.apexLabels)
      label.draw(ctx);
  }

  //////////////////////////////////////////////////////////////////////////////
  tryAnswer(mouseX, mouseY) {
    if (this.answer)
      return;

    const isClickableQuestionType =
      this.question.gist.type === 'click';

    if (!isClickableQuestionType) {
      console.log(`Exepcted "simple" question type here, but got ${this.question.type} `);
      this.answer = "error";
      return "badBad";
    }

    let selectedCount = 0;
    let selectedEdge = null;
    for (const edge of this.edges) {
      edge.checkMouseProximity(mouseX, mouseY);
      if (edge.isFlickering) {
        selectedCount++;
        selectedEdge = edge;
      }
    }

    if (selectedCount !== 1)
      return;

    selectedEdge.makeAnswer();
    this.answer = selectedEdge.name;

    if (this.answer.replace('2', '') == this.question.gist.to.replace('2', ''))
      this.answerType = "good";
    else
      this.answerType = "bad";
  }

  //////////////////////////////////////////////////////////////////////////////
  tryTextAnswer(answer) {
    if (this.question.type !== 'formula') {
      console.log(`Exepcted "formula" question type here, but got ${this.question.type} `);
      this.answer = "error";
      this.answerType = "badBad";
      return;
    }

    this.answer = answer;

    function cleanAnswer(answer) {
      return answer
        .replaceAll(' ', '')
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll(DEGREES_SYMBOL, '');
    }

    if (cleanAnswer(answer) === cleanAnswer(this.textAnswer))
      this.answerType = "good";
    else
      this.answerType = "bad";
  }
}

