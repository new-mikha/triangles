
// Main application class for future enhancements
class TriangleApp {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.triangle = null;
    this.animationId = null;

    this.initializeEventListeners();
    this.generateNewTriangle();
    this.startAnimation();
  }

  initializeEventListeners() {
    document.getElementById('newBtn').addEventListener('click', () => {
      this.generateNewTriangle();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
      this.goBack();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      this.goNext();
    });

    // Global keyboard event listener for Enter and Space keys
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        this.generateNewTriangle();
      }

      if (event.key === 'ArrowLeft') {
        this.goBack();
      }

      if (event.key === 'ArrowRight') {
        this.goNext();
      }

      if (event.key === 'ArrowUp') {
        this.triangle.rotate(-Math.PI / 20);
      }

      if (event.key === 'ArrowDown') {
        this.triangle.rotate(Math.PI / 20);
      }

    });

    // Mouse event listeners for hover detection
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.canvas.addEventListener('click', this.handleMouseClick.bind(this));
  }


  generateNewTriangle() {
    this.triangle = new Triangle();
    this.triangles.push(this.triangle);
    this.current = this.triangles.length - 1;

    this.updateQuestion();
  }

  updateQuestion() {
    const currentLabel = document.getElementById('currrentLabel');
    const countLabel = document.getElementById('countLabel');
    currentLabel.innerHTML = this.current + 1;
    countLabel.innerHTML = this.triangles.length;

    const questionText = document.getElementById('questionText');
    const questionType = this.triangle.questionType;
    const angleLabel = this.triangle.angleLabel;

    questionText.innerHTML = `Which leg corresponds to <span class="bold-text">${questionType} ${angleLabel}</span>?`;
  }

  handleMouseMove(event) {
    if (this.triangle && !this.triangle.answer) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      this.triangle.checkMouseProximity(mouseX, mouseY);
    }
  }

  handleMouseLeave(event) {
    if (this.triangle)
      this.triangle.handleMouseLeave();
  }

  correctAnswers = 0;
  totalAnswers = 0;

  handleMouseClick(event) {
    if (this.triangle && !this.triangle.answer) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      if(this.triangle.answer)
        return;

      this.triangle.handleMouseClick(mouseX, mouseY);

      if(!this.triangle.answer)
        return;

      this.totalAnswers++;

      if (this.triangle.answer === 'hypotenuse') {
        this.goodChime();
        this.badBadChime();
      } else if (!this.triangle.hasOtherEdges) {
        const isCorrect = //
          (this.triangle.questionType === 'sin' && this.triangle.answer === 'opposite') ||
          (this.triangle.questionType === 'cos' && this.triangle.answer === 'adjacent');

        if (isCorrect) {
          this.correctAnswers++;
          this.goodChime();
        } else {
          this.badChime();
        }
      } else {
        const isCorrect =
          (this.triangle.questionType === 'sin' && this.triangle.answer === 'opposite2') ||
          (this.triangle.questionType === 'cos' && this.triangle.answer === 'adjacent2');

        if (isCorrect) {
          this.goodChime();
          this.correctAnswers++;
        } else {
          this.badChime();
        }
      }

      const correctAnswersLabel = document.getElementById('correctAnswersLabel');
      const totalAnswersLabel = document.getElementById('totalAnswersLabel');
      correctAnswersLabel.innerHTML = this.correctAnswers;
      totalAnswersLabel.innerHTML = this.totalAnswers;

      setTimeout(() => {
        this.generateNewTriangle();
      }, 1000);
    }
  }

  goodChime() {
    this.playChime(660, 880, 990);
  }

  badChime() {
    this.playChime(400, 580);
  }

  badBadChime() {
    this.playChime(990, 880, 880, 880, 880, 880, 880);
  }

  playChime(...frequencies) {
    let a = new AudioContext(), o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.type = "sine"; g.gain.value = 0.1;
    let t = a.currentTime;
    o.start();
    frequencies.forEach((freq, i) => {
      o.frequency.setValueAtTime(freq, t + i * 0.1);
    });
    o.stop(t + frequencies.length * 0.1);
  }

  triangles = [];
  current = 0;



  goBack() {
    if (this.current > 0) {
      this.current--;
      this.triangle = this.triangles[this.current];
      this.updateQuestion();
    }
  }

  goNext() {
    if (this.current < this.triangles.length - 1) {
      this.current++;
      this.triangle = this.triangles[this.current];
      this.updateQuestion();
    }
  }

  startAnimation() {
    const animate = () => {
      this.draw();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw triangle
    if (this.triangle) {
      this.triangle.draw(this.ctx);
    }
  }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TriangleApp();
}); 
