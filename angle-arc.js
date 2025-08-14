class AngleArc {
  constructor(center, rotation, angleA, label, mirrorFactor) {
    this.center = center;
    this.rotation = rotation;
    this.angleA = angleA;
    this.label = label;
    this.mirrorFactor = mirrorFactor;
  }

  rotate(rotation) {
    this.rotation = rotation;
  }

  draw(ctx) {
    const arcRadius = (this.angleA > Math.PI / 2 * 0.7) ? 20 : 40;

    // Draw arc at the angle between hypotenuse and adjacent leg (point 1)

    let startAngle, endAngle;
    if (this.mirrorFactor > 0) {
      endAngle = Math.PI + this.rotation;
      startAngle = endAngle - this.angleA;
    } else {
      startAngle = this.rotation;
      endAngle = startAngle + this.angleA;
    }

    if (this.label) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, arcRadius, startAngle, endAngle);
      ctx.stroke();

      const labelRadius = arcRadius + 15;
      const labelAngle = (startAngle + endAngle) / 2;
      const labelX = this.center.x + labelRadius * Math.cos(labelAngle);
      const labelY = this.center.y + labelRadius * Math.sin(labelAngle);

      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, labelX, labelY);
    }
  }
}
