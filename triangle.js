class Triangle {

  //////////////////////////////////////////////////////////////////////////////
  constructor() {

    const { question, edgeLabels, hasOtherEdges, angleLabel, text } = generateQuestion();
    this.question = question;
    this.edgeLabels = edgeLabels;
    this.hasOtherEdges = hasOtherEdges;
    this.angleLabel = angleLabel;
    this.questionText = text;

    //rotation = 25 * Math.PI / 180;
    this.rotation = Math.random() * 2 * Math.PI;

    const canvas = document.getElementById('canvas');

    this.size = 200 + Math.random() * 120;

    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const margin = Math.min(100, Math.min(canvasWidth, canvasHeight) * 0.1);

    const maxOffset = this.size + margin;

    this.centerX = maxOffset + Math.random() * (canvasWidth - 2 * maxOffset);
    this.centerY = maxOffset + Math.random() * (canvasHeight - 2 * maxOffset);


    this.angleA = (10 + Math.random() * 70) * Math.PI / 180;


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
  }

  //////////////////////////////////////////////////////////////////////////////
  rotate(angle) {
    this.rotation += angle;
    this.rotation = Math.round(this.rotation / (Math.PI / 20)) * (Math.PI / 20);
    this.rotation = this.rotation % (2 * Math.PI);
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
      { x: adjacent, y: 0 }, // Adjacent leg end
      { x: 0, y: opposite }  // Opposite leg end
    ];

    if (this.hasOtherEdges) {
      basePoints.push({ x: adjacent, y: opposite });
    }

    // Apply rotation and translation
    const points = basePoints.map(point => {
      const rotatedX = point.x * Math.cos(this.rotation) - point.y * Math.sin(this.rotation);
      const rotatedY = point.x * Math.sin(this.rotation) + point.y * Math.cos(this.rotation);
      return {
        x: rotatedX + this.centerX,
        y: rotatedY + this.centerY
      };
    });

    const realCenter = { x: (points[0].x + points[1].x + points[2].x) / 3, y: (points[0].y + points[1].y + points[2].y) / 3 };

    this.edges = [
      new Edge('adjacent', points[0], points[1], this.edgeLabels.adjacent, this.colors.adjacent, realCenter),
      new Edge('opposite', points[0], points[2], this.edgeLabels.opposite, this.colors.opposite, realCenter),
      new Edge('hypotenuse', points[1], points[2], this.edgeLabels.hypotenuse, this.colors.hypotenuse, realCenter),
    ];

    if (this.hasOtherEdges) {
      this.edges.push(new Edge('adjacent2', points[3], points[2], this.edgeLabels.adjacent2, this.colors.adjacent2, realCenter));
      this.edges.push(new Edge('opposite2', points[3], points[1], this.edgeLabels.opposite2, this.colors.opposite2, realCenter));
    }

    this.angleArc = new AngleArc(points[1], this.rotation, this.angleA, this.angleLabel);
    this.angleBracket = new AngleBracket(points[0], this.rotation);
  }


  // Check if mouse is near any edge
  checkMouseProximity(mouseX, mouseY) {
    if (this.answer)
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
      return "badBad";
    }

    const adjacentName = this.hasOtherEdges ? 'adjacent2' : 'adjacent';
    const oppositeName = this.hasOtherEdges ? 'opposite2' : 'opposite';

    if (this.question.type === 'simple') {
      const isCorrect =
        (this.question.func === 'sin' && this.answer === oppositeName) ||
        (this.question.func === 'cos' && this.answer === adjacentName);

      return isCorrect ? "good" : "bad";
    }
  }
}

