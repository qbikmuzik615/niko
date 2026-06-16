'use strict';
/* Sophia's Math Quest – Game Engine */

const $ = id => document.getElementById(id);
const SAVE_KEY = 'smq_sophia_v2';

let fluid, state = {
  xp: 0,
  stageProgress: {}, // stageId → { stars, bestScore }
  currentStage: null,
  qIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCount: 0,
  answered: false,
  questions: [],
};

/* ── PERSISTENCE ── */
function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    xp: state.xp,
    stageProgress: state.stageProgress,
  }));
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    state.xp = d.xp || 0;
    state.stageProgress = d.stageProgress || {};
  } catch(e) {}
}

/* ── FLUID HELPERS ── */
function fluidBurst(correct) {
  const c = $('c');
  const x = 0.3 + Math.random() * 0.4;
  const y = 0.3 + Math.random() * 0.4;
  if (correct) fluid.burst(x, y);
  else fluid.splat(x, y, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3);
}

/* ── SPLASH ── */
function initSplash() {
  const splash = $('splash');
  const canvas = $('c');
  fluid = new Fluid(canvas);

  const go = () => {
    splash.classList.add('fade-out');
    setTimeout(() => { splash.style.display = 'none'; showStageSelect(); }, 700);
  };
  splash.addEventListener('click', go, {once: true});
  splash.addEventListener('touchend', go, {once: true, passive: true});
}

/* ── STAGE SELECT ── */
function showStageSelect() {
  hideAll();
  $('stageScreen').classList.remove('hidden');
  $('totalXp').textContent = state.xp + ' XP';
  renderStageGrid();
}

function renderStageGrid() {
  const grid = $('stageGrid');
  grid.innerHTML = '';
  STAGES.forEach((stage, i) => {
    const prev = i === 0 ? null : STAGES[i - 1];
    const unlocked = i === 0 || !!(state.stageProgress[prev.id]?.stars >= 1);
    const prog = state.stageProgress[stage.id] || {};
    const stars = prog.stars || 0;

    const card = document.createElement('div');
    card.className = 'stage-card' + (unlocked ? '' : ' locked');
    card.style.setProperty('--card-gradient', stage.gradient);
    card.innerHTML = `
      <span class="stage-emoji">${stage.emoji}</span>
      <div class="stage-name">${stage.name}</div>
      <div class="stage-desc">${stage.desc}</div>
      <div class="stage-stars">
        ${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}
      </div>
      ${!unlocked ? '<span class="stage-lock">🔒</span>' : ''}
    `;
    if (unlocked) card.addEventListener('click', () => startStage(stage.id));
    grid.appendChild(card);
  });
}

/* ── GAME ── */
function startStage(stageId) {
  const stage = STAGES.find(s => s.id === stageId);
  if (!stage) return;

  // Shuffle and pick up to 12 questions
  const qs = [...stage.questions].sort(() => Math.random() - 0.5).slice(0, 12);

  state.currentStage = stage;
  state.questions = qs;
  state.qIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.correctCount = 0;

  hideAll();
  $('gameScreen').classList.remove('hidden');
  $('stageBadge').textContent = stage.emoji + ' ' + stage.name;
  $('stageBadge').style.borderColor = stage.color;
  $('scoreDisplay').textContent = '0';
  $('streakBanner').classList.add('hidden');

  showQuestion();
}

function showQuestion() {
  const q = state.questions[state.qIndex];
  const total = state.questions.length;
  state.answered = false;

  // Progress
  $('qCounter').textContent = (state.qIndex + 1) + '/' + total;
  $('progressFill').style.width = (state.qIndex / total * 100) + '%';

  // Stack display
  const stackEl = $('stackDisplay');
  if (q.stack) {
    stackEl.classList.remove('hidden');
    stackEl.innerHTML = q.stack.map((line, i) => {
      if (i === 0) return `<span class="stack-line">${line}</span>`;
      if (i === q.stack.length - 1) return `<span class="stack-divider"></span>`;
      return `<span class="stack-line stack-op">${line}</span>`;
    }).join('');
  } else {
    stackEl.classList.add('hidden');
  }

  // Question
  $('questionText').textContent = q.q;

  // Hint
  const hintEl = $('hintBox');
  if (q.hint) {
    hintEl.textContent = '💡 Hint: ' + q.hint;
    hintEl.classList.remove('hidden');
  } else {
    hintEl.classList.add('hidden');
  }

  // Answers (shuffle choices)
  const grid = $('answerGrid');
  grid.innerHTML = '';
  const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
  shuffled.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => handleAnswer(choice, q.answer));
    grid.appendChild(btn);
  });
}

function handleAnswer(chosen, correct) {
  if (state.answered) return;
  state.answered = true;

  const isCorrect = chosen === correct;
  const grid = $('answerGrid');
  const btns = grid.querySelectorAll('.answer-btn');

  btns.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) btn.classList.add('reveal');
  });

  if (isCorrect) {
    // Find and mark correct button
    btns.forEach(btn => { if (btn.textContent === chosen) btn.classList.add('correct'); });
    state.streak++;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.correctCount++;

    const xpGain = 10 + Math.min(state.streak * 3, 15);
    state.score += xpGain;
    state.xp += xpGain;
    $('scoreDisplay').textContent = state.score;

    // Streak banner
    if (state.streak >= 3) {
      const el = $('streakBanner');
      el.textContent = `🔥 ${state.streak} in a row! +${xpGain} XP`;
      el.classList.remove('hidden');
    } else {
      $('streakBanner').classList.add('hidden');
    }

    fluidBurst(true);
  } else {
    btns.forEach(btn => { if (btn.textContent === chosen) btn.classList.add('wrong'); });
    state.streak = 0;
    $('streakBanner').classList.add('hidden');
    fluidBurst(false);
  }

  save();
  setTimeout(nextQuestion, isCorrect ? 900 : 1300);
}

function nextQuestion() {
  state.qIndex++;
  if (state.qIndex >= state.questions.length) {
    endStage();
  } else {
    showQuestion();
  }
}

function endStage() {
  const stage = state.currentStage;
  const total = state.questions.length;
  const pct = state.correctCount / total;
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;

  // Update progress
  const prev = state.stageProgress[stage.id] || { stars: 0 };
  state.stageProgress[stage.id] = {
    stars: Math.max(prev.stars, stars),
    bestScore: Math.max(prev.bestScore || 0, state.score),
  };
  save();

  // Show complete screen
  hideAll();
  $('completeScreen').classList.remove('hidden');
  $('completeEmoji').textContent = stars === 3 ? '🏆' : stars === 2 ? '⭐' : '🎉';
  $('completeTitle').textContent = stars === 3 ? 'Amazing Work!' : stars === 2 ? 'Great Job!' : 'Well Done!';
  $('starsRow').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('statCorrect').textContent = state.correctCount + '/' + total;
  $('statXp').textContent = '+' + state.score;
  $('statStreak').textContent = state.bestStreak;

  // Next stage button
  const nextStageIdx = STAGES.findIndex(s => s.id === stage.id) + 1;
  const nextBtn = $('nextStageBtn');
  if (nextStageIdx < STAGES.length) {
    nextBtn.textContent = 'Next Quest: ' + STAGES[nextStageIdx].emoji + ' ' + STAGES[nextStageIdx].name + ' →';
    nextBtn.onclick = () => startStage(STAGES[nextStageIdx].id);
  } else {
    nextBtn.textContent = '🏆 All Quests Complete!';
    nextBtn.onclick = showStageSelect;
  }

  $('retryBtn').onclick = () => startStage(stage.id);
  $('homeBtn').onclick = showStageSelect;

  // Celebration burst
  setTimeout(() => { for (let i = 0; i < 4; i++) setTimeout(() => fluidBurst(true), i * 200); }, 200);
}

/* ── NAVIGATION ── */
function hideAll() {
  ['stageScreen', 'gameScreen', 'completeScreen'].forEach(id => $(''+id).classList.add('hidden'));
}

$('backBtn').addEventListener('click', showStageSelect);

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  load();
  initSplash();
});
