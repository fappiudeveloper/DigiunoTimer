'use strict';

const APP_VERSION = '1.3.0';

const SCHEMES = [
  { id: '12-12', name: '12:12 Principiante', icon: '🌱', fastHours: 12, eatHours: 12, desc: 'Il punto di partenza ideale. Digiuni 12 ore (incluso il sonno) e mangi liberamente nelle restanti 12.', difficulty: 'easy', type: 'time-restricted' },
  { id: '14-10', name: '14:10 Leggero', icon: '🌿', fastHours: 14, eatHours: 10, desc: 'Un passo avanti dal 12:12. Finestra alimentare di 10 ore, adatto a chi vuole risultati graduali.', difficulty: 'easy', type: 'time-restricted' },
  { id: '16-8', name: '16:8 Classico', icon: '⏰', fastHours: 16, eatHours: 8, desc: 'Il protocollo più popolare al mondo. Salti la colazione e mangi in una finestra di 8 ore (es. 12:00–20:00).', difficulty: 'medium', type: 'time-restricted' },
  { id: '18-6', name: '18:6 Avanzato', icon: '💪', fastHours: 18, eatHours: 6, desc: 'Versione intensificata del 16:8. Maggiore finestra di digiuno per risultati metabolici più marcati.', difficulty: 'medium', type: 'time-restricted' },
  { id: '20-4', name: '20:4 Guerriero', icon: '⚔️', fastHours: 20, eatHours: 4, desc: 'La dieta del guerriero: piccoli spuntini di giorno, un pasto principale abbondante la sera in 4 ore.', difficulty: 'hard', type: 'time-restricted' },
  { id: 'omad', name: 'OMAD — Un Pasto', icon: '🍽️', fastHours: 23, eatHours: 1, desc: 'One Meal A Day: un solo pasto al giorno. Il protocollo più estremo tra i time-restricted.', difficulty: 'hard', type: 'time-restricted' },
  { id: '5-2', name: '5:2 — Mima Digiuno', icon: '📅', fastHours: null, eatHours: null, fastDays: 2, eatDays: 5, calorieLimit: 500, desc: 'Mangi normalmente 5 giorni a settimana, e limiti le calorie a 500 kcal in 2 giorni non consecutivi.', difficulty: 'medium', type: 'weekly', effectiveFastHours: 36 },
  { id: 'adf', name: 'ADF — Giorni Alternati', icon: '🔄', fastHours: null, eatHours: null, desc: 'Alternate Day Fasting: alterni giorni normali a giorni di digiuno (max 500 kcal).', difficulty: 'hard', type: 'alternating', effectiveFastHours: 36 },
];

const INFO_CARDS = [
  { icon: '🔬', title: 'Come funziona il digiuno', content: '<p>Dopo <strong>12–14 ore senza calorie</strong>, il corpo esaurisce il glicogeno e passa a bruciare i grassi come carburante.</p><p>Tra le <strong>16 e le 24 ore</strong>, si attiva l\'autofagia: il processo cellulare di "pulizia" che degrada componenti danneggiate.</p><p>L\'insulina si abbassa, favorendo il rilascio di acidi grassi dal tessuto adiposo.</p>' },
  { icon: '💧', title: 'Cosa puoi bere durante il digiuno', content: '<ul><li>✅ Acqua (liscia o frizzante)</li><li>✅ Caffè nero (senza zucchero o latte)</li><li>✅ Tè non zuccherato</li><li>✅ Acqua con limone (poche gocce)</li><li>❌ Succhi di frutta</li><li>❌ Bibite (anche zero calorie)</li><li>❌ Latte o alternative vegetali</li></ul>' },
  { icon: '🍎', title: 'Come rompere il digiuno', content: '<p>Rompi il digiuno con cibi <strong>facili da digerire</strong>.</p><ul><li>🥗 Insalata con proteine leggere</li><li>🥚 Uova, frutta fresca</li><li>🫐 Yogurt greco o kefir</li><li>🥜 Frutta secca in piccola quantità</li></ul>' },
  { icon: '⚡', title: 'Effetti collaterali comuni', content: '<ul><li><strong>Fame:</strong> normale nelle prime settimane. Passa con l\'adattamento.</li><li><strong>Mal di testa:</strong> spesso da disidratazione. Bevi più acqua.</li><li><strong>Stanchezza:</strong> normale nella fase iniziale.</li><li><strong>Irritabilità:</strong> passa quando il corpo si adatta a bruciare grassi.</li></ul>' },
  { icon: '🚫', title: 'Quando NON digiunare', content: '<ul><li>Gravidanza o allattamento</li><li>Diabete di tipo 1 o ipoglicemia grave</li><li>Disturbi alimentari (anoressia, bulimia)</li><li>Bambini e adolescenti in crescita</li><li>Sottopeso significativo (BMI &lt; 18.5)</li></ul><p><strong>Consulta sempre il tuo medico prima di iniziare.</strong></p>' },
  { icon: '📈', title: 'Benefici scientificamente provati', content: '<ul><li>Perdita di peso e grasso viscerale</li><li>Riduzione insulina e resistenza insulinica</li><li>Miglioramento pressione sanguigna</li><li>Riduzione markers infiammatori</li><li>Autofagia cellulare</li><li>Miglioramento profilo lipidico</li></ul><p>Fonte: NEJM, Mayo Clinic, Harvard TH Chan School of Public Health</p>' },
];

const DB_KEY = 'digiunotimer_v2';
function loadData() { try { const r = localStorage.getItem(DB_KEY); return r ? Object.assign(defaultData(), JSON.parse(r)) : defaultData(); } catch { return defaultData(); } }
function defaultData() { return { currentScheme: '16-8', currentFast: null, history: [], waterToday: { date: today(), count: 0 }, weightLog: [], theme: 'dark', notifEnabled: false, streak: 0, bestStreak: 0 }; }
function saveData() { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch(e) { console.warn(e); } }
function today() { return new Date().toISOString().slice(0, 10); }

let db = loadData(), timerInterval = null;
const charts = {};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { const s = document.getElementById('splash'); if(s) s.remove(); document.getElementById('app').classList.remove('hidden'); init(); }, 2200);
});

function init() {
  applyTheme(db.theme); initNav(); initHeader(); initControls(); initModals();
  initWater(); initNote(); renderSchemes(); renderHistory(); renderWeightLog(); renderInfo();
  updateMiniStats(); updateSchemeDisplay(); restoreActiveTimer(); updateNotifBtn();
  updateEatingWindowInfo();
  document.getElementById('app-version').textContent = 'v' + APP_VERSION;
}

function initNav() { document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab))); }
function switchTab(tab) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  if (tab === 'stats') setTimeout(renderCharts, 80);
}

function initHeader() {
  document.getElementById('theme-btn').addEventListener('click', () => { db.theme = db.theme === 'dark' ? 'light' : 'dark'; applyTheme(db.theme); saveData(); });
  document.getElementById('notif-btn').addEventListener('click', toggleNotifications);
  document.getElementById('change-schema-btn').addEventListener('click', () => openModal('schema'));
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : '');
  document.getElementById('theme-icon-moon').classList.toggle('hidden', t === 'light');
  document.getElementById('theme-icon-sun').classList.toggle('hidden', t !== 'light');
}
function updateNotifBtn() { document.getElementById('notif-btn').classList.toggle('active', !!db.notifEnabled); }
async function toggleNotifications() {
  if (!('Notification' in window)) { showToast('Notifiche non supportate'); return; }
  if (db.notifEnabled) { db.notifEnabled = false; saveData(); updateNotifBtn(); showToast('Notifiche disattivate'); return; }
  const p = await Notification.requestPermission();
  if (p === 'granted') { db.notifEnabled = true; saveData(); updateNotifBtn(); showToast('Notifiche attivate!'); } else showToast('Permesso negato');
}
function sendNotif(title, body) { if (db.notifEnabled && Notification.permission === 'granted') new Notification(title, { body, icon: 'icons/icon.svg' }); }

function initControls() {
  document.getElementById('btn-start').addEventListener('click', startFast);
  document.getElementById('btn-stop').addEventListener('click', stopFast);
  document.getElementById('btn-cancel').addEventListener('click', cancelFast);
}

function toDatetimeLocal(ts) {
  const d = new Date(ts), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function getScheme(id) { return SCHEMES.find(s => s.id === id) || SCHEMES[2]; }
function getTargetHours(s) { return s.fastHours || s.effectiveFastHours || 16; }

function restoreActiveTimer() {
  if (!db.currentFast) return;
  showFastingUI(); updateFastStartInfo();
  document.getElementById('note-card').style.display = 'block';
  document.getElementById('fast-note').value = db.currentFast.note || '';
  updateNoteChars(); startTimerInterval();
}
function showFastingUI() {
  document.getElementById('btn-start').classList.add('hidden');
  document.getElementById('btn-stop').classList.remove('hidden');
  document.getElementById('btn-cancel').classList.remove('hidden');
  document.getElementById('fast-start-info').classList.remove('hidden');
  document.getElementById('eating-window-info').classList.add('hidden');
  document.getElementById('app').classList.add('fasting-active');
}
function hideFastingUI() {
  document.getElementById('btn-start').classList.remove('hidden');
  document.getElementById('btn-stop').classList.add('hidden');
  document.getElementById('btn-cancel').classList.add('hidden');
  document.getElementById('fast-start-info').classList.add('hidden');
  document.getElementById('app').classList.remove('fasting-active');
  updateEatingWindowInfo();
}

// --- START ---
function startFast() {
  document.getElementById('start-time-input').value = toDatetimeLocal(Date.now());
  document.getElementById('start-time-confirm-btn').textContent = 'Inizia Digiuno';
  openModal('start-time');
}
function confirmStartFast() {
  const val = document.getElementById('start-time-input').value;
  if (!val) { showToast('Seleziona un orario'); return; }
  const ts = new Date(val).getTime();
  if (ts > Date.now()) { showToast("L'orario non può essere nel futuro"); return; }
  if (db.currentFast) {
    db.currentFast.startTime = ts; saveData(); closeModal('start-time'); updateFastStartInfo();
    showToast('Orario di inizio aggiornato'); return;
  }
  const scheme = getScheme(db.currentScheme);
  db.currentFast = { startTime: ts, schemeId: db.currentScheme, note: '' };
  saveData(); closeModal('start-time'); showFastingUI(); updateFastStartInfo(); startTimerInterval();
  document.getElementById('note-card').style.display = 'block';
  document.getElementById('fast-note').value = ''; updateNoteChars();
  showToast(`${scheme.icon} Digiuno ${scheme.name} iniziato!`);
  sendNotif('Digiuno Iniziato!', `Hai avviato il protocollo ${scheme.name}. Forza!`);
}
function editStartTime() {
  document.getElementById('start-time-input').value = toDatetimeLocal(db.currentFast.startTime);
  document.getElementById('start-time-confirm-btn').textContent = 'Aggiorna orario';
  openModal('start-time');
}
function updateFastStartInfo() {
  if (!db.currentFast) return;
  const d = new Date(db.currentFast.startTime);
  const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const isToday = d.toISOString().slice(0,10) === today();
  document.getElementById('fast-start-time').textContent = isToday ? timeStr
    : d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + timeStr;
  updateFastEndTime();
}
function updateFastEndTime() {
  if (!db.currentFast) return;
  const scheme = getScheme(db.currentFast.schemeId);
  const endTs = db.currentFast.startTime + getTargetHours(scheme) * 3600000;
  const d = new Date(endTs);
  const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const dayStr = d.toISOString().slice(0,10);
  const now = new Date();
  const todayStr = today();
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().slice(0,10);
  let label = timeStr;
  if (dayStr !== todayStr) label = (dayStr === tomorrowStr ? 'domani ' : d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }) + ' ') + timeStr;
  document.getElementById('fast-end-time').textContent = label;
}
function updateEatingWindowInfo() {
  const el = document.getElementById('eating-window-info');
  if (db.currentFast || !db.history.length) { el.classList.add('hidden'); return; }
  const last = db.history[0];
  if (!last.endTime) { el.classList.add('hidden'); return; }
  const scheme = getScheme(last.schemeId);
  if (!scheme.eatHours) { el.classList.add('hidden'); return; }
  const eatEndTs = last.endTime + scheme.eatHours * 3600000;
  if (eatEndTs <= Date.now()) { el.classList.add('hidden'); return; }
  const d = new Date(eatEndTs);
  const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const dayStr = d.toISOString().slice(0,10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0,10);
  let label = timeStr;
  if (dayStr !== today()) label = (dayStr === tomorrowStr ? 'domani ' : d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }) + ' ') + timeStr;
  document.getElementById('ew-fast-time').textContent = label;
  el.classList.remove('hidden');
}

// --- STOP ---
function stopFast() {
  if (!db.currentFast) return;
  document.getElementById('stop-time-input').value = toDatetimeLocal(Date.now());
  openModal('stop-time');
}
function confirmStopFast() {
  const val = document.getElementById('stop-time-input').value;
  if (!val) { showToast('Seleziona un orario'); return; }
  const endTs = new Date(val).getTime();
  if (endTs > Date.now()) { showToast("L'orario non può essere nel futuro"); return; }
  if (endTs <= db.currentFast.startTime) { showToast("L'orario di fine deve essere dopo l'inizio"); return; }
  closeModal('stop-time');
  const scheme = getScheme(db.currentFast.schemeId);
  const elapsed = endTs - db.currentFast.startTime;
  const completed = elapsed >= getTargetHours(scheme) * 3600000;
  db.history.unshift({ id: Date.now(), startTime: db.currentFast.startTime, endTime: endTs, schemeId: db.currentFast.schemeId, completed, note: db.currentFast.note || '', durationMs: elapsed });
  if (completed) { db.streak++; if (db.streak > db.bestStreak) db.bestStreak = db.streak; } else db.streak = 0;
  db.currentFast = null; saveData();
  clearInterval(timerInterval); timerInterval = null;
  hideFastingUI(); document.getElementById('note-card').style.display = 'none';
  resetTimerDisplay(); updateMiniStats(); renderHistory();
  const h = Math.floor(elapsed/3600000), m = Math.floor((elapsed%3600000)/60000);
  showToast(`${completed ? '✅ Completato!' : '⚠️ Parziale'} ${h}h ${m}m di digiuno`);
  sendNotif(completed ? 'Digiuno Completato! 🎉' : 'Digiuno Terminato', `Hai digiunato per ${h}h ${m}m.`);
}

function cancelFast() {
  if (!confirm('Annullare il digiuno corrente? Il progresso non verrà salvato.')) return;
  db.currentFast = null; saveData(); clearInterval(timerInterval); timerInterval = null;
  hideFastingUI(); document.getElementById('note-card').style.display = 'none';
  resetTimerDisplay(); showToast('Digiuno annullato');
}

function startTimerInterval() { clearInterval(timerInterval); tickTimer(); timerInterval = setInterval(tickTimer, 1000); }
function tickTimer() {
  if (!db.currentFast) return;
  const scheme = getScheme(db.currentFast.schemeId);
  const elapsed = Date.now() - db.currentFast.startTime;
  const targetMs = getTargetHours(scheme) * 3600000;
  const progress = Math.min(elapsed / targetMs, 1);
  updateTimerDisplay(elapsed, Math.max(targetMs - elapsed, 0), progress, scheme);
  if (elapsed >= targetMs && elapsed < targetMs + 1500) sendNotif('Obiettivo Raggiunto! 🎉', `Hai completato ${scheme.name}!`);
}
function updateTimerDisplay(elapsed, remaining, progress, scheme) {
  document.getElementById('timer-progress-circle').style.strokeDashoffset = 603.19 - progress * 603.19;
  document.getElementById('timer-display').textContent = fmtMs(elapsed);
  if (progress >= 1) {
    document.getElementById('timer-state-label').textContent = 'OBIETTIVO RAGGIUNTO';
    document.getElementById('timer-sub').textContent = 'Hai completato il tuo digiuno!';
    document.getElementById('timer-phase-icon').textContent = '🎉';
  } else {
    document.getElementById('timer-state-label').textContent = 'IN DIGIUNO';
    document.getElementById('timer-sub').textContent = `Ancora ${fmtMs(remaining)} — ${scheme.name}`;
    document.getElementById('timer-phase-icon').textContent = '🌙';
  }
}
function resetTimerDisplay() {
  document.getElementById('timer-progress-circle').style.strokeDashoffset = '603.19';
  document.getElementById('timer-display').textContent = '00:00:00';
  document.getElementById('timer-state-label').textContent = 'IN ATTESA';
  document.getElementById('timer-sub').textContent = 'Premi Inizia per cominciare';
  document.getElementById('timer-phase-icon').textContent = '🌙';
}
function fmtMs(ms) { const s=Math.floor(ms/1000); return `${pad(Math.floor(s/3600))}:${pad(Math.floor((s%3600)/60))}:${pad(s%60)}`; }
function pad(n) { return String(n).padStart(2,'0'); }

function updateMiniStats() {
  document.getElementById('stat-streak').textContent = db.streak;
  const c = db.history.filter(h => h.completed);
  document.getElementById('stat-total').textContent = c.length;
  if (c.length > 0) {
    const best = Math.max(...c.map(h => h.durationMs));
    document.getElementById('stat-best').textContent = `${Math.floor(best/3600000)}h${Math.floor((best%3600000)/60000)>0?Math.floor((best%3600000)/60000)+'m':''}`;
  } else document.getElementById('stat-best').textContent = '—';
}

function updateSchemeDisplay() { document.getElementById('current-schema-name').textContent = getScheme(db.currentScheme).name; }

function renderSchemes() {
  const grid = document.getElementById('schemes-grid');
  grid.innerHTML = SCHEMES.map(s => schemeCardHtml(s)).join('');
  grid.querySelectorAll('.scheme-card').forEach(c => c.addEventListener('click', () => { selectScheme(c.dataset.id); refreshSchemeHighlights(grid); }));
}
function schemeCardHtml(s) {
  const sel = s.id === db.currentScheme;
  const dl = { easy:'Facile', medium:'Moderato', hard:'Avanzato' };
  const dc = { easy:'tag-easy', medium:'tag-medium', hard:'tag-hard' };
  const ratio = s.fastHours ? `${s.fastHours}h digiuno / ${s.eatHours}h alimentazione` : s.fastDays ? `${s.eatDays} giorni normali / ${s.fastDays} giorni restrizione` : 'Giorni alternati';
  const typeLabel = s.type==='time-restricted'?'Giornaliero':s.type==='weekly'?'Settimanale':'Alternato';
  return `<div class="scheme-card${sel?' selected':''}" data-id="${s.id}">
    <div class="scheme-icon">${s.icon}</div>
    <div class="scheme-info">
      <div class="scheme-name">${s.name}</div>
      <div class="scheme-ratio">${ratio}</div>
      <div class="scheme-desc">${s.desc}</div>
      <div class="scheme-tags"><span class="scheme-tag ${dc[s.difficulty]||''}">${dl[s.difficulty]||s.difficulty}</span><span class="scheme-tag">${typeLabel}</span></div>
    </div>
    <div class="scheme-selected-badge"${sel?'':' style="display:none"'}>✓ Attivo</div>
  </div>`;
}
function refreshSchemeHighlights(c) {
  c.querySelectorAll('.scheme-card').forEach(el => {
    const sel = el.dataset.id === db.currentScheme;
    el.classList.toggle('selected', sel);
    const b = el.querySelector('.scheme-selected-badge');
    if (b) b.style.display = sel ? '' : 'none';
  });
}
function selectScheme(id) {
  if (db.currentFast) { showToast('Termina il digiuno corrente prima di cambiare schema'); return; }
  db.currentScheme = id; saveData(); updateSchemeDisplay();
  showToast(`${getScheme(id).icon} Schema: ${getScheme(id).name}`);
}

function initModals() {
  document.getElementById('modal-schema-backdrop').addEventListener('click', () => closeModal('schema'));
  document.getElementById('modal-schema-close').addEventListener('click', () => closeModal('schema'));
  document.getElementById('modal-weight-backdrop').addEventListener('click', () => closeModal('weight'));
  document.getElementById('modal-weight-close').addEventListener('click', () => closeModal('weight'));
  document.getElementById('add-weight-btn').addEventListener('click', () => openModal('weight'));
  document.getElementById('weight-save-btn').addEventListener('click', saveWeight);
  document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
  // Orari manuali
  document.getElementById('modal-start-time-backdrop').addEventListener('click', () => closeModal('start-time'));
  document.getElementById('modal-start-time-close').addEventListener('click', () => closeModal('start-time'));
  document.getElementById('start-time-confirm-btn').addEventListener('click', confirmStartFast);
  document.getElementById('fast-start-edit').addEventListener('click', editStartTime);
  document.getElementById('modal-stop-time-backdrop').addEventListener('click', () => closeModal('stop-time'));
  document.getElementById('modal-stop-time-close').addEventListener('click', () => closeModal('stop-time'));
  document.getElementById('stop-time-confirm-btn').addEventListener('click', confirmStopFast);
  // Modifica record storico
  document.getElementById('modal-edit-record-backdrop').addEventListener('click', () => closeModal('edit-record'));
  document.getElementById('modal-edit-record-close').addEventListener('click', () => closeModal('edit-record'));
  document.getElementById('edit-record-save-btn').addEventListener('click', confirmEditRecord);
}
function openModal(name) {
  document.getElementById('modal-'+name).classList.remove('hidden');
  if (name === 'schema') {
    const list = document.getElementById('modal-schemes-list');
    list.innerHTML = SCHEMES.map(s => schemeCardHtml(s)).join('');
    list.querySelectorAll('.scheme-card').forEach(c => c.addEventListener('click', () => { selectScheme(c.dataset.id); refreshSchemeHighlights(list); refreshSchemeHighlights(document.getElementById('schemes-grid')); closeModal('schema'); }));
  }
  if (name === 'weight') { document.getElementById('weight-date-input').value = today(); document.getElementById('weight-input').value = ''; }
}
function closeModal(name) { document.getElementById('modal-'+name).classList.add('hidden'); }

function initWater() {
  if (db.waterToday.date !== today()) { db.waterToday = { date: today(), count: 0 }; saveData(); }
  renderWaterGlasses();
  document.getElementById('water-reset-btn').addEventListener('click', () => { db.waterToday = { date: today(), count: 0 }; saveData(); renderWaterGlasses(); });
}
function renderWaterGlasses() {
  const count = db.waterToday.count;
  document.getElementById('water-amount').textContent = `${count} / 8 bicchieri`;
  const c = document.getElementById('water-glasses'); c.innerHTML = '';
  for (let i=0; i<8; i++) {
    const g = document.createElement('div');
    g.className = 'glass'+(i<count?' filled':''); g.textContent = i<count?'💧':'🫙';
    const idx=i; g.addEventListener('click', () => { db.waterToday.count=idx<count?idx:idx+1; db.waterToday.date=today(); saveData(); renderWaterGlasses(); });
    c.appendChild(g);
  }
}

function saveWeight() {
  const val = parseFloat(document.getElementById('weight-input').value);
  const date = document.getElementById('weight-date-input').value;
  if (!val||val<20||val>500) { showToast('Inserisci un peso valido'); return; }
  if (!date) { showToast('Inserisci una data'); return; }
  db.weightLog.unshift({ date, value: val, id: Date.now() });
  db.weightLog.sort((a,b) => b.date.localeCompare(a.date));
  saveData(); closeModal('weight'); renderWeightLog(); showToast(`⚖️ Peso ${val} kg salvato!`);
}
function renderWeightLog() {
  const list = document.getElementById('weight-log-list');
  if (!db.weightLog.length) { list.innerHTML='<p class="empty-msg">Nessun peso registrato</p>'; return; }
  const sorted = [...db.weightLog].sort((a,b)=>b.date.localeCompare(a.date));
  list.innerHTML = sorted.slice(0,10).map((w,i)=>{
    const prev=sorted[i+1]; let delta='';
    if (prev) { const diff=(w.value-prev.value).toFixed(1); const cls=diff>0?'up':diff<0?'down':''; const arrow=diff>0?'▲':diff<0?'▼':'—'; if(cls) delta=`<span class="w-delta ${cls}">${arrow} ${Math.abs(diff)}</span>`; }
    return `<div class="weight-entry"><span class="w-val">${w.value} kg</span><span class="w-date">${fmtDate(w.date)}</span>${delta}<span class="w-del" data-id="${w.id}">✕</span></div>`;
  }).join('');
  list.querySelectorAll('.w-del').forEach(b => b.addEventListener('click', () => { db.weightLog=db.weightLog.filter(w=>w.id!==parseInt(b.dataset.id)); saveData(); renderWeightLog(); }));
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!db.history.length) { list.innerHTML='<p class="empty-msg">Nessun digiuno completato ancora.<br>Inizia il tuo primo digiuno!</p>'; return; }
  list.innerHTML = db.history.slice(0,50).map(h=>{
    const scheme=getScheme(h.schemeId);
    const dh=Math.floor(h.durationMs/3600000), dm=Math.floor((h.durationMs%3600000)/60000);
    const dateStr=fmtDate(new Date(h.startTime).toISOString().slice(0,10));
    const timeStr=new Date(h.startTime).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    const badge=h.completed?'<span class="history-badge completed">Completato</span>':'<span class="history-badge partial">Parziale</span>';
    const note=h.note?`<div class="history-note">📝 ${escHtml(h.note)}</div>`:'';
    return `<div class="history-item"><div class="history-icon">${h.completed?'✅':'⚠️'}</div><div class="history-info"><div class="history-date">${dateStr} ore ${timeStr}</div><div class="history-duration">${dh}h ${dm}m</div><div class="history-schema">${scheme.icon} ${scheme.name}</div>${note}</div>${badge}<button class="history-edit" data-id="${h.id}" title="Modifica orari">✏️</button></div>`;
  }).join('');
  list.querySelectorAll('.history-edit').forEach(btn => btn.addEventListener('click', () => editRecord(parseInt(btn.dataset.id))));
}
function editRecord(id) {
  const rec = db.history.find(h => h.id === id);
  if (!rec) return;
  document.getElementById('edit-record-id').value = id;
  document.getElementById('edit-record-start').value = toDatetimeLocal(rec.startTime);
  document.getElementById('edit-record-end').value = toDatetimeLocal(rec.endTime);
  openModal('edit-record');
}
function confirmEditRecord() {
  const id = parseInt(document.getElementById('edit-record-id').value);
  const startVal = document.getElementById('edit-record-start').value;
  const endVal = document.getElementById('edit-record-end').value;
  if (!startVal || !endVal) { showToast('Compila entrambi gli orari'); return; }
  const startTs = new Date(startVal).getTime();
  const endTs = new Date(endVal).getTime();
  if (startTs > Date.now()) { showToast("L'inizio non può essere nel futuro"); return; }
  if (endTs > Date.now()) { showToast("La fine non può essere nel futuro"); return; }
  if (endTs <= startTs) { showToast("La fine deve essere dopo l'inizio"); return; }
  const idx = db.history.findIndex(h => h.id === id);
  if (idx === -1) return;
  const durationMs = endTs - startTs;
  const completed = durationMs >= getTargetHours(getScheme(db.history[idx].schemeId)) * 3600000;
  db.history[idx] = { ...db.history[idx], startTime: startTs, endTime: endTs, durationMs, completed };
  saveData(); closeModal('edit-record'); renderHistory(); updateMiniStats();
  showToast('✅ Record aggiornato');
}
function clearHistory() {
  if (!confirm('Cancellare tutto lo storico dei digiuni?')) return;
  db.history=[]; db.streak=0; db.bestStreak=0; saveData(); renderHistory(); updateMiniStats(); showToast('Storico cancellato');
}

function renderInfo() {
  document.getElementById('info-content').innerHTML = INFO_CARDS.map((c,i)=>`
    <div class="info-card" id="info-card-${i}">
      <div class="info-card-header" data-idx="${i}"><div class="info-card-header-left"><span class="info-card-icon">${c.icon}</span><span class="info-card-title">${c.title}</span></div><span class="info-card-arrow">▼</span></div>
      <div class="info-card-body">${c.content}</div>
    </div>`).join('');
  document.querySelectorAll('.info-card-header').forEach(h => h.addEventListener('click', () => document.getElementById('info-card-'+h.dataset.idx).classList.toggle('open')));
}

function renderCharts() { renderWeeklyChart(); renderWeightChart(); renderSchemesChart(); renderStatsCards(); }
function renderStatsCards() {
  const c=db.history.filter(h=>h.completed);
  document.getElementById('s-total-fasts').textContent=db.history.length;
  const totalMs=db.history.reduce((a,h)=>a+(h.durationMs||0),0);
  document.getElementById('s-total-hours').textContent=Math.round(totalMs/3600000)+'h';
  document.getElementById('s-streak').textContent=db.streak;
  document.getElementById('s-best-streak').textContent=db.bestStreak;
  if (db.history.length>0) {
    const avg=totalMs/db.history.length;
    document.getElementById('s-avg-duration').textContent=`${Math.floor(avg/3600000)}h ${Math.floor((avg%3600000)/60000)}m`;
    document.getElementById('s-completion-rate').textContent=Math.round((c.length/db.history.length)*100)+'%';
  }
}
function renderWeeklyChart() {
  const ctx=document.getElementById('chart-weekly').getContext('2d');
  if(charts.weekly)charts.weekly.destroy();
  const labels=[],data=[];
  for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toISOString().slice(0,10);labels.push(d.toLocaleDateString('it-IT',{weekday:'short',day:'numeric'}));const ms=db.history.filter(h=>new Date(h.startTime).toISOString().slice(0,10)===ds).reduce((a,h)=>a+(h.durationMs||0),0);data.push(+(ms/3600000).toFixed(1));}
  charts.weekly=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Ore',data,backgroundColor:'rgba(167,139,250,0.5)',borderColor:'#a78bfa',borderWidth:2,borderRadius:6}]},options:baseChartOptions('Ore')});
}
function renderWeightChart() {
  const ctx=document.getElementById('chart-weight').getContext('2d');
  if(charts.weight){charts.weight.destroy();charts.weight=null;}
  const sorted=[...db.weightLog].sort((a,b)=>a.date.localeCompare(b.date)).slice(-20);
  if(sorted.length<2)return;
  charts.weight=new Chart(ctx,{type:'line',data:{labels:sorted.map(w=>fmtDate(w.date)),datasets:[{label:'kg',data:sorted.map(w=>w.value),borderColor:'#38bdf8',backgroundColor:'rgba(56,189,248,0.1)',fill:true,tension:0.4,pointBackgroundColor:'#38bdf8',pointRadius:4}]},options:baseChartOptions('kg')});
}
function renderSchemesChart() {
  const ctx=document.getElementById('chart-schemes').getContext('2d');
  if(charts.schemes){charts.schemes.destroy();charts.schemes=null;}
  const counts={}; db.history.forEach(h=>{const n=getScheme(h.schemeId).name;counts[n]=(counts[n]||0)+1;});
  if(!Object.keys(counts).length)return;
  charts.schemes=new Chart(ctx,{type:'doughnut',data:{labels:Object.keys(counts),datasets:[{data:Object.values(counts),backgroundColor:['#a78bfa','#38bdf8','#34d399','#fbbf24','#f87171','#fb923c','#818cf8','#e879f9'],borderWidth:0}]},options:{responsive:true,plugins:{legend:{position:'bottom',labels:{color:'#9090b8',font:{size:11},padding:12}}}}});
}
function baseChartOptions(y) {
  return {responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9090b8',font:{size:10},maxRotation:45},grid:{color:'rgba(255,255,255,0.06)'}},y:{ticks:{color:'#9090b8',font:{size:10}},grid:{color:'rgba(255,255,255,0.06)'},title:{display:true,text:y,color:'#9090b8',font:{size:11}}}}};
}

function initNote() {
  const t=document.getElementById('fast-note');
  t.addEventListener('input',()=>{if(db.currentFast){db.currentFast.note=t.value;saveData();}updateNoteChars();});
}
function updateNoteChars(){document.getElementById('note-chars').textContent=document.getElementById('fast-note').value.length;}

function fmtDate(ds){const[y,m,d]=ds.split('-');return`${d}/${m}/${y}`;}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

let toastTimer=null;
function showToast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),3000);}

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));