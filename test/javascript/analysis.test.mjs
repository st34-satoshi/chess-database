import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const chessURL = new URL('../../app/javascript/game/chess-1-0-0beta-6.js', import.meta.url).href;
const { Chess } = await import(chessURL);
const source = (await readFile(new URL('../../app/javascript/analysis/position.js', import.meta.url), 'utf8')).replace("'game/chess-1-0-0beta-6'", JSON.stringify(chessURL));
const { editedFen, unpack, validatePosition, readInput } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { AnalysisEngine } = await import('../../app/javascript/analysis/engine.js');
const start = new Chess().fen();

test('editing preserves or swaps turn according to action, and clears en passant', () => {
  const removed = editedFen(start, 'e2');
  assert.equal(unpack(removed).turn, 'w');
  assert.equal(unpack(removed).pieces.e2, undefined);
  const added = editedFen(removed, null, 'e4', 'P');
  assert.equal(unpack(added).turn, 'w');
  assert.equal(unpack(added).pieces.e4, 'P');
  const moved = editedFen(start, 'a8', 'a4', 'r');
  assert.equal(unpack(moved).turn, 'b');
  assert.equal(unpack(moved).pieces.a8, undefined);
  assert.equal(unpack(moved).pieces.a4, 'r');
  assert.equal(moved.split(' ').slice(2).join(' '), 'KQk - 0 1');
  assert.equal(editedFen(start, 'e2', 'e2', 'P'), start);
});
test('editing preserves existing castling rights only when the required pieces remain', () => {
  const rights = fen => fen.split(' ')[2];
  assert.equal(rights(editedFen(start, 'e2', 'e4', 'P')), 'KQkq');
  assert.equal(rights(editedFen(start, 'b1')), 'KQkq');
  assert.equal(rights(editedFen(start, null, 'e4', 'N')), 'KQkq');
  for (const [square, piece, remaining] of [
    ['e1', 'K', 'kq'], ['e8', 'k', 'KQ'],
    ['h1', 'R', 'Qkq'], ['a1', 'R', 'Kkq'],
    ['h8', 'r', 'KQq'], ['a8', 'r', 'KQk']
  ]) {
    const removed = editedFen(start, square);
    assert.equal(rights(removed), remaining);
    assert.equal(rights(editedFen(start, square, 'd4', piece)), remaining);
    assert.equal(rights(editedFen(start, null, square, piece === piece.toUpperCase() ? 'r' : 'R')), remaining);
    assert.equal(rights(editedFen(removed, null, square, piece)), remaining);
  }
  assert.equal(rights(editedFen(start.replace('KQkq', 'Qk'), 'e2')), 'Qk');
  assert.equal(rights(editedFen(start.replace('KQkq', '-'), 'e2')), '-');
  const position = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
  const edited = editedFen(position, null, 'b3', 'N');
  assert.equal(validatePosition(edited), null);
  assert.ok(new Chess(edited).moves().includes('O-O'));
  assert.ok(new Chess(edited).moves().includes('O-O-O'));
  assert.equal(editedFen(position.replace(' - 0 1', ' e6 0 1'), null, 'b3', 'N').split(' ')[3], '-');
});
test('invalid engine positions are blocked while edited FEN can still exist', () => {
  assert.equal(validatePosition(start), null);
  assert.match(validatePosition(editedFen(start, null, 'e4', 'P')), /16個/);
  assert.match(validatePosition('4k3/8/8/8/8/8/8/4K3 w K - 0 1'), /キャスリング/);
  assert.match(validatePosition(editedFen(start, 'e1')), /キング/);
  assert.match(validatePosition(editedFen(start, null, 'e4', 'K')), /キング/);
  assert.match(validatePosition(editedFen(start, null, 'a8', 'P')), /ポーン/);
  assert.match(validatePosition('8/8/8/8/8/4k3/4K3/8 w - - 0 1'), /チェック/);
});
test('PGN replay retains custom FEN start and black to move', () => {
  const custom = '4k3/8/8/8/8/8/8/4K2R b - - 0 9';
  const positions = readInput(`[SetUp "1"]\n[FEN "${custom}"]\n\n9... Kd7 10. Rh7+`);
  assert.equal(positions.length, 3);
  assert.equal(positions[0], custom);
  assert.equal(unpack(positions[1]).turn, 'w');
  assert.deepEqual(readInput(start), [start]);
  assert.deepEqual(readInput(start.replaceAll(' ', '  ')), [start]);
  assert.throws(() => readInput('garbage'));
  assert.throws(() => readInput(''));
  assert.throws(() => readInput('[Event "a"]\n1. e4\n[Event "b"]\n1. d4'));
});
class FakeWorker {
  commands = [];
  postMessage(command) { this.commands.push(command); }
  terminate() { this.terminated = true; }
  emit(line) { this.onmessage({ data: line }); }
}
test('search barrier discards stale output and uses only latest position', () => {
  const results = [];
  const engine = new AnalysisEngine(line => results.push(line), () => {}, FakeWorker);
  const worker = engine.worker;
  engine.search(start, 3); worker.emit('uciok'); worker.emit('readyok');
  worker.emit('info depth 1 multipv 1 score cp 30 pv e2e4');
  assert.equal(results[0].value, 30);
  const black = start.replace(' w ', ' b ');
  engine.search(black, 5);
  engine.search(black, 2);
  worker.emit('info depth 2 multipv 1 score cp 90 pv e2e4');
  assert.equal(results.length, 1);
  worker.emit('bestmove e2e4');
  assert.equal(worker.commands.at(-3), 'setoption name MultiPV value 2');
  worker.emit('info depth 2 multipv 1 score cp 40 pv e7e5');
  assert.equal(results[1].value, -40);
  engine.stop(); worker.emit('info depth 3 score cp 99 pv e7e5'); worker.emit('bestmove e7e5');
  assert.equal(results.length, 2);
  engine.destroy(); assert.equal(worker.terminated, true);
});
test('bundled engine executes WASM and returns three legal candidates', { timeout: 20000 }, async () => {
  const path = new URL('../../public/engine/stockfish-19-lite-single.js', import.meta.url);
  const child = spawn(process.execPath, [path.pathname]);
  let output = '';
  try {
    await new Promise((resolve, reject) => {
      child.on('error', reject);
      child.stdout.on('data', chunk => {
        output += chunk.toString();
        if (output.includes('bestmove')) resolve();
      });
      child.on('exit', code => reject(new Error(`Engine exited ${code}: ${output}`)));
      child.stdin.write('uci\nsetoption name MultiPV value 3\nposition startpos\ngo depth 6\n');
    });
    for (const rank of [1, 2, 3]) {
      const match = [...output.matchAll(new RegExp(`info depth 6 .*multipv ${rank} .* pv (\\w+)`, 'g'))].at(-1);
      assert.ok(match, `Missing candidate ${rank}`);
      const uci = match[1];
      assert.ok(new Chess().move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }));
    }
  } finally { child.kill(); }
});
