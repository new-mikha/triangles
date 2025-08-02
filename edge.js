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
  constructor(name, start, end, label, color) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.label = label;
    this.color = color;

    this.isFullOn = true;
    this.isFlickering = false;
    this.lastFlickerTime = 0;
  }

  draw(ctx) {
    this.updateFlicker();

    ctx.lineWidth = 3;

    // Adjacent leg
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
