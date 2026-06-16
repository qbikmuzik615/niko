import { FluidSimulation } from './fluid-simulation.js';

const $ = id => document.getElementById(id);
const SAVE_KEY = 'smq_sophia_v3';

const defaultSettings = { sound:true, swirl:6, rainbow:5, startBlank:true, visibleTime:0.985, colorRotationSpeed:0.12, bloom:true, bloomIntensity:0.7, splatRadius:0.18, vorticity:22 };
let settings = Object.assign({}, defaultSettings);
let progress = {}; // stageId → { stars, xp }
let totalXp = 0;
let fluid;

// ── current game state ──
let currentStage = null, questions = [], qIndex = 0, score = 0, streak = 0, bestStreak = 0, correctCount = 0, answered = false;

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ settings, progress, totalXp }));
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    if (d.settings) Object.assign(settings, d.settings);
    if (d.progress) progress = d.progress;
    if (d.totalXp) totalXp = d.totalXp;
  } catch(e) {}
}

// ── FLUID helpers ──
function fluidBurst() {
  if (!fluid) return;
  const x = 0.25 + Math.random() * 0.5, y = 0.25 + Math.random() * 0.5;
  fluid.burst(x, y);
}
function fluidRipple() {
  if (!fluid) return;
  fluid.ripple(0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4);
}

// ── SPLASH → STAGE SELECT ──
function initFluid() {
  const canvas = $('fluidCanvas');
  fluid = new FluidSimulation(canvas, { ...settings });
  fluid.start();

  const go = () => {
    $('splashUi').classList.add('fade-out');
    setTimeout(showStageSelect, 650);
  };
  canvas.addEventListener('touchend', go, { once: true, passive: true });
  canvas.addEventListener('mouseup', go, { once: true });
}

// ── STAGE SELECT ──
function showStageSelect() {
  $('app').classList.add('hidden');
  $('stageComplete').classList.add('hidden');
  $('stageSelect').classList.remove('hidden');
  $('totalXp').textContent = totalXp + ' XP';
  renderGrid();
}

function renderGrid() {
  const grid = $('stageGrid');
  grid.innerHTML = '';
  STAGES.forEach((stage, i) => {
    const unlocked = i === 0 || !!(progress[STAGES[i-1].id]?.stars >= 1);
    const p = progress[stage.id] || {};
    const stars = p.stars || 0;
    const card = document.createElement('div');
    card.className = 'stage-card' + (unlocked ? '' : ' locked');
    card.innerHTML =
      `<span class="stage-emoji">${stage.emoji}</span>` +
      `<div class="stage-name">${stage.name}</div>` +
      `<div class="stage-desc">${stage.desc}</div>` +
      `<div class="stage-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>` +
      (!unlocked ? '<span class="stage-lock">🔒</span>' : '');
    if (unlocked) card.addEventListener('click', () => startStage(stage.id));
    grid.appendChild(card);
  });
}

// ── START STAGE ──
function startStage(stageId) {
  currentStage = STAGES.find(s => s.id === stageId);
  questions = [...currentStage.questions].sort(() => Math.random() - 0.5).slice(0, 12);
  qIndex = 0; score = 0; streak = 0; bestStreak = 0; correctCount = 0;

  $('stageSelect').classList.add('hidden');
  $('stageComplete').classList.add('hidden');
  $('app').classList.remove('hidden');
  $('stageBadge').textContent = currentStage.emoji + ' ' + currentStage.name;
  $('scoreBadge').textContent = '0';
  $('streakBanner').classList.add('hidden');
  showQuestion();
}

// ── SHOW QUESTION ──
function showQuestion() {
  const q = questions[qIndex];
  answered = false;

  $('qCounter').textContent = (qIndex + 1) + '/' + questions.length;
  $('progressFill').style.width = (qIndex / questions.length * 100) + '%';

  // Stack display
  const sd = $('stackDisplay');
  if (q.stack) {
    sd.classList.remove('hidden');
    sd.innerHTML = q.stack.map((line, i) => {
      if (i === 0) return `<span>${line}</span>`;
      if (i === q.stack.length - 1) return `<span class="s-div"></span>`;
      return `<span class="s-op">${line}</span>`;
    }).join('\n');
  } else {
    sd.classList.add('hidden');
  }

  $('questionText').textContent = q.q;

  const hb = $('hintBox');
  if (q.hint) { hb.textContent = '💡 ' + q.hint; hb.classList.remove('hidden'); }
  else hb.classList.add('hidden');

  const ab = $('answerButtons');
  ab.innerHTML = '';
  [...q.choices].sort(() => Math.random() - 0.5).forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.addEventListener('click', () => handleAnswer(choice, q.answer));
    ab.appendChild(btn);
  });
}

// ── HANDLE ANSWER ──
function handleAnswer(chosen, correct) {
  if (answered) return;
  answered = true;

  const btns = $('answerButtons').querySelectorAll('button');
  btns.forEach(b => { b.disabled = true; if (b.textContent === correct) b.classList.add('reveal'); });

  const isCorrect = chosen === correct;
  btns.forEach(b => { if (b.textContent === chosen) b.classList.add(isCorrect ? 'correct' : 'wrong'); });

  if (isCorrect) {
    streak++; bestStreak = Math.max(bestStreak, streak); correctCount++;
    const xp = 10 + Math.min(streak * 3, 15);
    score += xp; totalXp += xp;
    $('scoreBadge').textContent = score;
    if (streak >= 3) {
      const sb = $('streakBanner');
      sb.textContent = '🔥 ' + streak + ' in a row! +' + xp + ' XP';
      sb.classList.remove('hidden');
    }
    fluidBurst();
  } else {
    streak = 0;
    $('streakBanner').classList.add('hidden');
    fluidRipple();
  }

  save();
  setTimeout(nextQuestion, isCorrect ? 800 : 1200);
}

function nextQuestion() {
  qIndex++;
  if (qIndex >= questions.length) endStage();
  else showQuestion();
}

// ── END STAGE ──
function endStage() {
  const total = questions.length;
  const pct = correctCount / total;
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
  const prev = progress[currentStage.id] || { stars: 0, xp: 0 };
  progress[currentStage.id] = { stars: Math.max(prev.stars, stars), xp: Math.max(prev.xp || 0, score) };
  save();

  $('app').classList.add('hidden');
  $('stageComplete').classList.remove('hidden');
  $('completeEmoji').textContent = stars === 3 ? '🏆' : stars === 2 ? '⭐' : '🎉';
  $('completeTitle').textContent = stars === 3 ? 'Amazing!!' : stars === 2 ? 'Great Job!' : 'Well Done!';
  $('starsRow').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('statCorrect').textContent = correctCount + '/' + total;
  $('statXp').textContent = '+' + score;
  $('statStreak').textContent = bestStreak;

  const nextIdx = STAGES.findIndex(s => s.id === currentStage.id) + 1;
  const nb = $('btnNext');
  if (nextIdx < STAGES.length) {
    nb.textContent = STAGES[nextIdx].emoji + ' ' + STAGES[nextIdx].name + ' →';
    nb.onclick = () => startStage(STAGES[nextIdx].id);
  } else {
    nb.textContent = '🏆 All Quests Complete!';
    nb.onclick = showStageSelect;
  }
  $('btnRetry').onclick = () => startStage(currentStage.id);
  $('btnHome').onclick = showStageSelect;

  setTimeout(() => { for (let i = 0; i < 5; i++) setTimeout(fluidBurst, i * 180); }, 300);
}

// ── SETTINGS ──
function syncControls() {
  $('rngVisible').value = String(settings.visibleTime);
  $('rngColorSpeed').value = String(settings.colorRotationSpeed);
  $('rngBloom').value = String(settings.bloomIntensity);
  $('rngRadius').value = String(settings.splatRadius);
  $('rngVorticity').value = String(settings.vorticity);
  $('rngSwirl').value = String(settings.swirl);
  $('rngRainbow').value = String(settings.rainbow);
  $('tglStartBlank').classList.toggle('on', !!settings.startBlank);
  $('tglBloom').classList.toggle('on', !!settings.bloom);
  $('tglSound').classList.toggle('on', !!settings.sound);
}
function initSettings() {
  $('btnSettings').onclick = () => $('settingsPanel').classList.toggle('hidden');
  $('btnCloseSettings').onclick = () => $('settingsPanel').classList.add('hidden');
  $('btnBack').onclick = showStageSelect;

  const tog = (id, key, cb) => $(id).onclick = e => { settings[key] = !settings[key]; e.currentTarget.classList.toggle('on', settings[key]); fluid?.setConfig({ [key]: settings[key] }); if(cb)cb(); save(); };
  tog('tglSound', 'sound');
  tog('tglStartBlank', 'startBlank');
  tog('tglBloom', 'bloom');

  const rng = (id, key) => $(id).oninput = e => { settings[key] = +e.target.value; fluid?.setConfig({ [key]: settings[key] }); save(); };
  rng('rngSwirl','swirl'); rng('rngRainbow','rainbow'); rng('rngVisible','visibleTime');
  rng('rngColorSpeed','colorRotationSpeed'); rng('rngBloom','bloomIntensity');
  rng('rngRadius','splatRadius'); rng('rngVorticity','vorticity');
  syncControls();
}

// ── BOOT ──
load();
window.addEventListener('DOMContentLoaded', () => { initSettings(); initFluid(); });
