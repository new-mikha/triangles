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
  constructor(name, start, end, label, color, triangleCenter, moveLabelToEnd) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.label = label;
    this.color = color;
    this.center = triangleCenter;

    this.isFullOn = true;
    this.isFlickering = false;
    this.lastFlickerTime = 0;
    this.moveLabelToEnd = moveLabelToEnd;
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

      const r = this.moveLabelToEnd ? 10 : 25;

      const startWeight = 1;
      const endWeight = this.moveLabelToEnd ? 0.6 : 1;

      const midpoint = { 
        x: (this.start.x * startWeight + this.end.x * endWeight) / (startWeight + endWeight), 
        y: (this.start.y * startWeight + this.end.y * endWeight) / (startWeight + endWeight) 
      };
      const segmentVector = { x: this.end.x - this.start.x, y: this.end.y - this.start.y };
      const length = Math.hypot(segmentVector.x, segmentVector.y);
      const normalPerpendicular = { x: -segmentVector.y / length, y: segmentVector.x / length };
      const centerSide = Math.sign((this.center.x - this.start.x) * (this.end.y - this.start.y) - (this.center.y - this.start.y) * (this.end.x - this.start.x));

      const labelPoint = { x: midpoint.x + r * centerSide * normalPerpendicular.x, y: midpoint.y + r * centerSide * normalPerpendicular.y };

      this.htmlFillText(ctx, this.label, labelPoint.x, labelPoint.y);
    }
  }

  htmlFillText(ctx, text, x, y) {
    // Parse the text for <b> and <i> tags
    const segments = this.parseFormattedText(text);

    let currentX = x;
    const baseFont = '16px Arial';

    // Calculate total width to center the entire text
    let totalWidth = 0;
    for (const segment of segments) {
      const font = this.getFontForSegment(segment, baseFont);
      ctx.font = font;
      totalWidth += ctx.measureText(segment.text).width;
    }

    // Adjust starting position to center the entire text
    currentX = x - totalWidth / 2;

    // Render each segment
    for (const segment of segments) {
      const font = this.getFontForSegment(segment, baseFont);
      ctx.font = font;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(segment.text, currentX, y);
      currentX += ctx.measureText(segment.text).width;
    }
  }

  parseFormattedText(text) {
    const segments = [];
    let currentIndex = 0;
    let currentText = '';
    let currentTags = [];

    while (currentIndex < text.length) {
      const char = text[currentIndex];

      if (char === '<') {
        // Save current text if any
        if (currentText.length > 0) {
          segments.push({
            text: currentText,
            bold: currentTags.includes('b'),
            italic: currentTags.includes('i')
          });
          currentText = '';
        }

        // Find the end of the tag
        const tagEnd = text.indexOf('>', currentIndex);
        if (tagEnd === -1) {
          // Malformed tag, treat as regular text
          currentText += char;
          currentIndex++;
          continue;
        }

        const tag = text.substring(currentIndex + 1, tagEnd);
        currentIndex = tagEnd + 1;

        if (tag.startsWith('/')) {
          // Closing tag
          const tagName = tag.substring(1);
          const tagIndex = currentTags.indexOf(tagName);
          if (tagIndex !== -1) {
            currentTags.splice(tagIndex, 1);
          }
        } else {
          // Opening tag
          if (tag === 'b' || tag === 'i') {
            currentTags.push(tag);
          }
        }
      } else {
        currentText += char;
        currentIndex++;
      }
    }

    // Add any remaining text
    if (currentText.length > 0) {
      segments.push({
        text: currentText,
        bold: currentTags.includes('b'),
        italic: currentTags.includes('i')
      });
    }

    return segments;
  }

  getFontForSegment(segment, baseFont) {
    let font = baseFont;

    if (segment.bold && segment.italic) {
      font = 'bold italic 16px Arial';
    } else if (segment.bold) {
      font = 'bold 16px Arial';
    } else if (segment.italic) {
      font = 'italic 16px Arial';
    }

    return font;
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
