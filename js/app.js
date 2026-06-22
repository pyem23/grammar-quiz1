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
    this.lockedAnswers = {}; // Track which answers are locked with explanation
    this.quizStartTime = null;
    this.isAdminMode = false;
    
    // Sorting state
    this.sortColumn = 'timestamp';
    this.sortOrder = 'desc'; // 'asc' or 'desc'
    
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
      if (e.target.classList.contains('topic-btn') || e.target.closest('.topic-btn')) {
        const btn = e.target.classList.contains('topic-btn') ? e.target : e.target.closest('.topic-btn');
        // Only start quiz if topic is not disabled
        if (!btn.disabled) {
          this.startQuiz(btn.dataset.topic);
        }
      }
      // Note: nextQuestion, prevQuestion, submitQuiz, lockAnswerBtn have direct listeners in showQuiz()
      // Do not add event delegation here to avoid duplicate event triggers
      
      // Results
      if (e.target.id === 'backToDashboardBtn') this.showDashboard();
      if (e.target.id === 'viewDetailsBtn') this.showResultsDetail();
      
      // Admin
      if (e.target.id === 'exportDataBtn') this.exportToCSV();
      if (e.target.id === 'exportExcelBtn') this.exportToExcel();
      if (e.target.id === 'resetOptionsBtn') this.showResetOptions();
      
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
    // Clean up any open modals
    this.cleanupAllModals();
    
    this.currentUser = null;
    this.currentScreen = 'login';
    this.isAdminMode = false;
    this.renderLoginScreen();
  }

  // Helper function to clean up all modals
  cleanupAllModals() {
    const modalIds = [
      'lockConfirmModal',
      'resetOptionsModal',
      'studentListModal',
      'classListModal',
      'resetAllConfirmModal',
      'studentConfirmModal',
      'classConfirmModal'
    ];
    
    modalIds.forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.remove();
      }
    });
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
                  const isCompleted = topicScore !== null;
                  const statusClass = isCompleted ? 'completed' : '';
                  return `
                    <li title="${isCompleted ? 'Topik sudah diselesaikan' : ''}">
                      <button class="nav-btn topic-btn ${statusClass}" data-topic="${topic.id}"
                        ${isCompleted ? 'disabled' : ''}>
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                          <span>${isCompleted ? '🔒' : ''} ${topic.number}. ${topic.title}</span>
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
    this.lockedAnswers = {}; // Reset locked answers for new topic
    this.quizStartTime = Date.now();
    this.showQuiz();
  }

  showQuiz() {
    const topic = window.quizData.topics.find(t => t.id === this.currentTopic);
    const question = topic.questions[this.currentQuestion];
    const progress = ((this.currentQuestion + 1) / topic.questions.length) * 100;
    const isAnswered = this.userAnswers[this.currentQuestion] !== undefined;
    const isLocked = this.lockedAnswers[this.currentQuestion];

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
                    ${isSelected ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
                  <label for="opt_${index}">${option}</label>
                </div>
              `;
            }).join('')}
          </div>

          ${isAnswered && !isLocked ? `
            <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md);">
              <button id="lockAnswerBtn" class="btn-primary" style="flex: 1;">
                🔒 Kunci Pilihan & Lihat Penjelasan
              </button>
            </div>
          ` : ''}

          ${isLocked ? `
            <div class="explanation show">
              <div class="explanation-title">✓ Penjelasan</div>
              <div class="explanation-text">${question.explanation}</div>
            </div>
          ` : ''}
        </div>

        <div class="quiz-controls">
          <button id="prevQuestionBtn" class="btn-outline" 
            ${this.currentQuestion === 0 || isLocked ? 'disabled' : ''}>
            ← Sebelumnya
          </button>
          
          ${this.currentQuestion < topic.questions.length - 1 ? `
            <button id="nextQuestionBtn" class="btn-primary" 
              ${!isAnswered || !isLocked ? 'disabled' : ''}>
              Selanjutnya →
            </button>
          ` : `
            <button id="submitQuizBtn" class="btn-success"
              ${!isAnswered || !isLocked ? 'disabled' : ''}>
              Selesaikan Quiz ✓
            </button>
          `}
        </div>
      </div>
    `;
    
    // Attach event listeners to dynamically rendered buttons
    setTimeout(() => {
      // Lock answer button
      const lockBtn = document.getElementById('lockAnswerBtn');
      if (lockBtn) {
        lockBtn.addEventListener('click', () => this.showLockConfirmation());
      }
      
      // Navigation buttons
      const prevBtn = document.getElementById('prevQuestionBtn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.prevQuestion());
      }
      
      const nextBtn = document.getElementById('nextQuestionBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextQuestion());
      }
      
      const submitBtn = document.getElementById('submitQuizBtn');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitQuiz());
      }
      
      // Note: Radio button event listeners handled by event delegation in setupEventListeners (line 77)
    }, 0);
  }

  selectAnswer(optionIndex) {
    // Ensure optionIndex is a number
    // Parse as base-10, default to -1 if invalid
    const parsed = parseInt(optionIndex, 10);
    if (!isNaN(parsed)) {
      this.userAnswers[this.currentQuestion] = parsed;
      this.showQuiz();
    }
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

  showLockConfirmation() {
    // Remove any existing lock confirmation modal
    const existingModal = document.getElementById('lockConfirmModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    const modalHTML = `
      <div class="modal-overlay" id="lockConfirmModal">
        <div class="modal-content">
          <h2>🔒 Kunci Jawaban</h2>
          <p style="margin: 15px 0;">
            Apakah Anda yakin ingin mengunci jawaban ini?<br>
            <small style="color: #666;">Setelah dikunci, Anda tidak bisa mengubah jawaban dan penjelasan akan ditampilkan.</small>
          </p>
          <div class="modal-buttons">
            <button id="lockYesBtn" class="btn-primary" style="margin-right: 10px;">
              Ya, Kunci Jawaban
            </button>
            <button id="lockNoBtn" class="btn-outline">
              Batal
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle yes
    document.getElementById('lockYesBtn').addEventListener('click', () => {
      this.lockAnswer();
      document.getElementById('lockConfirmModal').remove();
    });
    
    // Handle no
    document.getElementById('lockNoBtn').addEventListener('click', () => {
      document.getElementById('lockConfirmModal').remove();
    });
    
    // Close on overlay click
    document.getElementById('lockConfirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'lockConfirmModal') {
        document.getElementById('lockConfirmModal').remove();
      }
    });
  }

  lockAnswer() {
    this.lockedAnswers[this.currentQuestion] = true;
    this.showQuiz();
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
    // Clean up any open modals
    this.cleanupAllModals();
    
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
    // Clean up any open modals
    this.cleanupAllModals();
    
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

        <!-- Table -->
        <div class="card">
          <div class="card-header">📋 Semua Nilai Quiz</div>
          <div class="card-body">
            ${this.renderAllScoresTable()}
          </div>
          <div style="margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
            <button id="exportDataBtn" class="btn-primary">📥 Export CSV</button>
            <button id="exportExcelBtn" class="btn-primary">📊 Export Excel</button>
            <button id="resetOptionsBtn" class="btn-danger">🗑️ Reset Nilai</button>
          </div>
        </div>
      </div>
    `;
    
    // Attach sorting listeners to table headers
    setTimeout(() => {
      const headers = document.querySelectorAll('th[data-sort]');
      headers.forEach(header => {
        header.addEventListener('click', (e) => {
          const column = e.target.dataset.sort;
          if (this.sortColumn === column) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            this.sortColumn = column;
            this.sortOrder = 'asc';
          }
          this.showAdminDashboard();
        });
      });
    }, 0);
  }

  renderAllScoresTable() {
    let scores = [...this.allScores]; // Create a copy to avoid mutating
    
    // Apply sorting
    scores.sort((a, b) => {
      let aVal, bVal;
      
      switch(this.sortColumn) {
        case 'studentName':
          aVal = a.studentName.toLowerCase();
          bVal = b.studentName.toLowerCase();
          break;
        case 'studentClass':
          aVal = a.studentClass.toLowerCase();
          bVal = b.studentClass.toLowerCase();
          break;
        case 'topicTitle':
          aVal = a.topicTitle.toLowerCase();
          bVal = b.topicTitle.toLowerCase();
          break;
        case 'score':
          aVal = a.score;
          bVal = b.score;
          break;
        case 'timeSpent':
          aVal = a.timeSpent;
          bVal = b.timeSpent;
          break;
        case 'timestamp':
        default:
          aVal = new Date(a.timestamp);
          bVal = new Date(b.timestamp);
      }
      
      // Compare
      if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    if (scores.length === 0) {
      return '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-lg);">Tidak ada data quiz</p>';
    }

    return `
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="cursor: pointer;" data-sort="studentName">Siswa</th>
              <th style="cursor: pointer;" data-sort="studentClass">Kelas</th>
              <th style="cursor: pointer;" data-sort="topicTitle">Topik</th>
              <th style="cursor: pointer;" data-sort="score">Nilai</th>
              <th>Benar/Total</th>
              <th style="cursor: pointer;" data-sort="timeSpent">Waktu</th>
              <th style="cursor: pointer;" data-sort="timestamp">Tanggal</th>
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
                <div style="text-align: right; display: flex; align-items: center; gap: var(--spacing-sm);">
                  <div>
                    <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${avg}</div>
                    <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Rata-rata</div>
                  </div>
                  <button class="btn-danger btn-sm" data-reset-student="${name}" style="padding: 6px 10px; font-size: 12px; white-space: nowrap;">
                    🗑️ Hapus
                  </button>
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

  renderByClassView() {
    const classes = {};
    this.allScores.forEach(score => {
      if (!classes[score.studentClass]) {
        classes[score.studentClass] = [];
      }
      classes[score.studentClass].push(score);
    });

    if (Object.keys(classes).length === 0) {
      return '<p style="color: var(--text-secondary); text-align: center; padding: var(--spacing-lg);">Tidak ada data quiz</p>';
    }

    return `
      <div style="display: grid; gap: var(--spacing-lg);">
        ${Object.entries(classes).sort().map(([className, scores]) => {
          const avg = (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1);
          const studentCount = new Set(scores.map(s => s.studentName)).size;
          const passCount = scores.filter(s => s.score >= 70).length;
          const passPercentage = ((passCount / scores.length) * 100).toFixed(1);
          
          return `
            <div style="background: var(--light); padding: var(--spacing-md); border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                <div>
                  <div style="font-weight: 600; font-size: 16px;">${className}</div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                  <button class="btn-danger btn-sm" data-reset-class="${className}" style="padding: 6px 10px; font-size: 12px; white-space: nowrap;">
                    🗑️ Hapus
                  </button>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
                <div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Jumlah Siswa</div>
                  <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${studentCount}</div>
                </div>
                <div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Total Quiz</div>
                  <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${scores.length}</div>
                </div>
                <div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Rata-rata</div>
                  <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${avg}</div>
                </div>
                <div>
                  <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">Lulus</div>
                  <div style="font-size: 18px; font-weight: 700; color: var(--success);">${passPercentage}%</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
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

  // ================================
  // RESET FUNCTIONS - MULTI-STEP POPUPS
  // ================================

  showResetOptions() {
    const modalHTML = `
      <div class="modal-overlay" id="resetOptionsModal">
        <div class="modal-content">
          <h2>🗑️ Reset Nilai Siswa</h2>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">
            Pilih opsi reset nilai yang ingin dilakukan:
          </p>
          <div class="modal-buttons" style="flex-direction: column; gap: 10px;">
            <button id="resetStudentOptBtn" class="btn-danger" style="width: 100%; text-align: left; padding: 15px;">
              👤 Reset per Siswa
            </button>
            <button id="resetClassOptBtn" class="btn-danger" style="width: 100%; text-align: left; padding: 15px;">
              🏫 Reset per Kelas
            </button>
            <button id="resetAllOptBtn" class="btn-danger" style="width: 100%; text-align: left; padding: 15px;">
              ⚠️ Reset Semua Data
            </button>
            <button id="resetBackBtn" class="btn-outline" style="width: 100%;">
              ← Batal
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add direct event listeners to buttons
    const modal = document.getElementById('resetOptionsModal');
    document.getElementById('resetStudentOptBtn').addEventListener('click', () => {
      modal.remove();
      this.showStudentList();
    });
    document.getElementById('resetClassOptBtn').addEventListener('click', () => {
      modal.remove();
      this.showClassList();
    });
    document.getElementById('resetAllOptBtn').addEventListener('click', () => {
      modal.remove();
      this.showResetAllConfirmation();
    });
    document.getElementById('resetBackBtn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'resetOptionsModal') {
        modal.remove();
      }
    });
  }

  showStudentList() {
    // Get all unique students
    const students = [...new Set(this.allScores.map(s => ({name: s.studentName, class: s.studentClass})))];
    const studentMap = {};
    students.forEach(s => {
      if (!studentMap[s.name]) studentMap[s.name] = s.class;
    });
    
    if (Object.keys(studentMap).length === 0) {
      this.showAlert('Tidak ada data siswa', 'error');
      return;
    }
    
    const modalHTML = `
      <div class="modal-overlay" id="studentListModal">
        <div class="modal-content" style="max-height: 80vh; overflow-y: auto;">
          <h2>👤 Pilih Siswa untuk Reset</h2>
          
          <div style="margin: 15px 0;">
            <button id="selectAllStudentsBtn" class="btn-outline" style="width: 100%; margin-bottom: 10px;">
              ☑️ Select All
            </button>
          </div>
          
          <div id="studentChecklistContainer" style="border: 1px solid var(--border); border-radius: 6px; padding: 10px; margin: 15px 0;">
            ${Object.entries(studentMap).map(([name, cls]) => `
              <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid var(--border);">
                <input type="checkbox" class="student-checkbox" data-student="${name}" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                <div style="flex: 1;">
                  <div style="font-weight: 600;">${name}</div>
                  <div style="color: var(--text-secondary); font-size: 12px;">${cls}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="modal-buttons">
            <button id="studentListConfirmBtn" class="btn-danger" style="margin-right: 10px;">
              Confirm Reset
            </button>
            <button id="studentListBackBtn" class="btn-outline">
              ← Back
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Remove previous modal
    const prevModal = document.getElementById('resetOptionsModal');
    if (prevModal) prevModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Select All handler
    document.getElementById('selectAllStudentsBtn').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.student-checkbox');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
    });
    
    // Add direct event listeners for confirm and back buttons
    const modal = document.getElementById('studentListModal');
    document.getElementById('studentListConfirmBtn').addEventListener('click', () => {
      this.showStudentConfirmation();
    });
    document.getElementById('studentListBackBtn').addEventListener('click', () => {
      modal.remove();
      this.showResetOptions();
    });
    
    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'studentListModal') {
        modal.remove();
      }
    });
  }

  showClassList() {
    // Get all unique classes
    const classes = [...new Set(this.allScores.map(s => s.studentClass))].sort();
    
    if (classes.length === 0) {
      this.showAlert('Tidak ada data kelas', 'error');
      return;
    }
    
    const modalHTML = `
      <div class="modal-overlay" id="classListModal">
        <div class="modal-content" style="max-height: 80vh; overflow-y: auto;">
          <h2>🏫 Pilih Kelas untuk Reset</h2>
          
          <div style="margin: 15px 0;">
            <button id="selectAllClassesBtn" class="btn-outline" style="width: 100%; margin-bottom: 10px;">
              ☑️ Select All
            </button>
          </div>
          
          <div id="classChecklistContainer" style="border: 1px solid var(--border); border-radius: 6px; padding: 10px; margin: 15px 0;">
            ${classes.map(cls => {
              const count = this.allScores.filter(s => s.studentClass === cls).length;
              return `
                <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid var(--border);">
                  <input type="checkbox" class="class-checkbox" data-class="${cls}" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">${cls}</div>
                    <div style="color: var(--text-secondary); font-size: 12px;">${count} data nilai</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="modal-buttons">
            <button id="classListConfirmBtn" class="btn-danger" style="margin-right: 10px;">
              Confirm Reset
            </button>
            <button id="classListBackBtn" class="btn-outline">
              ← Back
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Remove previous modal
    const prevModal = document.getElementById('resetOptionsModal');
    if (prevModal) prevModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Select All handler
    document.getElementById('selectAllClassesBtn').addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.class-checkbox');
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      checkboxes.forEach(cb => cb.checked = !allChecked);
    });
    
    // Add direct event listeners for confirm and back buttons
    const modal = document.getElementById('classListModal');
    document.getElementById('classListConfirmBtn').addEventListener('click', () => {
      this.showClassConfirmation();
    });
    document.getElementById('classListBackBtn').addEventListener('click', () => {
      modal.remove();
      this.showResetOptions();
    });
    
    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'classListModal') {
        modal.remove();
      }
    });
  }

  showResetAllConfirmation() {
    const modalHTML = `
      <div class="modal-overlay" id="resetAllConfirmModal">
        <div class="modal-content">
          <h2>⚠️ Reset Semua Data</h2>
          <p style="color: #d32f2f; font-weight: bold; margin: 15px 0;">
            Apakah Anda yakin ingin menghapus SEMUA data nilai siswa?
          </p>
          <p style="color: #666; font-size: 14px;">
            Tindakan ini TIDAK DAPAT DIBATALKAN!
          </p>
          <div class="modal-buttons">
            <button id="resetAllConfirmYesBtn" class="btn-danger" style="margin-right: 10px;">
              Ya, Hapus Semua Data
            </button>
            <button id="resetAllConfirmNoBtn" class="btn-outline">
              Tidak, Kembali
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Remove previous modal
    const prevModal = document.getElementById('resetOptionsModal');
    if (prevModal) prevModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle confirmation
    document.getElementById('resetAllConfirmYesBtn').addEventListener('click', () => {
      this.allScores = [];
      this.saveScoresToStorage();
      document.getElementById('resetAllConfirmModal').remove();
      this.showAlert('✓ Semua data nilai telah dihapus', 'success');
      setTimeout(() => {
        this.showAdminDashboard();
      }, 500);
    });
    
    // Handle cancel
    document.getElementById('resetAllConfirmNoBtn').addEventListener('click', () => {
      document.getElementById('resetAllConfirmModal').remove();
      this.showResetOptions();
    });
    
    // Close modal when clicking overlay
    document.getElementById('resetAllConfirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'resetAllConfirmModal') {
        document.getElementById('resetAllConfirmModal').remove();
      }
    });
  }

  showStudentConfirmation() {
    // Get selected students
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const selectedStudents = Array.from(checkboxes).map(cb => cb.dataset.student);
    
    if (selectedStudents.length === 0) {
      this.showAlert('Silakan pilih minimal satu siswa', 'error');
      return;
    }
    
    const modalHTML = `
      <div class="modal-overlay" id="studentConfirmModal">
        <div class="modal-content">
          <h2>⚠️ Konfirmasi Reset</h2>
          <p style="margin: 15px 0;">
            Reset nilai untuk ${selectedStudents.length} siswa berikut?
          </p>
          <div style="background: var(--light); padding: 10px; border-radius: 6px; margin: 15px 0; max-height: 200px; overflow-y: auto;">
            ${selectedStudents.map(name => `<div style="padding: 5px;">• ${name}</div>`).join('')}
          </div>
          <p style="color: #d32f2f; font-weight: bold;">
            Apakah Anda yakin?
          </p>
          <div class="modal-buttons">
            <button id="studentConfirmYesBtn" class="btn-danger" style="margin-right: 10px;">
              Ya, Hapus
            </button>
            <button id="studentConfirmNoBtn" class="btn-outline">
              Tidak, Kembali
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Remove previous modal
    const prevModal = document.getElementById('studentListModal');
    if (prevModal) prevModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle confirmation
    document.getElementById('studentConfirmYesBtn').addEventListener('click', () => {
      selectedStudents.forEach(studentName => {
        this.allScores = this.allScores.filter(s => s.studentName !== studentName);
      });
      this.saveScoresToStorage();
      document.getElementById('studentConfirmModal').remove();
      this.showAlert(`✓ Data ${selectedStudents.length} siswa telah dihapus`, 'success');
      setTimeout(() => {
        this.showAdminDashboard();
      }, 500);
    });
    
    // Handle cancel
    document.getElementById('studentConfirmNoBtn').addEventListener('click', () => {
      document.getElementById('studentConfirmModal').remove();
      this.showStudentList();
    });
    
    // Close modal when clicking overlay
    document.getElementById('studentConfirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'studentConfirmModal') {
        document.getElementById('studentConfirmModal').remove();
      }
    });
  }

  showClassConfirmation() {
    // Get selected classes
    const checkboxes = document.querySelectorAll('.class-checkbox:checked');
    const selectedClasses = Array.from(checkboxes).map(cb => cb.dataset.class);
    
    if (selectedClasses.length === 0) {
      this.showAlert('Silakan pilih minimal satu kelas', 'error');
      return;
    }
    
    const modalHTML = `
      <div class="modal-overlay" id="classConfirmModal">
        <div class="modal-content">
          <h2>⚠️ Konfirmasi Reset</h2>
          <p style="margin: 15px 0;">
            Reset nilai untuk ${selectedClasses.length} kelas berikut?
          </p>
          <div style="background: var(--light); padding: 10px; border-radius: 6px; margin: 15px 0; max-height: 200px; overflow-y: auto;">
            ${selectedClasses.map(cls => `<div style="padding: 5px;">• ${cls}</div>`).join('')}
          </div>
          <p style="color: #d32f2f; font-weight: bold;">
            Apakah Anda yakin?
          </p>
          <div class="modal-buttons">
            <button id="classConfirmYesBtn" class="btn-danger" style="margin-right: 10px;">
              Ya, Hapus
            </button>
            <button id="classConfirmNoBtn" class="btn-outline">
              Tidak, Kembali
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Remove previous modal
    const prevModal = document.getElementById('classListModal');
    if (prevModal) prevModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle confirmation
    document.getElementById('classConfirmYesBtn').addEventListener('click', () => {
      selectedClasses.forEach(className => {
        this.allScores = this.allScores.filter(s => s.studentClass !== className);
      });
      this.saveScoresToStorage();
      document.getElementById('classConfirmModal').remove();
      this.showAlert(`✓ Data ${selectedClasses.length} kelas telah dihapus`, 'success');
      setTimeout(() => {
        this.showAdminDashboard();
      }, 500);
    });
    
    // Handle cancel
    document.getElementById('classConfirmNoBtn').addEventListener('click', () => {
      document.getElementById('classConfirmModal').remove();
      this.showClassList();
    });
    
    // Close modal when clicking overlay
    document.getElementById('classConfirmModal').addEventListener('click', (e) => {
      if (e.target.id === 'classConfirmModal') {
        document.getElementById('classConfirmModal').remove();
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

// Instantiate immediately when script loads
try {
  if (window.quizData && window.quizData.topics && window.quizData.topics.length > 0) {
    console.log('✓ Initializing GrammarQuizApp with', window.quizData.topics.length, 'topics');
    app = new GrammarQuizApp();
  } else {
    console.error('❌ ERROR: Quiz data not available or invalid');
    console.log('window.quizData:', window.quizData);
    document.getElementById('app').innerHTML = '<div style="padding: 40px; color: red; text-align: center; font-family: Arial;"><h2>❌ Error</h2><p>Quiz data not loaded properly</p><p style="font-size: 12px;">Check console (F12) for details</p></div>';
  }
} catch (error) {
  console.error('❌ ERROR initializing app:', error);
  document.getElementById('app').innerHTML = '<div style="padding: 40px; color: red; text-align: center; font-family: Arial;"><h2>❌ Initialization Error</h2><p>' + error.message + '</p></div>';
}
