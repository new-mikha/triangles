// Main application class for future enhancements
class DrawingApp {
  drawings = [];
  current = 0;

  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.drawing = null;
    this.animationId = null;

    this.initializeEventListeners();
    this.generateNewDrawing();
    this.startAnimation();
  }

  initializeEventListeners() {
    document.getElementById('newBtn').addEventListener('click', () => {
      this.generateNewDrawing();
    });

    document.getElementById('backBtn').addEventListener('click', () => {
      this.goBack();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      this.goNext();
    });

    const allowRotationAnyway = new URLSearchParams(window.location.search).get('rotate') === 'true';

    // Global keyboard event listener for Enter and Space keys
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (!this.drawing.answer && !allowRotationAnyway) {
          this.playChime(660, 660, 660);
          return;
        }

        if (event.key === 'ArrowUp')
          this.drawing.rotate(-Math.PI / 20);
        else
          this.drawing.rotate(Math.PI / 20);
      }

      if (document.activeElement.id === 'answerInput') {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        this.generateNewDrawing();
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

      if (event.key === 'G') {
        console.log("Question: ", this.drawing.question);
        event.preventDefault();
      }

    });

    document.getElementById('submitBtn').addEventListener('click', (event) => {
      event.preventDefault();
      const answer = document.getElementById('answerInput').value;
      this.handleTextAnswer(answer);
    });

    // Mouse event listeners for hover detection
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.canvas.addEventListener('click', this.handleMouseClick.bind(this));
  }

  iTestGist = new URLSearchParams(window.location.search).get('gist') || 0;

  generateNewDrawing() {
    if (this.changeTimer)
      clearTimeout(this.changeTimer);
    this.changeTimer = null;

    // const iTestGist = this.iTestGist++;
    // const testGist = testGists[iTestGist];

    this.drawing = new Drawing();
    this.drawings.push(this.drawing);
    this.current = this.drawings.length - 1;

    this.updateQuestion();
  }

  updateQuestion() {
    const currentLabel = document.getElementById('currrentLabel');
    const countLabel = document.getElementById('countLabel');
    currentLabel.innerHTML = this.current + 1;
    countLabel.innerHTML = this.drawings.length;

    const questionTextElement = document.getElementById('questionText');

    questionTextElement.innerHTML = this.drawing.question.prompt;

    const answerType = this.drawing.answerType;
    let displayResult = '';

    if (this.drawing.question.type !== 'formula') {
      if (!this.drawing.answer) {
        hide('answerOverlay');
      } else {
        show('answerOverlay');
        show('answerResultContainer');
        hide('answerTextContainer');
        hide('answerInputContainer');
        hide('correctAnswer');

        if (answerType === "good") {
          displayResult = '<span class="correct">✓</span> Correct</span>';
        } else if (answerType === "bad") {
          displayResult = '<span class="incorrect">✗</span> Incorrect</span>';
        } else if (answerType === "badBad") {
          displayResult = '<span class="incorrect">✗✗</span> Very Incorrect</span>';
        } else {
          displayResult = 'InternalError';
        }
      }

    } else {
      show('answerOverlay');

      if (!this.drawing.answer) {
        show('answerInputContainer');
        hide('answerResultContainer');

        if (!this.drawing.randomLabels) {
          hide('angleLabels');
        } else {
          show('angleLabels');
          document.getElementById('angleLabels').innerHTML =
            "(" + this.drawing.randomLabels.join(' ') + ")";
        }

        document.getElementById('answerInput').value = '';
      } else {
        hide('answerInputContainer');
        show('answerResultContainer');
        show('answerTextContainer');

        document.getElementById('answerText').innerHTML = this.drawing.answer;

        if (answerType === "good") {
          displayResult = '<span class="correct">✓</span> Correct</span>';
          hide('correctAnswer');
        } else if (answerType === "bad") {
          displayResult = '<span class="incorrect">✗</span> Incorrect</span>';
          show('correctAnswer');
          document.getElementById('correctAnswer').innerHTML = "Correct answer: " + this.drawing.textAnswer;
        } else if (answerType === "badBad") {
          displayResult = '<span class="incorrect">✗✗</span> Very Incorrect</span>';
          show('correctAnswer');
          document.getElementById('correctAnswer').innerHTML = "Correct answer: " + this.drawing.textAnswer;
        } else {
          displayResult = 'InternalError';
        }

      }

      document.getElementById('answerInput').focus();
    }

    document.getElementById('answerType').innerHTML = displayResult;
  }

  handleMouseMove(event) {
    if (this.drawing && !this.drawing.answer) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      this.drawing.checkMouseProximity(mouseX, mouseY);
    }
  }

  handleMouseLeave(event) {
    if (this.drawing)
      this.drawing.handleMouseLeave();
  }

  correctAnswers = 0;
  totalAnswers = 0;

  handleMouseClick(event) {
    const isClickableQuestionType =
      this.drawing.question.gist.type === 'click';

    if (!this.drawing || this.drawing.answer || !isClickableQuestionType)
      return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    this.drawing.tryAnswer(mouseX, mouseY);

    this.respondToAnswer();
  }

  /////////////////////////////////////////////////////////////////////////////
  handleTextAnswer(answer) {
    if (!this.drawing || this.drawing.answer ||
      this.drawing.question.type !== 'formula' ||
      !answer || answer.trim() === '')  //
    {
      return;
    }

    this.drawing.tryTextAnswer(answer);

    this.respondToAnswer();
  }

  /////////////////////////////////////////////////////////////////////////////
  respondToAnswer() {
    const answerType = this.drawing.answerType;

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

    this.updateQuestion();


    if (answerType === "good") {
      if (this.changeTimer)
        clearTimeout(this.changeTimer);

      this.changeTimer = setTimeout(() => {
        this.changeTimer = null;
        this.generateNewDrawing();
        this.scheduledChangeTime = null;
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
      this.drawing = this.drawings[this.current];
      this.updateQuestion();
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  goNext() {
    if (this.current < this.drawings.length - 1) {
      this.current++;
      this.drawing = this.drawings[this.current];
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

    // Draw drawing
    if (this.drawing) {
      this.drawing.draw(this.ctx);
    }
  }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new DrawingApp();
}); 
