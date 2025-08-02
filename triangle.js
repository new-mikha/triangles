class Triangle {
  constructor() {
    this.generateRandomTriangle();
    this.flickeringSides = new Set();
    this.flickerState = true;
    this.lastFlickerTime = 0;
  }

  generateRandomTriangle() {
    const canvas = document.getElementById('canvas');

    // Set canvas size to match container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Random size (not too small, not too large)
    this.size = 200 + Math.random() * 120;

    // Random rotation
    //this.rotation = 25 * Math.PI / 180;
    this.rotation = Math.random() * 2 * Math.PI;

    // Random position (keeping triangle within visible area)
    const margin = Math.min(100, Math.min(canvasWidth, canvasHeight) * 0.1);
    const triangleSize = this.size;
    const maxOffset = triangleSize + margin;

    this.centerX = maxOffset + Math.random() * (canvasWidth - 2 * maxOffset);
    this.centerY = maxOffset + Math.random() * (canvasHeight - 2 * maxOffset);

    // Random angle for the right triangle (between 20 and 70 degrees)
    this.angleA = (10 + Math.random() * 70) * Math.PI / 180;

    // Color assignments - ensure no repetition
    const colors = ['red', 'green', 'blue'];
    const shuffledColors = colors.sort(() => Math.random() - 0.5);
    this.colors = {
      adjacent: shuffledColors[0],
      opposite: shuffledColors[1],
      hypotenuse: shuffledColors[2]
    };

    // Greek letter for angle
    const greekLetters = ['α', 'β', 'γ', 'θ', 'δ', 'ε'];
    this.angleLabel = greekLetters[Math.floor(Math.random() * greekLetters.length)];

    // Generate random question type (sin or cos)
    this.questionType = Math.random() < 0.5 ? 'sin' : 'cos';

    // Calculate triangle points
    this.calculatePoints();
  }

  calculatePoints() {
    // Calculate the three points of the triangle
    const adjacent = this.size * Math.cos(this.angleA);
    const opposite = this.size * Math.sin(this.angleA);
    const hypotenuse = Math.sqrt(adjacent * adjacent + opposite * opposite);

    // Base points before rotation
    const basePoints = [
      { x: 0, y: 0 }, // Right angle
      { x: adjacent, y: 0 }, // Adjacent leg end
      { x: 0, y: opposite }  // Opposite leg end
    ];

    // Apply rotation and translation
    this.points = basePoints.map(point => {
      const rotatedX = point.x * Math.cos(this.rotation) - point.y * Math.sin(this.rotation);
      const rotatedY = point.x * Math.sin(this.rotation) + point.y * Math.cos(this.rotation);
      return {
        x: rotatedX + this.centerX,
        y: rotatedY + this.centerY
      };
    });

    // Store the sides for future use
    this.sides = {
      adjacent: adjacent,
      opposite: opposite,
      hypotenuse: hypotenuse
    };
  }

  distanceToLine(X, Y, X1, Y1, X2, Y2) {
    const numerator = Math.abs((Y2 - Y1) * X - (X2 - X1) * Y + X2 * Y1 - Y2 * X1);
    const denominator = Math.hypot(Y2 - Y1, X2 - X1); // same as sqrt((Y2-Y1)^2 + (X2-X1)^2)
    return numerator / denominator;
  }

  dotProduct(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  pointRelativeToA(p, a, b) {
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const ab = { x: b.x - a.x, y: b.y - a.y };

    // console.log(`ap: ${ap.x}, ${ap.y}`);
    // console.log(`ab: ${ab.x}, ${ab.y}`);

    return this.dotProduct(ap, ab);
  }

  isPointWithinSegment(p, a, b) {
    return this.pointRelativeToA(p, a, b) > 0 && this.pointRelativeToA(p, b, a) > 0;
  }

  // Calculate distance from point to line segment
  distanceToLineSegment(point, lineStart, lineEnd) {
    if (!this.isPointWithinSegment(point, lineStart, lineEnd)) {
      return NaN;
    }

    return this.distanceToLine(point.x, point.y, lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
  }

  // Check if mouse is near any side
  checkMouseProximity(mouseX, mouseY) {
    if (this.answer) {
      this.flickeringSides.clear();
      return;
    }

    const errorRange = 10;
    const newFlickeringSides = new Set();

    // Check adjacent leg (points[0] to points[1])
    if (this.distanceToLineSegment({ x: mouseX, y: mouseY }, this.points[0], this.points[1]) <= errorRange) {
      newFlickeringSides.add('adjacent');
    }

    // Check opposite leg (points[0] to points[2])
    if (this.distanceToLineSegment({ x: mouseX, y: mouseY }, this.points[0], this.points[2]) <= errorRange) {
      newFlickeringSides.add('opposite');
    }

    // Check hypotenuse (points[1] to points[2])
    if (this.distanceToLineSegment({ x: mouseX, y: mouseY }, this.points[1], this.points[2]) <= errorRange) {
      newFlickeringSides.add('hypotenuse');
    }

    this.flickeringSides = newFlickeringSides;
  }

  // Update flicker animation
  updateFlicker(currentTime) {
    if (this.flickeringSides.size > 0) {
      if (currentTime - this.lastFlickerTime > 150) { // Twice per second (500ms interval)
        this.flickerState = !this.flickerState;
        this.lastFlickerTime = currentTime;
      }
    } else {
      this.flickerState = true;
    }
  }

  draw(ctx) {
    // Update flicker animation
    this.updateFlicker(Date.now());

    // Draw the triangle sides
    ctx.lineWidth = 3;

    // Adjacent leg
    if (!this.flickeringSides.has('adjacent') || this.flickerState) {
      ctx.strokeStyle = this.colors.adjacent;
      if (this.answer === 'adjacent')
        ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      ctx.lineTo(this.points[1].x, this.points[1].y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    }

    // Opposite leg
    if (!this.flickeringSides.has('opposite') || this.flickerState) {
      ctx.strokeStyle = this.colors.opposite;
      if (this.answer === 'opposite')
        ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      ctx.lineTo(this.points[2].x, this.points[2].y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    }

    // Hypotenuse
    if (!this.flickeringSides.has('hypotenuse') || this.flickerState) {
      if (this.answer === 'hypotenuse')
        ctx.setLineDash([5, 5]);

      ctx.strokeStyle = this.colors.hypotenuse;
      ctx.beginPath();
      ctx.moveTo(this.points[1].x, this.points[1].y);
      ctx.lineTo(this.points[2].x, this.points[2].y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    }

    // Draw angle arc
    this.drawAngleArc(ctx);

    // Draw angle label
    this.drawAngleLabel(ctx);
  }

  drawAngleArc(ctx) {
    const arcRadius = (this.angleA > Math.PI / 2 * 0.7) ? 20 : 40;

    // Draw arc at the angle between hypotenuse and adjacent leg (point 1)
    const endAngle = Math.PI + this.rotation;
    const startAngle = endAngle - this.angleA;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.points[1].x, this.points[1].y, arcRadius, startAngle, endAngle);
    ctx.stroke();


    const labelRadius = arcRadius + 15;
    const labelAngle = (startAngle + endAngle) / 2;
    const labelX = this.points[1].x + labelRadius * Math.cos(labelAngle);
    const labelY = this.points[1].y + labelRadius * Math.sin(labelAngle);


    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.angleLabel, labelX, labelY);
  }

  drawAngleLabel(ctx) {
    const size = 15
    const square = [[size, 0], [size, size], [0, size]];

    // Rotate square points by this.rotation
    for (let i = 0; i < square.length; i++) {
      const rotatedX = square[i][0] * Math.cos(this.rotation) - square[i][1] * Math.sin(this.rotation);
      const rotatedY = square[i][0] * Math.sin(this.rotation) + square[i][1] * Math.cos(this.rotation);
      square[i][0] = rotatedX;
      square[i][1] = rotatedY;
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x + square[0][0], this.points[0].y + square[0][1]);
    ctx.lineTo(this.points[0].x + square[1][0], this.points[0].y + square[1][1]);
    ctx.lineTo(this.points[0].x + square[2][0], this.points[0].y + square[2][1]);
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
  }
}

