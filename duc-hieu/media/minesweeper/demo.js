(function () {
  const levels = { easy: [5, 5, 3], medium: [9, 9, 10], hard: [16, 16, 40] };
  const el = Object.fromEntries(['level','new-game','flag-mode','step','auto','speed','board','board-size','game-state','turn-count','decision-title','decision-reason','method','opened','flags','remaining','history','move-total'].map(id => [id, document.getElementById(id)]));
  const snapshotMode = new URLSearchParams(location.search).has('snapshot');
  let width, height, mineCount, mines, values, states, seed, lastMove, moves, status, timer, flagMode = false;
  const index = (x, y) => y * width + x;
  const coord = cell => ({ x: cell % width, y: Math.floor(cell / width) });
  const pad = n => String(n).padStart(2, '0');
  const directions = [-1, 0, 1];

  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function adjacent(cell) {
    const { x, y } = coord(cell), result = [];
    for (const dx of directions) for (const dy of directions) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) result.push(index(nx, ny));
    }
    return result;
  }

  function stopAuto() {
    clearInterval(timer); timer = null;
    el.auto.textContent = 'Tự giải';
  }

  function newGame(nextSeed) {
    stopAuto();
    flagMode = false;
    el['flag-mode'].setAttribute('aria-pressed', 'false');
    [width, height, mineCount] = levels[el.level.value];
    seed = nextSeed ?? (Date.now() >>> 0);
    mines = Array(width * height).fill(false);
    values = Array(width * height).fill(0);
    states = Array(width * height).fill(-1);
    let placed = 0;
    while (placed < mineCount) {
      const cell = Math.floor(random() * mines.length);
      if (!mines[cell]) { mines[cell] = true; placed++; }
    }
    values.forEach((_, cell) => { if (!mines[cell]) values[cell] = adjacent(cell).filter(neighbor => mines[neighbor]).length; });
    lastMove = null; moves = []; status = 'playing';
    render();
  }

  function reveal(cell) {
    if (status !== 'playing' || states[cell] !== -1) return;
    if (mines[cell]) { status = 'lost'; states[cell] = -3; return; }
    const queue = [cell];
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      if (states[current] !== -1) continue;
      states[current] = values[current];
      if (values[current] === 0) adjacent(current).forEach(neighbor => { if (states[neighbor] === -1 && !mines[neighbor] && !queue.includes(neighbor)) queue.push(neighbor); });
    }
    if (states.filter(state => state >= 0).length === mines.length - mineCount) status = 'won';
  }

  function flag(cell) { if (status === 'playing' && (states[cell] === -1 || states[cell] === -2)) states[cell] = states[cell] === -2 ? -1 : -2; }

  function step() {
    if (status !== 'playing') return;
    const board = { width, height, mineCount, states: Array.from({ length: width * height }, (_, cell) => states[cell]) };
    const action = window.MinesweeperSolver.next({ ...board, states: Array.from({ length: width * height }, (_, cell) => board.states[index(Math.floor(cell / height), cell % height)]) });
    if (!action) { stopAuto(); return; }
    const cell = index(action.x, action.y);
    if (action.action === 'flag') flag(cell); else reveal(cell);
    lastMove = cell;
    moves.unshift(action);
    if (status !== 'playing') stopAuto();
    render();
  }

  function toggleAuto() {
    if (timer) { stopAuto(); return; }
    if (status !== 'playing') return;
    el.auto.textContent = 'Tạm dừng';
    timer = setInterval(step, 1000 - Number(el.speed.value));
    step();
  }

  function renderBoard() {
    el.board.style.setProperty('--cols', width);
    el.board.style.setProperty('--cell', width === 16 ? '28px' : width === 5 ? '55px' : '42px');
    el.board.dataset.level = el.level.value;
    const fragment = document.createDocumentFragment();
    for (let y = height - 1; y >= 0; y--) for (let x = 0; x < width; x++) {
      const cell = index(x, y), state = states[cell];
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'cell'; button.setAttribute('role', 'gridcell');
      if (state >= 0) { button.classList.add('revealed', state ? `n${state}` : 'empty'); button.textContent = state || ''; }
      if (state === -2) button.classList.add('flagged');
      if (state === -3 || (status !== 'playing' && mines[cell] && state !== -2)) button.classList.add('mine');
      if (cell === lastMove) button.classList.add('latest');
      button.setAttribute('aria-label', `Ô ${x + 1}, ${y + 1}: ${state === -2 ? 'cờ' : state === -1 ? 'chưa mở' : state === -3 ? 'mìn' : state === 0 ? 'trống' : state}`);
      button.addEventListener('click', event => { if (flagMode || event.shiftKey) flag(cell); else reveal(cell); lastMove = cell; render(); });
      button.addEventListener('contextmenu', event => { event.preventDefault(); flag(cell); lastMove = cell; render(); });
      fragment.append(button);
    }
    el.board.replaceChildren(fragment);
  }

  function render() {
    renderBoard();
    const flags = states.filter(state => state === -2).length;
    const opened = states.filter(state => state >= 0).length;
    el['board-size'].textContent = `${width} × ${height}`;
    el['game-state'].textContent = status === 'won' ? 'ĐÃ THẮNG' : status === 'lost' ? 'TRÚNG MÌN' : 'ĐANG CHƠI';
    el.opened.textContent = pad(opened); el.flags.textContent = pad(flags); el.remaining.textContent = pad(mineCount - flags);
    el['turn-count'].textContent = `BƯỚC ${pad(moves.length)}`;
    el['move-total'].textContent = `${pad(moves.length)} NƯỚC`;
    const latest = moves[0];
    el['decision-title'].textContent = status === 'won' ? 'Đã giải xong' : status === 'lost' ? 'Đã trúng mìn' : latest ? `${latest.action === 'flag' ? 'Cắm cờ' : 'Mở ô'} (${latest.x + 1}, ${latest.y + 1})` : 'Sẵn sàng';
    el['decision-reason'].textContent = latest?.reason ?? 'Nhấn “Bước tiếp” để xem AI chọn ô đầu tiên.';
    el.method.textContent = latest?.method ?? '—';
    el.step.disabled = status !== 'playing'; el.auto.disabled = status !== 'playing';
    el.history.replaceChildren(...moves.slice(0, 15).map((action, reverseIndex) => {
      const li = document.createElement('li'), number = document.createElement('small'), label = document.createElement('span'), method = document.createElement('b');
      number.textContent = pad(moves.length - reverseIndex);
      label.textContent = `${action.action === 'flag' ? 'Cắm cờ' : 'Mở ô'} (${action.x + 1}, ${action.y + 1})`;
      method.textContent = action.method;
      if (action.risk !== null && action.risk > 0 && action.risk < 1) method.className = 'guess';
      li.append(number, label, method); return li;
    }));
  }

  el['new-game'].addEventListener('click', () => newGame());
  el['flag-mode'].addEventListener('click', () => { flagMode = !flagMode; el['flag-mode'].setAttribute('aria-pressed', String(flagMode)); });
  el.level.addEventListener('change', () => newGame());
  el.step.addEventListener('click', step);
  el.auto.addEventListener('click', toggleAuto);
  el.speed.addEventListener('input', () => { if (timer) { stopAuto(); toggleAuto(); } });
  newGame(snapshotMode ? 1432 : undefined);
  if (snapshotMode) for (let i = 0; i < 18 && status === 'playing'; i++) step();
  document.body.dataset.ready = 'true';
  window.demoState = () => ({ status, moves: moves.length, opened: states.filter(state => state >= 0).length });
})();
