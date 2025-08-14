class ApexLabel {
  constructor(apex, rotation, label, drawingCenter) {
    this.apex = apex;
    this.rotation = rotation;
    this.label = label;
    this.drawingCenter = drawingCenter;
  }

  draw(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const direction = { x: this.apex.x - this.drawingCenter.x, y: this.apex.y - this.drawingCenter.y };
    const directionLength = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    const normalizedDirection = { x: direction.x / directionLength, y: direction.y / directionLength };

    const labelX = this.apex.x + normalizedDirection.x * 20;
    const labelY = this.apex.y + normalizedDirection.y * 20;

    ctx.fillText(this.label, labelX, labelY);
  }
}
