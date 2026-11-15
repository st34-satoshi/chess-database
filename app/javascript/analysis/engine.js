// Serialize searches: only accept output after the previous bestmove barrier.
export class AnalysisEngine {
  constructor(update, status, WorkerClass = Worker) {
    this.update = update;
    this.status = status;
    this.ready = false;
    this.running = false;
    this.pending = null;
    this.active = null;
    this.worker = new WorkerClass('/engine/stockfish-19-lite-single.js');
    this.worker.onmessage = event => String(event.data).split('\n').forEach(line => this.receive(line));
    this.worker.onerror = () => { this.failed = true; this.status('エンジンを起動できません。ページを再読み込みしてください。'); this.worker.terminate(); };
    this.send('uci');
  }
  send(command) { this.worker.postMessage(command); }
  search(fen, count) {
    if (this.failed) return;
    this.pending = { fen, count };
    this.active = null;
    if (this.running) this.send('stop');
    else this.start();
  }
  stop() {
    this.pending = null;
    this.active = null;
    if (this.running) this.send('stop');
  }
  start() {
    if (!this.ready || this.running || !this.pending) return;
    this.active = this.pending;
    this.pending = null;
    this.running = true;
    this.send(`setoption name MultiPV value ${this.active.count}`);
    this.send(`position fen ${this.active.fen}`);
    this.send('go depth 24');
    this.status('解析中');
  }
  receive(line) {
    if (line === 'uciok') { this.send('setoption name Hash value 32'); this.send('isready'); }
    if (line === 'readyok') { this.ready = true; this.start(); }
    if (line.startsWith('bestmove')) {
      this.running = false;
      if (this.active) this.status('解析完了');
      this.start();
      return;
    }
    if (!this.active || !line.startsWith('info ') || /upperbound|lowerbound/.test(line)) return;
    const score = line.match(/ score (cp|mate) (-?\d+)/);
    const pv = line.match(/ pv (.+)/);
    const depth = line.match(/ depth (\d+)/);
    if (!score || !pv || !depth) return;
    this.update({ rank: Number(line.match(/ multipv (\d+)/)?.[1] || 1), depth: Number(depth[1]),
      type: score[1], value: Number(score[2]) * (this.active.fen.split(' ')[1] === 'w' ? 1 : -1), moves: pv[1].split(' ') });
  }
  destroy() { this.worker.terminate(); }
}
