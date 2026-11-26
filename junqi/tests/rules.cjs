const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../engine.js'), 'utf8');
const rules = vm.runInNewContext(source + ';Junqi');
const piece = (side, rank, open = true) => ({ side, rank, open });
function fixture() {
  const game = rules.start();
  game.board.fill(null);
  return game;
}
function allows(game, from, to) {
  return rules.moves(game.board, game.turn).some(move => move.from === from && move.to === to);
}

// Test every ordinary rank pairing in both attack directions and colors.
for (const side of ['red','blue']) {
  for (let attacker = 1; attacker <= 9; attacker++) {
    for (let defender = 1; defender <= 9; defender++) {
      const g = fixture();
      g.turn = side;
      g.board[5] = piece(side,attacker);
      g.board[8] = piece(side === 'red' ? 'blue' : 'red',defender);
      const before = JSON.stringify(g);
      const legal = attacker >= defender;
      assert.equal(allows(g,5,8),legal);
      assert.equal(rules.play(g,{from:5,to:8}),legal);
      if (!legal) assert.equal(JSON.stringify(g),before);
      else assert.equal(g.board[8]?.rank ?? null,attacker === defender ? null : attacker);
    }
  }
}
// Check every multi-station trip on an empty board, including engineers.
for (const rank of [1, 7]) {
  for (let from = 0; from < 60; from++) {
    const game = fixture();
    game.board[from] = piece('red', rank);
    for (const { to } of rules.moves(game.board, 'red')) {
      const direct = rules.edges.some(e => (e.a === from && e.b === to) || (e.b === from && e.a === to));
      if (direct) continue;
      assert.ok(from % 5 === to % 5 || Math.floor(from / 5) === Math.floor(to / 5));
      const step = from % 5 === to % 5 ? 5 : 1;
      for (let at = Math.min(from,to); at < Math.max(from,to); at += step) {
        assert.ok(rules.edges.some(e => e.rail && e.a === at && e.b === at + step));
      }
    }
  }
}
for (const base of rules.bases) {
  const g = fixture();
  const neighbor = base < 5 ? base + 5 : base - 5;
  g.board[neighbor] = piece('red',7);
  assert.ok(allows(g,neighbor,base));
  g.board[base] = g.board[neighbor];
  g.board[neighbor] = null;
  assert.ok(allows(g,base,neighbor));
}
for (const side of ['red','blue']) {
  const g = fixture();
  g.turn = side;
  g.board[5] = piece(side,11);
  const before = JSON.stringify(g);
  assert.equal(rules.play(g,{from:5,to:6}),false);
  assert.equal(JSON.stringify(g),before);
}
for (const [rank,survivor] of [[7,11],[1,1],[10,null]]) {
  const g = fixture();
  g.board[5] = piece('red',rank);
  g.board[8] = piece('blue',11);
  assert.ok(allows(g,5,8));
  assert.ok(!allows(g,5,9));
  assert.ok(rules.play(g,{from:5,to:8}));
  assert.equal(g.board[8]?.rank ?? null,survivor);
}
for (const enemy of [0,7]) {
  const g = fixture();
  g.turn = 'blue';
  g.board[5] = piece('blue',9);
  g.board[8] = piece('red',enemy);
  g.board[45] = piece('red',8,false);
  for (let i = 0; i < 50; i++) {
    assert.equal(rules.choose(g,'easy').to,8);
  }
}
for (let i = 0; i < 20; i++) {
  const g = rules.start();
  const mines = g.board.map(p => p?.rank === 11 ? p : null);
  while (!g.winner) {
    assert.ok(rules.play(g,rules.choose(g,g.turn === 'red' ? 'easy' : 'medium')));
    g.board.forEach((p,index) => {
      if (p?.rank === 11) assert.equal(p,mines[index]);
    });
  }
}
console.log('Railways, headquarters, mines, tactical choices and 20 complete games passed.');
