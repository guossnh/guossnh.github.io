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
    const engineer = board[from].rank === 1;
    const seen = new Set([from]);
    const queue = [{at:from,direction:0}];
    while (queue.length) {
      const {at,direction} = queue.pop();
      for (const {to,rail} of links[at]) {
        const step = to-at;
        if (!rail || seen.has(to) || (!engineer && direction && step !== direction)) continue;
        seen.add(to);
        reachable.add(to);
        if (!board[to]) queue.push({at:to,direction:step});
      }
    }
    return reachable;
  }
  function moves(board, side) {
    const options = [];
    board.forEach((p,i) => {
      if (!p) return;
      if (!p.open) { options.push({to:i}); return; }
      if (p.side !== side || p.rank === mine || p.rank === flag || bases.has(i)) return;
      for (const to of destinations(board,i)) {
        const q = board[to];
        if (q && (!q.open || q.side === side || camps.has(to))) continue;
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
  }
  const value = p => p ? [1000,5,2,3,4,5,6,7,8,9,7,8][p.rank] : 0;
  function gain(board,move) {
    const next = board.slice(), p = board[move.from], q = board[move.to];
    resolve(next,move);
    return (next[move.to] !== q ? value(q) : 0) - (next[move.to] !== p ? value(p) : 0);
  }
  function choose(game,level) {
    const options = moves(game.board,game.turn);
    if (level === 'easy') return options[Math.floor(Math.random()*options.length)];
    let best, high = -Infinity;
    for (const move of options) {
      let score = 1;
      if (move.from !== undefined) {
        score = gain(game.board,move);
        const next = game.board.slice();
        resolve(next,move);
        const threats = moves(next,other(game.turn)).filter(m => m.from !== undefined && next[m.to]);
        score -= 0.85 * Math.max(0,...threats.map(m => gain(next,m)));
      }
      score += Math.random()*0.8;
      if (score > high) { high = score; best = move; }
    }
    return best;
  }
  return {names,cols,camps,bases,edges,start,moves,play,choose};
})();
