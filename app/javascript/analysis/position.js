import { Chess } from 'game/chess-1-0-0beta-6';

export function unpack(fen) {
  const [placement, turn] = fen.split(' ');
  const pieces = {};
  placement.split('/').forEach((row, rank) => {
    let file = 0;
    for (const char of row) {
      if (/\d/.test(char)) file += Number(char);
      else pieces['abcdefgh'[file++] + (8 - rank)] = char;
    }
  });
  return { pieces, turn };
}

export function editedFen(fen, from, to, piece) {
  const { pieces, turn } = unpack(fen);
  if (from && from === to) return fen;
  if (from) delete pieces[from];
  if (to && piece) pieces[to] = piece;
  const rows = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = '', empty = 0;
    for (const file of 'abcdefgh') {
      const p = pieces[file + rank];
      if (!p) empty++;
      else { if (empty) row += empty; empty = 0; row += p; }
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join('/')} ${from && to ? (turn === 'w' ? 'b' : 'w') : turn} - - 0 1`;
}

export function validatePosition(fen) {
  try {
    const { pieces, turn } = unpack(fen);
    for (const king of ['K', 'k']) {
      if (Object.values(pieces).filter(p => p === king).length !== 1) return '白黒それぞれキングを1個配置してください。';
    }
    if (Object.entries(pieces).some(([s, p]) => p.toLowerCase() === 'p' && /[18]$/.test(s))) return 'ポーンは1段目・8段目に配置できません。';
    for (const white of [true, false]) {
      const side = Object.values(pieces).filter(p => (p === p.toUpperCase()) === white);
      if (side.length > 16 || side.filter(p => p.toLowerCase() === 'p').length > 8) return '片側の駒は16個、ポーンは8個までです。';
    }
    const rights = fen.split(' ')[2] || '-';
    for (const [right, kingSquare, king, rookSquare, rook] of [
      ['K', 'e1', 'K', 'h1', 'R'], ['Q', 'e1', 'K', 'a1', 'R'],
      ['k', 'e8', 'k', 'h8', 'r'], ['q', 'e8', 'k', 'a8', 'r']
    ]) {
      if (rights.includes(right) && (pieces[kingSquare] !== king || pieces[rookSquare] !== rook)) return 'キャスリング権と駒配置が一致していません。';
    }
    const chess = new Chess(fen);
    const otherKing = Object.keys(pieces).find(s => pieces[s] === (turn === 'w' ? 'k' : 'K'));
    if (chess.isAttacked(otherKing, turn)) return '手番ではない側のキングがチェックされています。';
    return null;
  } catch (e) { return `FENが不正です: ${e.message}`; }
}

export function readInput(text) {
  text = text.trim();
  if (!text) throw new Error('PGNまたはFENを貼り付けてください。');
  if (/^[rnbqkpRNBQKP1-8/]+\s+[wb]\s/.test(text)) {
    return [new Chess(text.replace(/\s+/g, ' ')).fen()];
  }
  if ((text.match(/\[Event\s/g) || []).length > 1) throw new Error('PGNは1対局ずつ入力してください。');
  const chess = new Chess();
  chess.loadPgn(text);
  const moves = chess.history({ verbose: true });
  if (!moves.length && !text.includes('[FEN ')) throw new Error('有効な棋譜がありません。');
  while (chess.undo()) { /* retain the PGN starting position */ }
  const positions = [chess.fen()];
  for (const move of moves) { chess.move(move); positions.push(chess.fen()); }
  return positions;
}
