class AngleBracket {
  constructor(points, iPoint, rotation, mirrorFactor) {
    this.points = points;
    this.iPoint = iPoint;
    this.rotation = rotation;
    this.mirrorFactor = mirrorFactor;
  }

  center() {
    return this.points[this.iPoint];
  }

  rotate(rotation) {
    this.rotation = rotation;
  }

  draw(ctx) {
    const size = 15
    const square = [[this.mirrorFactor * size, 0], [this.mirrorFactor * size, size], [0, size]];

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
    ctx.moveTo(this.center().x + square[0][0], this.center().y + square[0][1]);
    ctx.lineTo(this.center().x + square[1][0], this.center().y + square[1][1]);
    ctx.lineTo(this.center().x + square[2][0], this.center().y + square[2][1]);
    ctx.stroke();
  }
}
