class Triangle {
  constructor() {
    this.questionType = Math.random() < 0.5 ? 'sin' : 'cos';
    // Greek letter for angle
    const allGreekLetters = ['α', 'β', 'γ', 'θ', 'ε', 'δ', 'ϕ', 'χ', 'ω'];
    this.angleLabel = allGreekLetters[Math.floor(Math.random() * allGreekLetters.length)];
    this.hasOtherEdges = Math.random() < 0.5;

    this.initialize();
  }

  initialize() {
    const canvas = document.getElementById('canvas');

    // Set canvas size to match container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Random size (not too small, not too large)
    const size = 200 + Math.random() * 120;

    // Random rotation
    //rotation = 25 * Math.PI / 180;
    const rotation = Math.random() * 2 * Math.PI;

    // Random position (keeping triangle within visible area)
    const margin = Math.min(100, Math.min(canvasWidth, canvasHeight) * 0.1);
    const triangleSize = size;
    const maxOffset = triangleSize + margin;

    const centerX = maxOffset + Math.random() * (canvasWidth - 2 * maxOffset);
    const centerY = maxOffset + Math.random() * (canvasHeight - 2 * maxOffset);

    // Random angle for the right triangle (between 20 and 70 degrees)
    const angleA = (10 + Math.random() * 70) * Math.PI / 180;

    // Generate random question type (sin or cos)
    const edgeLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    edgeLabels.sort(() => Math.random() - 0.5);
    for (let i = 0; i < edgeLabels.length; i++) {
      if (Math.random() < 0.3)
        edgeLabels[i] = edgeLabels[i].toUpperCase();
    }

    // Color assignments - ensure no repetition
    const colorsArray = ['red', 'green', 'blue'];
    const colors = {};
    colorsArray.sort(() => Math.random() - 0.5);
    colors.adjacent = colorsArray[0];
    colors.opposite = colorsArray[1];
    colors.hypotenuse = colorsArray[2];
    colorsArray.sort(() => Math.random() - 0.5);
    colors.adjacent2 = colorsArray[0];
    colors.opposite2 = colorsArray[1];


    // Calculate the three points of the triangle
    const adjacent = size * Math.cos(angleA);
    const opposite = size * Math.sin(angleA);

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
      const rotatedX = point.x * Math.cos(rotation) - point.y * Math.sin(rotation);
      const rotatedY = point.x * Math.sin(rotation) + point.y * Math.cos(rotation);
      return {
        x: rotatedX + centerX,
        y: rotatedY + centerY
      };
    });

    this.edges = [
      new Edge('adjacent', points[0], points[1], edgeLabels[0], colors.adjacent),
      new Edge('opposite', points[0], points[2], edgeLabels[1], colors.opposite),
      new Edge('hypotenuse', points[1], points[2], edgeLabels[2], colors.hypotenuse),
    ];

    if (this.hasOtherEdges) {
      this.edges.push(new Edge('adjacent2', points[3], points[2], edgeLabels[3], colors.adjacent2));
      this.edges.push(new Edge('opposite2', points[3], points[1], edgeLabels[4], colors.opposite2));
    }

    this.angleArc = new AngleArc(points[1], rotation, angleA, this.angleLabel);
    this.angleBracket = new AngleBracket(points[0], rotation);
  }


  // Check if mouse is near any edge
  checkMouseProximity(mouseX, mouseY) {
    if (this.answer)
      return;

    for (const edge of this.edges)
      edge.checkMouseProximity(mouseX, mouseY);
  }

  handleMouseLeave() {
    for (const edge of this.edges)
      edge.handleMouseLeave();
  }

  draw(ctx) {
    for (const edge of this.edges)
      edge.draw(ctx);

    this.angleArc.draw(ctx);
    this.angleBracket.draw(ctx);
  }

  handleMouseClick(mouseX, mouseY) {
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

    if(selectedCount !== 1)
      return;

    selectedEdge.makeAnswer();
    this.answer = selectedEdge.name;
  }
}

