function distanceToLine(X, Y, X1, Y1, X2, Y2) {
  const numerator = Math.abs((Y2 - Y1) * X - (X2 - X1) * Y + X2 * Y1 - Y2 * X1);
  const denominator = Math.hypot(Y2 - Y1, X2 - X1); // same as sqrt((Y2-Y1)^2 + (X2-X1)^2)
  return numerator / denominator;
}

function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y;
}

function pointRelativeToA(p, a, b) {
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const ab = { x: b.x - a.x, y: b.y - a.y };

  return dotProduct(ap, ab);
}

function isPointWithinSegment(p, a, b) {
  return pointRelativeToA(p, a, b) > 0 && pointRelativeToA(p, b, a) > 0;
}

class Edge {
  constructor(name, start, end, label, color, triangleCenter) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.label = label;
    this.color = color;
    this.center = triangleCenter;

    this.isFullOn = true;
    this.isFlickering = false;
    this.lastFlickerTime = 0;

    const r = 10;
    const midpoint = { x: (this.start.x + this.end.x) / 2, y: (this.start.y + this.end.y) / 2 };
    const segmentVector = { x: this.end.x - this.start.x, y: this.end.y - this.start.y };
    const length = Math.hypot(segmentVector.x, segmentVector.y);
    const normalPerpendicular = { x: -segmentVector.y / length, y: segmentVector.x / length };
    const centerSide = Math.sign((this.center.x - this.start.x) * (this.end.y - this.start.y) - (this.center.y - this.start.y) * (this.end.x - this.start.x));

    this.labelPoint = { x: midpoint.x + r * centerSide * normalPerpendicular.x, y: midpoint.y + r * centerSide * normalPerpendicular.y };
  }

  draw(ctx) {
    this.updateFlicker();

    ctx.lineWidth = 3;

    if (this.isFullOn) {
      ctx.strokeStyle = this.color;
      if (this.isAnswer)
        ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.start.x, this.start.y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    }

    if (this.label) {
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.labelPoint.x, this.labelPoint.y);
    }
  }

  updateFlicker() {
    if (!this.isFlickering) {
      this.isFullOn = true;
      return;
    }

    if (Date.now() - this.lastFlickerTime > 150) { // Twice per second (500ms interval)
      this.isFullOn = !this.isFullOn;
      this.lastFlickerTime = Date.now();
    }
  }

  // Calculate distance from point to line segment
  distanceToMe(point) {
    if (!isPointWithinSegment(point, this.start, this.end)) {
      return NaN;
    }

    return distanceToLine(point.x, point.y, this.start.x, this.start.y, this.end.x, this.end.y);
  }

  checkMouseProximity(mouseX, mouseY) {
    this.isFlickering = !this.answer && this.distanceToMe({ x: mouseX, y: mouseY }) <= 10
  }

  makeAnswer() {
    this.isAnswer = true;
    this.isFlickering = false;
  }

  handleMouseLeave() {
    this.isFlickering = false;
  }
}
