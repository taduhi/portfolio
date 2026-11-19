// Browser port of the decision order in Assets/Scripts/AI/AISolve.cs.
(function () {
  const dirs = [-1, 0, 1];
  const pos = (x, y, h) => x * h + y;
  const xy = (index, h) => ({ x: Math.floor(index / h), y: index % h });

  function neighbors(board, x, y, state) {
    const cells = [];
    for (const dx of dirs) for (const dy of dirs) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < board.width && ny >= 0 && ny < board.height && board.states[pos(nx, ny, board.height)] === state) cells.push(pos(nx, ny, board.height));
    }
    return cells;
  }

  function move(index, board, action, method, reason, risk) {
    return { ...xy(index, board.height), action, method, reason, risk };
  }

  function basic(board) {
    for (let x = 0; x < board.width; x++) for (let y = 0; y < board.height; y++) {
      const value = board.states[pos(x, y, board.height)];
      if (value <= 0) continue;
      const hidden = neighbors(board, x, y, -1);
      const remaining = value - neighbors(board, x, y, -2).length;
      if (remaining > 0 && hidden.length === remaining) return move(hidden[0], board, 'flag', 'Ô số', `Ô ${value} còn đúng ${remaining} mìn quanh nó; các ô chưa mở đều là mìn.`, 1);
      if (remaining === 0 && hidden.length) return move(hidden[0], board, 'reveal', 'Ô số', `Các mìn quanh ô ${value} đã được đánh dấu. Ô này có thể mở an toàn.`, 0);
    }
    return null;
  }

  function groups(board) {
    for (let x = 0; x < board.width; x++) for (let y = 0; y < board.height; y++) {
      const aValue = board.states[pos(x, y, board.height)];
      if (aValue <= 0) continue;
      const a = neighbors(board, x, y, -1);
      if (!a.length) continue;
      const aSet = new Set(a);
      const aMines = aValue - neighbors(board, x, y, -2).length;
      for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= board.width || ny < 0 || ny >= board.height) continue;
        const bValue = board.states[pos(nx, ny, board.height)];
        if (bValue <= 0) continue;
        const b = neighbors(board, nx, ny, -1);
        if (b.length <= a.length || !a.every(cell => b.includes(cell))) continue;
        const difference = b.find(cell => !aSet.has(cell));
        const bMines = bValue - neighbors(board, nx, ny, -2).length;
        if (bMines - aMines === b.length - a.length) return move(difference, board, 'flag', 'So sánh nhóm', 'Nhóm ô lớn có thêm đúng số mìn bằng số ô khác biệt. Đặt cờ ở phần đó.', 1);
        if (bMines === aMines) return move(difference, board, 'reveal', 'So sánh nhóm', 'Hai nhóm ô cần cùng số mìn; phần ô khác biệt có thể mở.', 0);
      }
    }
    return null;
  }

  function endgame(board) {
    const hidden = [];
    let flags = 0;
    board.states.forEach((state, index) => { if (state === -1) hidden.push(index); else if (state === -2) flags++; });
    const remaining = board.mineCount - flags;
    if (!hidden.length) return null;
    if (remaining === 0) return move(hidden[0], board, 'reveal', 'Tổng số mìn', 'Đã đánh dấu đủ mìn. Các ô còn lại có thể mở.', 0);
    if (remaining > 0 && hidden.length === remaining) return move(hidden[0], board, 'flag', 'Tổng số mìn', 'Số ô chưa mở bằng số mìn còn lại. Đặt cờ.', 1);
    return null;
  }

  function combination(n, k) {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let result = 1;
    for (let i = 1; i <= k; i++) result = result * (n - k + i) / i;
    return result;
  }

  function probability(board) {
    const hidden = [], frontierSet = new Set(), constraints = [];
    let flags = 0;
    for (let x = 0; x < board.width; x++) for (let y = 0; y < board.height; y++) {
      const index = pos(x, y, board.height), state = board.states[index];
      if (state === -2) flags++;
      else if (state === -1) hidden.push(index);
      else if (state > 0) {
        const cells = neighbors(board, x, y, -1);
        const mines = state - neighbors(board, x, y, -2).length;
        if (cells.length) { constraints.push({ cells, mines }); cells.forEach(cell => frontierSet.add(cell)); }
        else if (mines !== 0) constraints.push({ cells: [], mines });
      }
    }
    if (!hidden.length) return null;
    const center = { x: Math.floor(board.width / 2), y: Math.floor(board.height / 2) };
    const centerFirst = [...hidden].sort((a, b) => {
      const p = xy(a, board.height), q = xy(b, board.height);
      return ((p.x-center.x)**2 + (p.y-center.y)**2) - ((q.x-center.x)**2 + (q.y-center.y)**2);
    });
    const frontier = hidden.filter(cell => frontierSet.has(cell));
    const outside = hidden.length - frontier.length;
    const remaining = board.mineCount - flags;
    const fallback = () => move(centerFirst[0], board, 'reveal', 'Nước thăm dò', 'Chưa có đủ dữ kiện để xác định ô an toàn. AI thử ô gần trung tâm.', null);
    if (remaining < 0 || remaining > hidden.length) return fallback();
    const minMines = Math.max(0, remaining - outside), maxMines = Math.min(remaining, frontier.length);
    const indices = new Map(frontier.map((cell, i) => [cell, i]));
    const clauses = constraints.map(c => ({ variables: c.cells.map(cell => indices.get(cell)), mines: c.mines, assigned: 0, unassigned: c.cells.length }));
    if (clauses.some(c => c.mines < 0 || c.mines > c.variables.length)) return fallback();
    const links = frontier.map(() => []);
    clauses.forEach((clause, i) => clause.variables.forEach(variable => links[variable].push(i)));
    const order = frontier.map((_, i) => i).sort((a, b) => links[b].length - links[a].length);
    const assignment = Array(frontier.length).fill(0);
    const ways = Array(frontier.length + 1).fill(0);
    const mineWays = Array.from({ length: frontier.length + 1 }, () => Array(frontier.length).fill(0));
    let visited = 0, limitReached = false;
    function search(depth, assignedMines) {
      if (limitReached) return;
      if (++visited > 1000000) { limitReached = true; return; }
      if (depth === order.length) {
        ways[assignedMines]++;
        assignment.forEach((value, i) => { if (value) mineWays[assignedMines][i]++; });
        return;
      }
      const variable = order[depth];
      for (let value = 0; value <= 1; value++) {
        assignment[variable] = value;
        let valid = true;
        for (const clauseIndex of links[variable]) {
          const clause = clauses[clauseIndex];
          clause.unassigned--;
          clause.assigned += value;
          if (clause.assigned > clause.mines || clause.assigned + clause.unassigned < clause.mines) valid = false;
        }
        const next = assignedMines + value;
        if (valid && next <= maxMines && next + order.length - depth - 1 >= minMines) search(depth + 1, next);
        for (const clauseIndex of links[variable]) {
          const clause = clauses[clauseIndex]; clause.assigned -= value; clause.unassigned++;
        }
        if (limitReached) return;
      }
    }
    search(0, 0);
    if (limitReached) return fallback();
    let total = 0;
    ways.forEach((count, k) => { total += count * combination(outside, remaining - k); });
    if (!total) return fallback();
    let best = centerFirst[0], lowest = Infinity;
    for (const cell of hidden) {
      let mineCount = 0;
      if (frontierSet.has(cell)) {
        const variable = indices.get(cell);
        ways.forEach((_, k) => { mineCount += mineWays[k][variable] * combination(outside, remaining - k); });
      } else {
        ways.forEach((count, k) => { mineCount += count * combination(outside - 1, remaining - k - 1); });
      }
      const risk = mineCount / total;
      if (risk < lowest) { lowest = risk; best = cell; }
    }
    return move(best, board, 'reveal', 'Duyệt xác suất', `Duyệt các cách đặt mìn phù hợp với ô số. Ô này có rủi ro thấp nhất (${Math.round(lowest * 100)}%).`, lowest);
  }

  window.MinesweeperSolver = { next(board) { return basic(board) || groups(board) || endgame(board) || probability(board); } };
})();
