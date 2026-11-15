import 'application';
import { Chess } from 'game/chess-1-0-0beta-6';
import { unpack, editedFen, validatePosition, readInput } from 'analysis/position';
import { bindEditorDrag } from 'analysis/drag';
import { AnalysisEngine } from 'analysis/engine';

function initialize() {
  const $ = id => document.getElementById(id);
  if (!$('analysis')) return;
  let history = [new Chess().fen()], index = 0, flipped = false, selected = null, paused = false;
  let lines = new Map(), engine;
  const names = { k: 'キング', q: 'クイーン', r: 'ルーク', b: 'ビショップ', n: 'ナイト', p: 'ポーン' };
  const fen = () => history[index];
  const score = line => line.type === 'mate' ? `${line.value < 0 ? '黒' : '白'} ${Math.abs(line.value)}手でメイト` : `${line.value >= 0 ? '+' : ''}${(line.value / 100).toFixed(2)}`;
  try {
    const saved = Number(localStorage.getItem('analysis-candidates'));
    if (Number.isInteger(saved) && saved >= 1 && saved <= 20) $('candidate-count').value = saved;
  } catch (_) { /* Storage is optional. */ }

  const cancelDrag = bindEditorDrag($('analysis'), {
    enabled: () => $('edit').checked,
    pieceAt: square => unpack(fen()).pieces[square],
    drop: (from, to, piece) => change(editedFen(fen(), from, to, piece))
  });
  function drawPalette(id, white) {
    const palette = $(id);
    palette.hidden = !$('edit').checked;
    palette.setAttribute('aria-label', `${white ? '白' : '黒'}の駒を追加`);
    palette.replaceChildren();
    for (const type of 'KQRBNP') {
      const piece = white ? type : type.toLowerCase();
      const button = document.createElement('button');
      button.dataset.piece = piece;
      button.setAttribute('aria-label', `${white ? '白' : '黒'}${names[type.toLowerCase()]}を追加`);
      button.setAttribute('aria-pressed', String($('piece-tool').value === piece));
      const image = document.createElement('img');
      image.src = `/img/chesspieces/wikipedia/${white ? 'w' : 'b'}${type}.png`;
      image.alt = ''; image.draggable = false;
      button.append(image);
      button.onclick = () => { $('piece-tool').value = $('piece-tool').value === piece ? 'move' : piece; selected = null; draw(); };
      palette.append(button);
    }
    const trash = document.createElement('button');
    trash.dataset.trash = '';
    trash.textContent = '🗑';
    trash.setAttribute('aria-label', '駒を削除');
    trash.setAttribute('aria-pressed', String($('piece-tool').value === 'delete'));
    trash.onclick = () => { $('piece-tool').value = $('piece-tool').value === 'delete' ? 'move' : 'delete'; selected = null; draw(); };
    palette.append(trash);
  }
  function draw() {
    cancelDrag();
    $('analysis-board').classList.toggle('editing', $('edit').checked);
    drawPalette('palette-top', flipped);
    drawPalette('palette-bottom', !flipped);
    const { pieces, turn } = unpack(fen());
    $('analysis-board').replaceChildren();
    const files = [...'abcdefgh'], ranks = [8, 7, 6, 5, 4, 3, 2, 1];
    if (flipped) { files.reverse(); ranks.reverse(); }
    for (const rank of ranks) for (const file of files) {
      const square = file + rank, piece = pieces[square];
      const button = document.createElement('button');
      button.dataset.square = square;
      button.className = `analysis-square ${('abcdefgh'.indexOf(file) + rank) % 2 === 1 ? 'dark' : ''} ${selected === square ? 'selected' : ''}`;
      button.setAttribute('aria-label', `${square} ${piece ? (piece === piece.toUpperCase() ? '白' : '黒') + names[piece.toLowerCase()] : '空きマス'}`);
      button.setAttribute('aria-pressed', String(selected === square));
      if (piece) {
        const image = document.createElement('img');
        image.src = `/img/chesspieces/wikipedia/${piece === piece.toUpperCase() ? 'w' : 'b'}${piece.toUpperCase()}.png`;
        image.alt = ''; image.draggable = false;
        button.append(image);
      }
      if (file === files[0]) {
        const label = document.createElement('small');
        label.className = 'analysis-rank'; label.textContent = rank;
        label.setAttribute('aria-hidden', 'true'); button.append(label);
      }
      if (rank === ranks[ranks.length - 1]) {
        const label = document.createElement('small');
        label.className = 'analysis-file'; label.textContent = file;
        label.setAttribute('aria-hidden', 'true'); button.append(label);
      }
      button.onclick = () => clickSquare(square);
      $('analysis-board').append(button);
    }
    $('analysis-turn').textContent = `${turn === 'w' ? '白' : '黒'}番 · 局面 ${index + 1} / ${history.length}`;
    $('current-fen').value = fen();
    $('undo').disabled = index === 0;
    $('redo').disabled = index === history.length - 1;
  }
  function analyze() {
    lines.clear(); $('candidates').replaceChildren(); $('evaluation').textContent = '—';
    const error = validatePosition(fen());
    $('analysis-error').textContent = error || '';
    if (error || paused) { engine?.stop(); $('engine-status').textContent = error ? '編集した局面を確認してください' : '解析停止中'; return; }
    const chess = new Chess(fen());
    if (chess.isCheckmate() || chess.isStalemate() || chess.isInsufficientMaterial()) {
      engine?.stop();
      $('evaluation').textContent = chess.isCheckmate() ? (chess.turn() === 'w' ? '黒の勝ち' : '白の勝ち') : '0.00';
      $('engine-status').textContent = chess.isCheckmate() ? 'チェックメイト' : '引き分け';
      return;
    }
    engine?.search(fen(), Math.min(Number($('candidate-count').value), chess.moves().length));
  }
  function change(next) {
    if (next === fen()) return;
    history = history.slice(0, index + 1); history.push(next); index++;
    selected = null; draw(); analyze();
  }
  function play(uci) {
    try {
      const chess = new Chess(fen());
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || $('promotion').value });
      change(chess.fen());
    } catch (_) { $('analysis-error').textContent = 'その手は指せません。'; selected = null; draw(); }
  }
  function clickSquare(square) {
    const { pieces } = unpack(fen());
    const edit = $('edit').checked, tool = $('piece-tool').value;
    if (edit && tool === 'delete') { if (pieces[square]) change(editedFen(fen(), square)); return; }
    if (edit && tool !== 'move') { change(editedFen(fen(), null, square, tool)); return; }
    if (selected === square) { selected = null; draw(); return; }
    if (!selected) { if (pieces[square]) selected = square; draw(); return; }
    if (edit) change(editedFen(fen(), selected, square, pieces[selected]));
    else play(selected + square);
  }
  function update(line) {
    if (line.rank > Number($('candidate-count').value)) return;
    if (lines.size && line.depth > Math.max(...[...lines.values()].map(result => result.depth))) lines.clear();
    lines.set(line.rank, line);
    if (line.rank === 1) $('evaluation').textContent = score(line);
    $('candidates').replaceChildren();
    for (const [rank, result] of [...lines].sort((a, b) => a[0] - b[0])) {
      const chess = new Chess(fen()), san = [];
      try {
        for (const move of result.moves.slice(0, 8)) san.push(chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] }).san);
      } catch (_) { continue; }
      const li = document.createElement('li'), button = document.createElement('button');
      li.value = rank; button.className = 'btn btn-outline-dark';
      button.textContent = `${san[0]} · ${score(result)} · 深さ ${result.depth}`;
      button.onclick = () => play(result.moves[0]);
      const variation = document.createElement('div'); variation.className = 'small text-muted'; variation.textContent = san.join(' ');
      li.append(button, variation); $('candidates').append(li);
    }
  }
  try { engine = new AnalysisEngine(update, status => { $('engine-status').textContent = status; }); }
  catch (_) { $('engine-status').textContent = 'このブラウザではエンジンを起動できません。'; }
  $('flip').onclick = () => { flipped = !flipped; draw(); };
  $('undo').onclick = () => { if (index > 0) { index--; selected = null; draw(); analyze(); } };
  $('redo').onclick = () => { if (index < history.length - 1) { index++; selected = null; draw(); analyze(); } };
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target;
    if (target instanceof Element && (target.closest('input, textarea, select') || target.isContentEditable)) return;
    const control = event.key === 'ArrowLeft' ? $('undo') : event.key === 'ArrowRight' ? $('redo') : null;
    if (!control) return;
    event.preventDefault();
    control.click();
  });
  $('reset').onclick = () => change(new Chess().fen());
  $('edit').onchange = () => { selected = null; $('editor').hidden = !$('edit').checked; draw(); };
  $('piece-tool').onchange = () => { selected = null; draw(); };
  $('switch-turn').onclick = () => { const parts = fen().split(' '); parts[1] = parts[1] === 'w' ? 'b' : 'w'; parts[2] = '-'; parts[3] = '-'; parts[4] = '0'; change(parts.join(' ')); };
  $('load-position').onclick = () => {
    try {
      const positions = readInput($('position-input').value);
      history = positions; index = history.length - 1; selected = null; draw(); analyze();
    } catch (error) { $('analysis-error').textContent = error.message; }
  };
  let countTimer;
  function applyCandidateCount() {
    clearTimeout(countTimer);
    const count = Math.max(1, Math.min(20, Math.trunc(Number($('candidate-count').value)) || 3));
    $('candidate-count').value = count;
    try { localStorage.setItem('analysis-candidates', String(count)); } catch (_) { /* optional */ }
    analyze();
  }
  $('candidate-count').onchange = applyCandidateCount;
  $('candidate-count').oninput = () => {
    clearTimeout(countTimer);
    const count = Number($('candidate-count').value);
    if (Number.isInteger(count) && count >= 1 && count <= 20) countTimer = setTimeout(applyCandidateCount, 200);
  };
  $('pause').onclick = () => {
    paused = !paused;
    $('pause').textContent = paused ? '解析再開' : '解析停止';
    if (paused) { engine?.stop(); $('engine-status').textContent = '解析停止中'; }
    else analyze();
  };
  $('copy-fen').onclick = async () => {
    try { await navigator.clipboard.writeText(fen()); $('copy-fen').textContent = 'コピーしました'; }
    catch (_) { $('current-fen').select(); $('analysis-error').textContent = 'FENを選択しました。コピー操作を行ってください。'; }
  };
  window.addEventListener('pagehide', () => { clearTimeout(countTimer); engine?.destroy(); }, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  draw(); analyze();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
else initialize();
