
// Main application class for future enhancements
class TriangleApp {
  triangles = [];
  current = 0;

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
      if (event.key === 'ArrowUp') {
        this.triangle.rotate(-Math.PI / 20);
        event.preventDefault();
      }

      if (event.key === 'ArrowDown') {
        this.triangle.rotate(Math.PI / 20);
        event.preventDefault();
      }
      
      if (document.activeElement.id === 'answerInput') {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        this.generateNewTriangle();
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft') {
        this.goBack();
        event.preventDefault();
      }

      if (event.key === 'ArrowRight') {
        this.goNext();
        event.preventDefault();
      }
    });

    document.getElementById('submitBtn').addEventListener('click', (event) => {
      event.preventDefault();

      // if (this.triangle.answer) {
      //   // The form is hidden, but still actilve. Okay, just do same as the 
      //   // Enter key does above:
      //   this.generateNewTriangle();
      //   return;
      // }

      const answer = document.getElementById('answerInput').value;
      this.handleTextAnswer(answer);
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

    questionText.innerHTML = this.triangle.questionText;

    if (this.triangle.question.type === 'specific-numbers') {
      document.querySelector('.answer-overlay').style.display = 'block';

      if (!this.triangle.answer) {
        show('answerInputContainer');
        hide('answerResultContainer');
        document.getElementById('answerInput').value = '';
      } else {
        hide('answerInputContainer');
        show('answerResultContainer');

        document.getElementById('answerText').innerHTML = this.triangle.answer;

        const answerTypeSpan = document.getElementById('answerType');
        const answerType = this.triangle.answerType;
        let displayResult = '';
        if (answerType === "good") {
          displayResult = '<span class="correct">✓</span> Correct</span>';
          hide('correctAnswer');
        } else if (answerType === "bad") {
          displayResult = '<span class="incorrect">✗</span> Incorrect</span>';
          show('correctAnswer');
          document.getElementById('correctAnswer').innerHTML = "Correct answer: " + this.triangle.textAnswer;
        } else if (answerType === "badBad") {
          displayResult = '<span class="incorrect">✗✗</span> Very Incorrect</span>';
          show('correctAnswer');
          document.getElementById('correctAnswer').innerHTML = "Correct answer: " + this.triangle.textAnswer;
        } else {
          displayResult = 'InternalError';
        }

        answerTypeSpan.innerHTML = displayResult;
      }

      document.getElementById('answerInput').focus();
    }
    else {
      document.querySelector('.answer-overlay').style.display = 'none';
    }
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
    if (!this.triangle || this.triangle.answer || this.triangle.question.type !== 'simple')
      return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    this.triangle.tryAnswer(mouseX, mouseY);

    this.respondToAnswer();
  }

  /////////////////////////////////////////////////////////////////////////////
  handleTextAnswer(answer) {
    if (!this.triangle || this.triangle.answer ||
      this.triangle.question.type !== 'specific-numbers' ||
      !answer || answer.trim() === '')  //
    {
      return;
    }

    this.triangle.tryTextAnswer(answer);

    this.respondToAnswer();
  }

  /////////////////////////////////////////////////////////////////////////////
  respondToAnswer() {
    const answerType = this.triangle.answerType;

    if (answerType === "good") {
      this.goodChime();
      this.correctAnswers++;
    } else if (answerType === "bad") {
      this.badChime();
    } else if (answerType === "badBad") {
      this.badBadChime();
    } else {
      return;
    }

    this.totalAnswers++;

    const correctAnswersLabel = document.getElementById('correctAnswersLabel');
    const totalAnswersLabel = document.getElementById('totalAnswersLabel');
    correctAnswersLabel.innerHTML = this.correctAnswers;
    totalAnswersLabel.innerHTML = this.totalAnswers;

    if (this.triangle.question.type === 'specific-numbers') {
      this.updateQuestion();
    } else {
      setTimeout(() => {
        this.generateNewTriangle();
      }, 1000);
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  goodChime() {
    this.playChime(660, 880, 990);
  }

  /////////////////////////////////////////////////////////////////////////////
  badChime() {
    this.playChime(400, 580);
  }

  /////////////////////////////////////////////////////////////////////////////
  badBadChime() {
    this.playChime(660, 880, 990);
    this.playChime(990, 880, 880, 880, 880, 880, 880);
  }

  /////////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////////
  goBack() {
    if (this.current > 0) {
      this.current--;
      this.triangle = this.triangles[this.current];
      this.updateQuestion();
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  goNext() {
    if (this.current < this.triangles.length - 1) {
      this.current++;
      this.triangle = this.triangles[this.current];
      this.updateQuestion();
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  startAnimation() {
    const animate = () => {
      this.draw();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /////////////////////////////////////////////////////////////////////////////
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
