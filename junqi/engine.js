const Junqi = (() => {
  const names = ['军旗','工兵','排长','连长','营长','团长','旅长','师长','军长','司令','炸弹','地雷'];
  const flag = 0, bomb = 10, mine = 11;
  const other = side => side === 'red' ? 'blue' : 'red';
  const cols = 5, size = 60;
  const camps = new Set([11,13,17,21,23,36,38,42,46,48]);
  const bases = new Set([1,3,56,58]);
  const edges = [];
  const links = Array.from({length:size}, () => []);
  function connect(a,b,rail = false) {
    edges.push({a,b,rail});
    links[a].push({to:b,rail});
    links[b].push({to:a,rail});
  }
  for (let i = 0; i < size; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    if (col < 4) connect(i,i+1,[1,5,6,10].includes(row));
    if (row < 11 && (row !== 5 || col % 2 === 0))
      connect(i,i+cols,row >= 1 && row < 10 && (col === 0 || col === 4 || row === 5));
    for (const dc of [-1,1]) {
      const to = i + cols + dc;
      if (row < 11 && col+dc >= 0 && col+dc < cols && (camps.has(i) || camps.has(to)))
        connect(i,to);
    }
  }
  function start() {
    const army = [0,1,1,1,2,2,2,3,3,3,4,4,5,5,6,6,7,7,8,9,10,10,11,11,11];
    const pieces = ['red','blue'].flatMap(side => army.map(rank => ({side,rank,open:false})));
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i],pieces[j]] = [pieces[j],pieces[i]];
    }
    const board = Array.from({length:size},(_,i) => camps.has(i) ? null : pieces.pop());
    return {board,turn:'red',steps:0,quiet:0,winner:null};
  }
  function destinations(board,from) {
    const reachable = new Set(links[from].map(edge => edge.to));
    for (const first of links[from]) {
      if (!first.rail) continue;
      const step = first.to - from;
      let edge = first;
      while (edge) {
        const at = edge.to;
        reachable.add(at);
        if (board[at]) break;
        edge = links[at].find(link => link.rail && link.to === at + step);
      }
    }
    return reachable;
  }
  function moves(board, side) {
    const options = [];
    board.forEach((p,i) => {
      if (!p) return;
      if (!p.open) { options.push({to:i}); return; }
      if (p.side !== side || p.rank === mine || p.rank === flag) return;
      for (const to of destinations(board,i)) {
        const q = board[to];
        if (q && (!q.open || q.side === side || camps.has(to))) continue;
        if (q && q.rank < bomb && p.rank < q.rank) continue;
        if (q?.rank === flag && board.some(v => v?.side === q.side && v.rank === mine)) continue;
        options.push({from:i,to});
      }
    });
    return options;
  }
  function resolve(board,{from,to}) {
    const p = board[from], q = board[to];
    board[from] = null;
    if (!q || q.rank === flag) board[to] = p;
    else if (p.rank === bomb || q.rank === bomb || p.rank === q.rank) board[to] = null;
    else if (q.rank === mine ? p.rank === 1 : p.rank > q.rank) board[to] = p;
  }
  function play(game,move) {
    const {board,turn} = game;
    if (game.winner || !moves(board,turn).some(m => m.from === move.from && m.to === move.to)) return false;
    const target = board[move.to];
    game.steps++;
    game.quiet = target ? 0 : game.quiet+1;
    if (move.from === undefined) target.open = true;
    else {
      resolve(board,move);
      if (target?.rank === flag) game.winner = turn;
    }
    game.turn = other(turn);
    if (!game.winner && !moves(board,game.turn).length) game.winner = turn;
    if (!game.winner && game.quiet >= 80) game.winner = 'draw';
    return true;
  }
  const value = p => p ? [1000,5,2,3,4,5,6,7,8,9,7,8][p.rank] : 0;
  function gain(board,move) {
    const next = board.slice(), p = board[move.from], q = board[move.to];
    resolve(next,move);
    return (next[move.to] !== q ? value(q) : 0) - (next[move.to] !== p ? value(p) : 0);
  }
  function choose(game,level) {
    const options = moves(game.board,game.turn);
    const opponent = other(game.turn);
    function risk(board,landing) {
      let highest = 0;
      for (const reply of moves(board,opponent)) {
        if (reply.from === undefined || !board[reply.to]) continue;
        if (level === 'easy' && reply.to !== landing) continue;
        highest = Math.max(highest,gain(board,reply));
      }
      return highest;
    }
    const flipScore = level === 'easy' ? 0.6 : 1 - 0.85 * risk(game.board);
    let best, high = -Infinity;
    for (const move of options) {
      let score = flipScore;
      if (move.from !== undefined) {
        if (game.board[move.to]?.rank === flag) return move;
        score = gain(game.board,move);
        const next = game.board.slice();
        resolve(next,move);
        score -= (level === 'easy' ? 0.55 : 0.85) * risk(next,move.to);
      }
      score += Math.random() * (level === 'easy' ? 1.4 : 0.8);
      if (score > high) { high = score; best = move; }
    }
    return best;
  }
  return {names,cols,camps,bases,edges,start,moves,play,choose};
})();
