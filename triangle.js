class Triangle {

  //////////////////////////////////////////////////////////////////////////////
  constructor() {

    const { angleA, question, edgeLabels, hasOtherEdges, angleLabel, text, textAnswer } = generateQuestion();
    this.angleA = angleA;
    this.question = question;
    this.edgeLabels = edgeLabels;
    this.hasOtherEdges = hasOtherEdges;
    this.angleLabel = angleLabel;
    this.questionText = text;
    this.textAnswer = textAnswer;
    //rotation = 25 * Math.PI / 180;
    this.rotation = Math.random() * 2 * Math.PI;
    this.mirrorFactor = Math.random() < 0.5 ? 1 : -1;

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
  rotate(angle) {
    this.rotation += angle;
    this.rotation = Math.round(this.rotation / (Math.PI / 20)) * (Math.PI / 20);
    this.rotation = this.rotation % (2 * Math.PI);
    this.angleArc.rotate(this.rotation);
    this.angleBracket.rotate(this.rotation);
    this.calcPositions();
  }

  //////////////////////////////////////////////////////////////////////////////
  calcPositions() {
    // Calculate the three points of the triangle
    const adjacent = this.size * Math.cos(this.angleA);
    const opposite = this.size * Math.sin(this.angleA);

    // Base points before rotation
    const basePoints = [
      { x: 0, y: 0 }, // Right angle
      { x: this.mirrorFactor * adjacent, y: 0 }, // Adjacent leg end
      { x: 0, y: opposite }  // Opposite leg end
    ];

    const cg = { x: basePoints[0].x + basePoints[1].x + basePoints[2].x, y: basePoints[0].y + basePoints[1].y + basePoints[2].y };

    if (this.hasOtherEdges) {
      basePoints.push({ x: this.mirrorFactor * adjacent, y: opposite });

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

    if (!this.points) {
      this.points = newPoints;
    }
    else {
      this.points.forEach((point, i) => {
        point.x = newPoints[i].x;
        point.y = newPoints[i].y;
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  setupElements() {
    const realCenter = { x: (this.points[0].x + this.points[1].x + this.points[2].x) / 3, y: (this.points[0].y + this.points[1].y + this.points[2].y) / 3 };

    this.edges = [
      new Edge('adjacent', this.points[0], this.points[1], this.edgeLabels.adjacent, this.colors.adjacent, realCenter),
      new Edge('opposite', this.points[0], this.points[2], this.edgeLabels.opposite, this.colors.opposite, realCenter)
    ];

    if (this.hasOtherEdges) {
      this.edges.push(new Edge('adjacent2', this.points[3], this.points[2], this.edgeLabels.adjacent2, this.colors.adjacent2, realCenter));
      this.edges.push(new Edge('opposite2', this.points[3], this.points[1], this.edgeLabels.opposite2, this.colors.opposite2, realCenter));
    }

    // add at the end to it's on top of everything else in Z-order:
    this.edges.push(new Edge('hypotenuse', this.points[2], this.points[1], this.edgeLabels.hypotenuse, this.colors.hypotenuse, realCenter, this.hasOtherEdges));

    this.angleArc = new AngleArc(this.points[1], this.rotation, this.angleA, this.angleLabel, this.mirrorFactor);
    this.angleBracket = new AngleBracket(this.points[0], this.rotation, this.mirrorFactor);
  }

  //////////////////////////////////////////////////////////////////////////////
  checkMouseProximity(mouseX, mouseY) {
    if (this.answer)
      return;

    if (this.question.type === 'specific-numbers')
      return;

    for (const edge of this.edges)
      edge.checkMouseProximity(mouseX, mouseY);
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

    this.angleArc.draw(ctx);
    this.angleBracket.draw(ctx);
  }

  //////////////////////////////////////////////////////////////////////////////
  tryAnswer(mouseX, mouseY) {
    if (this.answer)
      return;

    const isClickableQuestionType =
      this.question.type === 'simple';


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

    if (this.answer === 'hypotenuse') {
      if (this.question.reversed) {
        this.answerType = "good";
      } else {
        this.answerType = "badBad";
      }
      return;
    }

    if (this.question.reversed) {
      this.answerType = "bad";
      return;
    }

    const isOpposite = this.answer === 'opposite' || this.answer === 'opposite2';
    const isAdjacent = this.answer === 'adjacent' || this.answer === 'adjacent2';

    if (this.question.func == 'sin' && isOpposite)
      this.answerType = "good";
    else if (this.question.func == 'cos' && isAdjacent)
      this.answerType = "good";
    else
      this.answerType = "bad";
  }

  //////////////////////////////////////////////////////////////////////////////
  tryTextAnswer(answer) {
    if (this.question.type !== 'specific-numbers') {
      console.log(`Exepcted "specific-numbers" question type here, but got ${this.question.type} `);
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

