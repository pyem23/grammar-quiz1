/* ================================
   ENGLISH GRAMMAR QUIZ - APP.JS
   ================================ */

class GrammarQuizApp {
  constructor() {
    this.currentUser = null;
    this.currentScreen = 'login';
    this.currentTopic = null;
    this.currentQuestion = 0;
    this.userAnswers = {};
    this.quizStartTime = null;
    this.isAdminMode = false;
    
    // Data
    this.allScores = this.loadScoresFromStorage();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderLoginScreen();
    window.addEventListener('beforeunload', () => this.saveScoresToStorage());
  }

  setupEventListeners() {
    // Login
    document.addEventListener('click', (e) => {
      if (e.target.id === 'loginBtn') this.handleLogin();
      if (e.target.id === 'toggleAdminBtn') this.toggleAdminMode();
      if (e.target.id === 'adminLoginBtn') this.handleAdminLogin();
      if (e.target.id === 'logoutBtn') this.handleLogout();
      
      // Quiz Navigation
      if (e.target.id === 'startQuizBtn') this.startQuiz(e.target.dataset.topic);
      if (e.target.id === 'nextQuestionBtn') this.nextQuestion();
      if (e.target.id === 'prevQuestionBtn') this.prevQuestion();
      if (e.target.id === 'submitQuizBtn') this.submitQuiz();
      
      // Results
      if (e.target.id === 'retakeQuizBtn') this.startQuiz(this.currentTopic);
      if (e.target.id === 'backToDashboardBtn') this.showDashboard();
      if (e.target.id === 'viewDetailsBtn') this.showResultsDetail();
      
      // Admin
      if (e.target.id === 'exportDataBtn') this.exportToCSV();
      if (e.target.id === 'exportExcelBtn') this.exportToExcel();
      if (e.target.id === 'resetAllScoresBtn') this.resetAllScores();
      
      // Navigation
      if (e.target.classList.contains('nav-btn')) {
        this.showScreen(e.target.dataset.screen);
      }
    });

    // Enter key on login
    const loginInputs = document.querySelectorAll('#loginForm input');
    loginInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
    });

    // Answer selection
    document.addEventListener('change', (e) => {
      if (e.target.name === 'answer') {
        this.selectAnswer(parseInt(e.target.value));
      }
    });
  }

  // ================================
  // LOGIN SCREEN
  // ================================

  renderLoginScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="login-screen">
        <div class="login-container">
          <div class="login-logo">
            <h1>📚 English Grammar</h1>
            <p>Level 1 - Fondasi Tata Bahasa Inggris</p>
          </div>
          
          ${!this.isAdminMode ? `
            <form id="loginForm">
              <div class="form-group">
                <label for="studentName">Nama Siswa (Nomor Absen)</label>
                <input type="text" id="studentName" placeholder="Masukkan nama lengkap" required>
              </div>
              
              <div class="form-group">
                <label for="studentClass">Kelas</label>
                <select id="studentClass" required>
                  <option value="">-- Pilih Kelas --</option>
                  <optgroup label="Kelas X">
                    <option value="X-E1">Kelas X-E1</option>
                    <option value="X-E2">Kelas X-E2</option>
                    <option value="X-E3">Kelas X-E3</option>
                    <option value="X-E4">Kelas X-E4</option>
                    <option value="X-E5">Kelas X-E5</option>
                    <option value="X-E6">Kelas X-E6</option>
                    <option value="X-E7">Kelas X-E7</option>
                    <option value="X-E8">Kelas X-E8</option>
                    <option value="X-E9">Kelas X-E9</option>
                    <option value="X-E10">Kelas X-E10</option>
                  </optgroup>
                  <optgroup label="Kelas XI">
                    <option value="XI-F1">Kelas XI-F1</option>
                    <option value="XI-F2">Kelas XI-F2</option>
                    <option value="XI-F3">Kelas XI-F3</option>
                    <option value="XI-F4">Kelas XI-F4</option>
                    <option value="XI-F5">Kelas XI-F5</option>
                    <option value="XI-F6">Kelas XI-F6</option>
                    <option value="XI-F7">Kelas XI-F7</option>
                    <option value="XI-F8">Kelas XI-F8</option>
                    <option value="XI-F9">Kelas XI-F9</option>
                    <option value="XI-F10">Kelas XI-F10</option>
                  </optgroup>
                  <optgroup label="Kelas XII">
                    <option value="XII-F1">Kelas XII-F1</option>
                    <option value="XII-F2">Kelas XII-F2</option>
                    <option value="XII-F3">Kelas XII-F3</option>
                    <option value="XII-F4">Kelas XII-F4</option>
                    <option value="XII-F5">Kelas XII-F5</option>
                    <option value="XII-F6">Kelas XII-F6</option>
                    <option value="XII-F7">Kelas XII-F7</option>
                    <option value="XII-F8">Kelas XII-F8</option>
                    <option value="XII-F9">Kelas XII-F9</option>
                    <option value="XII-F10">Kelas XII-F10</option>
                  </optgroup>
                  <optgroup label="Testing">
                    <option value="Testing">Kelas Testing</option>
                  </optgroup>
                </select>
              </div>
              
              <button type="button" id="loginBtn" class="btn-primary btn-lg btn-block">
                Masuk
              </button>
            </form>
            
            <div class="toggle-admin">
              <button type="button" id="toggleAdminBtn">
                Masuk sebagai Admin →
              </button>
            </div>
          ` : `
            <form id="adminLoginForm">
              <div class="form-group">
                <label for="adminPassword">Password Admin</label>
                <input type="password" id="adminPassword" placeholder="Masukkan password" required>
              </div>
              
              <button type="button" id="adminLoginBtn" class="btn-primary btn-lg btn-block">
                Login Admin
              </button>
            </form>
            
            <div class="toggle-admin">
              <button type="button" id="toggleAdminBtn">
                ← Kembali ke Login Siswa
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  toggleAdminMode() {
    this.isAdminMode = !this.isAdminMode;
    this.renderLoginScreen();
    setTimeout(() => {
      if (this.isAdminMode) {
        document.getElementById('adminPassword').focus();
      } else {
        document.getElementById('studentName').focus();
      }
    }, 0);
  }

  handleLogin() {
    const name = document.getElementById('studentName').value.trim();
    const classRoom = document.getElementById('studentClass').value;

    if (!name) {
      this.showAlert('Silakan masukkan nama', 'error');
      return;
    }

    if (!classRoom) {
      this.showAlert('Silakan pilih kelas', 'error');
      return;
    }

    this.currentUser = { name, class: classRoom };
    this.currentScreen = 'dashboard';
    this.showDashboard();
  }

  handleAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    const correctPassword = '085726114807';

    if (password === correctPassword) {
      this.currentUser = { name: 'Admin', isAdmin: true };
      this.currentScreen = 'admin';
      this.showAdminDashboard();
    } else {
      this.showAlert('Password admin salah', 'error');
      document.getElementById('adminPassword').value = '';
    }
  }

  handleLogout() {
    this.currentUser = null;
    this.currentScreen = 'login';
    this.isAdminMode = false;
    this.renderLoginScreen();
  }

  // ================================
  // DASHBOARD
  // ================================

  showDashboard() {
    const app = document.getElementById('app');
    const topics = window.quizData.topics;

    // Calculate stats
    const userStats = this.calculateUserStats();

    app.innerHTML = `
      <div class="header">
        <div class="container">
          <div class="header-brand">📚 English Grammar Quiz</div>
          <div class="header-user">
            <span>${this.currentUser.name} (${this.currentUser.class})</span>
            <button id="logoutBtn" class="btn-outline btn-sm">Logout</button>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="dashboard">
          <!-- Sidebar -->
          <div class="dashboard-sidebar">
            <div class="nav-section">
              <div class="nav-section-title">📊 Progress Anda</div>
              <div style="text-align: center; padding: var(--spacing-md);">
                <div style="font-size: 32px; font-weight: 700; color: var(--primary);">
                  ${userStats.completedTopics}/${topics.length}
                </div>
                <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                  Topik Selesai
                </div>
              </div>
              <div style="padding: var(--spacing-md); background: var(--light); border-radius: 6px; margin-top: var(--spacing-md);">
                <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-sm);">
                  Rata-rata Nilai
                </div>
                <div style="font-size: 24px; font-weight: 700; color: var(--success);">
                  ${userStats.averageScore.toFixed(1)}
                </div>
              </div>
            </div>

            <div class="nav-section">
              <div class="nav-section-title">🎯 Topik</div>
              <ul class="nav-menu">
                ${topics.map(topic => {
                  const topicScore = this.getUserTopicScore(this.currentUser.name, topic.id);
                  const statusClass = topicScore ? 'completed' : '';
                  return `
                    <li>
                      <button class="nav-btn ${statusClass}" data-screen="quiz" data-topic="${topic.id}" id="startQuizBtn" data-topic="${topic.id}">
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                          <span>${topic.number}. ${topic.title}</span>
                          ${topicScore ? `<span style="font-weight: 700; color: var(--success);">${topicScore}</span>` : ''}
                        </div>
                      </button>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          </div>

          <!-- Main Content -->
          <div class="dashboard-main">
            <div class="card">
              <div class="card-header">
                🎓 Selamat Datang, ${this.currentUser.name}!
              </div>
              <div class="card-body">
                <p>Pilih topik di samping untuk memulai kuis. Setiap topik memiliki 10 pertanyaan.</p>
                <p style="margin-top: var(--spacing-md); color: var(--text-secondary); font-size: var(--font-size-sm);">
                  💡 Tips: Baca setiap pertanyaan dengan cermat dan pilih jawaban terbaik. Nilai akan disimpan otomatis.
                </p>
              </div>
            </div>

            <div class="card">
              <div class="card-header">📈 Statistik Pembelajaran</div>
              <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-lg);">
                  <div style="text-align: center; padding: var(--spacing-md); background: var(--light); border-radius: 6px;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--primary);">
                      ${userStats.totalQuizzes}
                    </div>
                    <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                      Total Quiz
                    </div>
                  </div>
                  <div style="text-align: center; padding: var(--spacing-md); background: var(--light); border-radius: 6px;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--success);">
                      ${userStats.highestScore}
                    </div>
                    <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                      Nilai Tertinggi
                    </div>
                  </div>
                  <div style="text-align: center; padding: var(--spacing-md); background: var(--light); border-radius: 6px;">
                    <div style="font-size: 24px; font-weight: 700; color: var(--info);">
                      ${userStats.lowestScore}
                    </div>
                    <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                      Nilai Terendah
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ================================
  // QUIZ SCREEN
  // ================================

  startQuiz(topicId) {
    this.currentTopic = topicId;
    this.currentQuestion = 0;
    this.userAnswers = {};
    this.quizStartTime = Date.now();
    this.showQuiz();
  }

  showQuiz() {
    const topic = window.quizData.topics.find(t => t.id === this.currentTopic);
    const question = topic.questions[this.currentQuestion];
    const progress = ((this.currentQuestion + 1) / topic.questions.length) * 100;

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="header">
        <div class="container">
          <div class="header-brand">📚 ${topic.title}</div>
          <div class="header-user">
            <button id="logoutBtn" class="btn-outline btn-sm">Exit Quiz</button>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="quiz-header">
          <h2>${topic.title}</h2>
          <p>${topic.description}</p>
          <div class="quiz-progress">
            <span class="progress-text">Soal ${this.currentQuestion + 1} dari ${topic.questions.length}</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${Math.round(progress)}%</span>
          </div>
        </div>

        <div class="question-container">
          <div class="question-number">Soal ${this.currentQuestion + 1}</div>
          <div class="question-text">${question.question}</div>

          <div class="options">
            ${question.options.map((option, index) => {
              const isSelected = this.userAnswers[this.currentQuestion] === index;
              return `
                <div class="option">
                  <input type="radio" id="opt_${index}" name="answer" value="${index}" 
                    ${isSelected ? 'checked' : ''}>
                  <label for="opt_${index}">${option}</label>
                </div>
              `;
            }).join('')}
          </div>

          ${this.userAnswers[this.currentQuestion] !== undefined ? `
            <div class="explanation show">
              <div class="explanation-title">✓ Penjelasan</div>
              <div class="explanation-text">${question.explanation}</div>
            </div>
          ` : ''}
        </div>

        <div class="quiz-controls">
          <button id="prevQuestionBtn" class="btn-outline" 
            ${this.currentQuestion === 0 ? 'disabled' : ''}>
            ← Sebelumnya
          </button>
          
          ${this.currentQuestion < topic.questions.length - 1 ? `
            <button id="nextQuestionBtn" class="btn-primary" 
              ${this.userAnswers[this.currentQuestion] === undefined ? 'disabled' : ''}>
              Selanjutnya →
            </button>
          ` : `
            <button id="submitQuizBtn" class="btn-success"
              ${this.userAnswers[this.currentQuestion] === undefined ? 'disabled' : ''}>
              Selesaikan Quiz ✓
            </button>
          `}
        </div>
      </div>
    `;
  }

  selectAnswer(optionIndex) {
    this.userAnswers[this.currentQuestion] = optionIndex;
    this.showQuiz();
  }

  nextQuestion() {
    const topic = window.quizData.topics.find(t => t.id === this.currentTopic);
    if (this.currentQuestion < topic.questions.length - 1) {
      this.currentQuestion++;
      this.showQuiz();
    }
  }

  prevQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.showQuiz();
    }
  }

  submitQuiz() {
    const topic = window.quizData.topics.find(t => t.id === this.currentTopic);
    
    // Calculate score
    let correctCount = 0;
    topic.questions.forEach((question, index) => {
      if (this.userAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / topic.questions.length) * 100);
    const timeSpent = Math.round((Date.now() - this.quizStartTime) / 1000);

    // Save score
    this.saveScore({
      studentName: this.currentUser.name,
      studentClass: this.currentUser.class,
      topic: topic.id,
      topicTitle: topic.title,
      score: score,
      correctCount: correctCount,
      totalQuestions: topic.questions.length,
      timeSpent: timeSpent,
      timestamp: new Date().toISOString(),
      answers: this.userAnswers
    });

    this.showResults(score, correctCount, topic.questions.length, timeSpent);
  }

  showResults(score, correctCount, totalQuestions, timeSpent) {
    const topic = window.quizData.topics.find(t => t.id === this.currentTopic);
    const message = this.getScoreMessage(score);
    const emoji = this.getScoreEmoji(score);

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="header">
        <div class="container">
          <div class="header-brand">📚 Hasil Kuis</div>
          <div class="header-user">
            <button id="logoutBtn" class="btn-outline btn-sm">Logout</button>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="results-container">
          <div class="results-header">
            <div class="results-title">${emoji} ${message}</div>
            <div class="results-score">${score}</div>
            <div class="results-message">Topik: ${topic.title}</div>
          </div>

          <div class="results-breakdown">
            <div class="result-stat">
              <div class="result-stat-value">${correctCount}/${totalQuestions}</div>
              <div class="result-stat-label">Jawaban Benar</div>
            </div>
            <div class="result-stat">
              <div class="result-stat-value">${totalQuestions - correctCount}</div>
              <div class="result-stat-label">Jawaban Salah</div>
            </div>
            <div class="result-stat">
              <div class="result-stat-value">${this.formatTime(timeSpent)}</div>
              <div class="result-stat-label">Waktu Tempuh</div>
            </div>
          </div>

          <div class="result-details">
            <div class="detail-item">
              <div class="detail-label">Persentase Benar</div>
              <div class="detail-value">${score}%</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                ${score >= 70 ? '<span class="badge badge-success">✓ Lulus</span>' : '<span class="badge badge-danger">✗ Belum Lulus</span>'}
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Waktu Mulai</div>
              <div class="detail-value">${new Date(this.quizStartTime).toLocaleTimeString('id-ID')}</div>
            </div>
          </div>

          <div class="results-controls">
            <button id="retakeQuizBtn" class="btn-primary">🔄 Coba Lagi</button>
            <button id="backToDashboardBtn" class="btn-outline">← Kembali ke Dashboard</button>
          </div>
        </div>
      </div>
    `;
  }

  // ================================
  // ADMIN DASHBOARD
  // ================================

  showAdminDashboard() {
    const app = document.getElementById('app');
    const totalScores = this.allScores.length;
    const uniqueStudents = new Set(this.allScores.map(s => s.studentName)).size;
    const averageScore = this.allScores.length > 0 
      ? (this.allScores.reduce((sum, s) => sum + s.score, 0) / this.allScores.length).toFixed(1)
      : 0;

    app.innerHTML = `
      <div class="header">
        <div class="container">
          <div class="header-brand">📚 Admin Dashboard</div>
          <div class="header-user">
            <span>Admin Panel</span>
            <button id="logoutBtn" class="btn-outline btn-sm">Logout</button>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="dashboard">
          <!-- Admin Sidebar -->
          <div class="dashboard-sidebar">
            <div class="nav-section">
              <div class="nav-section-title">📊 Menu</div>
              <ul class="nav-menu">
                <li>
                  <button class="nav-btn active" onclick="app.showScreen('all-scores')">
                    📋 Semua Nilai
                  </button>
                </li>
                <li>
                  <button class="nav-btn" onclick="app.showScreen('by-student')">
                    👤 Per Siswa
                  </button>
                </li>
                <li>
                  <button class="nav-btn" onclick="app.showScreen('by-topic')">
                    🎯 Per Topik
                  </button>
                </li>
                <li>
                  <button class="nav-btn" onclick="app.showScreen('statistics')">
                    📈 Statistik
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Main Content -->
          <div class="dashboard-main">
            <!-- Stats -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${totalScores}</div>
                <div class="stat-label">Total Quiz Selesai</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${uniqueStudents}</div>
                <div class="stat-label">Jumlah Siswa</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${averageScore}</div>
                <div class="stat-label">Rata-rata Nilai</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${window.quizData.topics.length}</div>
                <div class="stat-label">Total Topik</div>
              </div>
            </div>

            <!-- View: All Scores -->
            <div id="view-all-scores" class="card">
              <div class="card-header">📋 Semua Nilai Quiz</div>
              <div class="card-body">
                ${this.renderAllScoresTable()}
              </div>
              <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
                <button id="exportDataBtn" class="btn-primary">📥 Export CSV</button>
                <button id="exportExcelBtn" class="btn-primary">📊 Export Excel</button>
                <button id="resetAllScoresBtn" class="btn-danger">🗑️ Reset Semua Data</button>
              </div>
            </div>

            <!-- View: By Student -->
            <div id="view-by-student" class="card" style="display: none;">
              <div class="card-header">👤 Nilai Per Siswa</div>
              <div class="card-body">
                ${this.renderByStudentView()}
              </div>
            </div>

            <!-- View: By Topic -->
            <div id="view-by-topic" class="card" style="display: none;">
              <div class="card-header">🎯 Analisis Per Topik</div>
              <div class="card-body">
                ${this.renderByTopicView()}
              </div>
            </div>

            <!-- View: Statistics -->
            <div id="view-statistics" class="card" style="display: none;">
              <div class="card-header">📈 Statistik Lengkap</div>
              <div class="card-body">
                ${this.renderStatisticsView()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAllScoresTable() {
    const scores = this.allScores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (scores.length === 0) {
      return '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-lg);">Tidak ada data quiz</p>';
    }

    return `
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Siswa</th>
              <th>Kelas</th>
              <th>Topik</th>
              <th>Nilai</th>
              <th>Benar/Total</th>
              <th>Waktu</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${scores.map(score => `
              <tr>
                <td>${score.studentName}</td>
                <td>${score.studentClass}</td>
                <td>${score.topicTitle}</td>
                <td>
                  <strong style="color: ${score.score >= 70 ? 'var(--success)' : 'var(--danger)'};">
                    ${score.score}
                  </strong>
                </td>
                <td>${score.correctCount}/${score.totalQuestions}</td>
                <td>${this.formatTime(score.timeSpent)}</td>
                <td>${new Date(score.timestamp).toLocaleString('id-ID')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderByStudentView() {
    const students = {};
    this.allScores.forEach(score => {
      if (!students[score.studentName]) {
        students[score.studentName] = { class: score.studentClass, scores: [] };
      }
      students[score.studentName].scores.push(score);
    });

    if (Object.keys(students).length === 0) {
      return '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-lg);">Tidak ada data quiz</p>';
    }

    return `
      <div style="display: grid; gap: var(--spacing-lg);">
        ${Object.entries(students).map(([name, data]) => {
          const avg = (data.scores.reduce((sum, s) => sum + s.score, 0) / data.scores.length).toFixed(1);
          return `
            <div style="background: var(--light); padding: var(--spacing-md); border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                <div>
                  <div style="font-weight: 600;">${name}</div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">${data.class}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${avg}</div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Rata-rata</div>
                </div>
              </div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                Total Quiz: ${data.scores.length}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderByTopicView() {
    const topicStats = {};
    window.quizData.topics.forEach(topic => {
      const topicScores = this.allScores.filter(s => s.topic === topic.id);
      topicStats[topic.id] = {
        title: topic.title,
        totalAttempts: topicScores.length,
        averageScore: topicScores.length > 0 
          ? (topicScores.reduce((sum, s) => sum + s.score, 0) / topicScores.length).toFixed(1)
          : 0,
        passCount: topicScores.filter(s => s.score >= 70).length
      };
    });

    return `
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Topik</th>
              <th>Pengerjaan</th>
              <th>Rata-rata Nilai</th>
              <th>Lulus</th>
              <th>Persentase Lulus</th>
            </tr>
          </thead>
          <tbody>
            ${Object.values(topicStats).map(stat => {
              const passPercentage = stat.totalAttempts > 0 
                ? ((stat.passCount / stat.totalAttempts) * 100).toFixed(1)
                : 0;
              return `
                <tr>
                  <td>${stat.title}</td>
                  <td>${stat.totalAttempts}</td>
                  <td><strong>${stat.averageScore}</strong></td>
                  <td>${stat.passCount}</td>
                  <td>${passPercentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderStatisticsView() {
    const totalScores = this.allScores.length;
    const passCount = this.allScores.filter(s => s.score >= 70).length;
    const failCount = totalScores - passCount;
    const passPercentage = totalScores > 0 ? ((passCount / totalScores) * 100).toFixed(1) : 0;

    const scoreDistribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '<60': 0
    };

    this.allScores.forEach(score => {
      if (score.score >= 90) scoreDistribution['90-100']++;
      else if (score.score >= 80) scoreDistribution['80-89']++;
      else if (score.score >= 70) scoreDistribution['70-79']++;
      else if (score.score >= 60) scoreDistribution['60-69']++;
      else scoreDistribution['<60']++;
    });

    return `
      <div style="display: grid; gap: var(--spacing-lg);">
        <div style="background: var(--light); padding: var(--spacing-lg); border-radius: 6px;">
          <h3 style="margin-bottom: var(--spacing-md);">📊 Distribusi Nilai</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-md);">
            ${Object.entries(scoreDistribution).map(([range, count]) => `
              <div style="text-align: center; padding: var(--spacing-md); background: white; border-radius: 6px;">
                <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${count}</div>
                <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">${range}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: var(--light); padding: var(--spacing-lg); border-radius: 6px;">
          <h3 style="margin-bottom: var(--spacing-md);">✓ Status Kelulusan</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
            <div style="text-align: center; padding: var(--spacing-md); background: white; border-radius: 6px;">
              <div style="font-size: 24px; font-weight: 700; color: var(--success);">${passCount}</div>
              <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Lulus (≥70%)</div>
              <div style="color: var(--success); font-weight: 600; margin-top: var(--spacing-sm);">${passPercentage}%</div>
            </div>
            <div style="text-align: center; padding: var(--spacing-md); background: white; border-radius: 6px;">
              <div style="font-size: 24px; font-weight: 700; color: var(--danger);">${failCount}</div>
              <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Belum Lulus (<70%)</div>
              <div style="color: var(--danger); font-weight: 600; margin-top: var(--spacing-sm);">${(100 - passPercentage).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showScreen(screen) {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.style.display = 'none');
    document.getElementById(`view-${screen}`).style.display = 'block';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  }

  // ================================
  // DATA EXPORT
  // ================================

  exportToCSV() {
    const headers = ['Siswa', 'Kelas', 'Topik', 'Nilai', 'Benar', 'Total', 'Waktu(s)', 'Tanggal'];
    const rows = this.allScores.map(s => [
      s.studentName,
      s.studentClass,
      s.topicTitle,
      s.score,
      s.correctCount,
      s.totalQuestions,
      s.timeSpent,
      new Date(s.timestamp).toLocaleString('id-ID')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    this.downloadFile(csv, `grammar-quiz-hasil-${new Date().getTime()}.csv`, 'text/csv');
    this.showAlert('✓ Data berhasil diexport ke CSV', 'success');
  }

  exportToExcel() {
    // Simple XLSX export (requires SheetJS or similar - for now using CSV as fallback)
    let xlsxContent = 'Siswa\tKelas\tTopik\tNilai\tBenar\tTotal\tWaktu(s)\tTanggal\n';
    this.allScores.forEach(s => {
      xlsxContent += `${s.studentName}\t${s.studentClass}\t${s.topicTitle}\t${s.score}\t${s.correctCount}\t${s.totalQuestions}\t${s.timeSpent}\t${new Date(s.timestamp).toLocaleString('id-ID')}\n`;
    });

    this.downloadFile(xlsxContent, `grammar-quiz-hasil-${new Date().getTime()}.xlsx`, 'application/vnd.ms-excel');
    this.showAlert('✓ Data berhasil diexport ke Excel', 'success');
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  resetAllScores() {
    // Create a better confirmation modal
    const modalHTML = `
      <div class="modal-overlay" id="resetConfirmModal">
        <div class="modal-content">
          <h2>⚠️ Konfirmasi Reset Data</h2>
          <p style="color: #d32f2f; font-weight: bold; margin: 15px 0;">
            Apakah Anda yakin ingin menghapus SEMUA data nilai siswa?
          </p>
          <p style="color: #666; font-size: 14px;">
            Tindakan ini TIDAK DAPAT DIBATALKAN!
          </p>
          <div class="modal-buttons">
            <button id="resetConfirmYes" class="btn-danger" style="margin-right: 10px;">
              Ya, Hapus Semua Data
            </button>
            <button id="resetConfirmNo" class="btn-outline">
              Batal
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle confirmation
    document.getElementById('resetConfirmYes').addEventListener('click', () => {
      this.allScores = [];
      this.saveScoresToStorage();
      document.getElementById('resetConfirmModal').remove();
      this.showAlert('✓ Semua data nilai telah dihapus', 'success');
      setTimeout(() => {
        this.showAdminDashboard();
      }, 500);
    });
    
    // Handle cancel
    document.getElementById('resetConfirmNo').addEventListener('click', () => {
      document.getElementById('resetConfirmModal').remove();
    });
    
    // Close modal when clicking overlay
    document.getElementById('resetConfirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'resetConfirmModal') {
        document.getElementById('resetConfirmModal').remove();
      }
    });
  }

  // ================================
  // DATA MANAGEMENT
  // ================================

  saveScore(scoreData) {
    this.allScores.push(scoreData);
    this.saveScoresToStorage();
  }

  saveScoresToStorage() {
    localStorage.setItem('grammarQuizScores', JSON.stringify(this.allScores));
  }

  loadScoresFromStorage() {
    const data = localStorage.getItem('grammarQuizScores');
    return data ? JSON.parse(data) : [];
  }

  getUserTopicScore(studentName, topicId) {
    const scores = this.allScores.filter(s => s.studentName === studentName && s.topic === topicId);
    if (scores.length === 0) return null;
    const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    return Math.round(avg);
  }

  calculateUserStats() {
    const userScores = this.allScores.filter(s => s.studentName === this.currentUser.name);
    const topicIds = new Set(userScores.map(s => s.topic));
    const completedTopics = topicIds.size;
    const totalQuizzes = userScores.length;
    const averageScore = totalQuizzes > 0 
      ? userScores.reduce((sum, s) => sum + s.score, 0) / totalQuizzes 
      : 0;
    const highestScore = totalQuizzes > 0 
      ? Math.max(...userScores.map(s => s.score)) 
      : 0;
    const lowestScore = totalQuizzes > 0 
      ? Math.min(...userScores.map(s => s.score)) 
      : 0;

    return { completedTopics, totalQuizzes, averageScore, highestScore, lowestScore };
  }

  // ================================
  // UTILITIES
  // ================================

  getScoreMessage(score) {
    if (score >= 90) return 'Luar Biasa!';
    if (score >= 80) return 'Sangat Bagus!';
    if (score >= 70) return 'Bagus!';
    if (score >= 60) return 'Cukup Baik';
    return 'Perlu Ditingkatkan';
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🌟';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📚';
    return '💪';
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs}s`;
    return `${minutes}m ${secs}s`;
  }

  showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
      <span>${message}</span>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => alertDiv.remove(), 3000);
  }
}

// ================================
// INITIALIZE APP
// ================================

let app;

// Handle both early and late loading
function initializeGrammarQuizApp() {
  if (window.quizData && window.quizData.topics) {
    console.log('Initializing GrammarQuizApp');
    app = new GrammarQuizApp();
  } else {
    console.error('Quiz data not available yet');
    setTimeout(initializeGrammarQuizApp, 100);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeGrammarQuizApp);
} else {
  initializeGrammarQuizApp();
}
