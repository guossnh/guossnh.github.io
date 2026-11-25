const el = id => document.getElementById(id);
const levels = document.querySelectorAll('[data-level]');
const team = side => side === 'red' ? '红方' : '蓝方';
const label = p => team(p.side) + Junqi.names[p.rank];
let game, selected, computerMove, timer, level = 'easy';
const position = i => ({
  x: 50 + (i % Junqi.cols) * 100,
  y: 36 + Math.floor(i / Junqi.cols) * 60 + (i >= 30 ? 48 : 0)
});
function drawMap() {
  const routes = el('routes');
  const lines = Junqi.edges.map(({a,b,rail}) => {
    const from = position(a), to = position(b);
    const line = 'x1="'+from.x+'" y1="'+from.y+'" x2="'+to.x+'" y2="'+to.y+'"';
    return rail ? '<g class="rail"><line '+line+'/><line class="sleepers" '+line+'/></g>' : '<line '+line+'/>';
  });
  routes.innerHTML = lines.join('') + '<text x="150" y="400">山</text><text x="350" y="400">界</text>';
}
function render() {
  const legal = Junqi.moves(game.board,'red');
  const targets = legal.filter(m => selected !== null && m.from === selected).map(m => m.to);
  const board = el('board');
  game.board.forEach((p,i) => {
    let btn = board.children[i];
    if (!btn) {
      btn = document.createElement('button');
      btn.onclick = () => clickCell(i);
      const {x,y} = position(i);
      btn.style.left = (x / 5) + '%';
      btn.style.top = (y / 7.8) + '%';
      board.append(btn);
    }
    const title = !p ? '空位' : p.open ? label(p) : '暗棋';
    btn.className = 'cell ' + (!p ? 'empty' : p.open ? 'piece '+p.side : 'back');
    btn.classList.toggle('camp',Junqi.camps.has(i));
    btn.classList.toggle('base',Junqi.bases.has(i));
    const terrain = Junqi.bases.has(i) ? '大本营' : Junqi.camps.has(i) ? '行营' : '兵站';
    btn.classList.toggle('target',targets.includes(i));
    btn.classList.toggle('selected',selected === i);
    const mark = computerMove?.from === i ? '起' : computerMove?.to === i ? (computerMove.from === undefined ? '翻' : '至') : '';
    if (mark) btn.dataset.mark = mark;
    else delete btn.dataset.mark;
    btn.setAttribute('aria-label', Math.floor(i/Junqi.cols)+1+'行'+(i%Junqi.cols+1)+'列，'+terrain+'，'+title+(mark ? '，电脑上一步：'+mark : '')+(targets.includes(i)?'，可以走到这里':''));
    if (p && !p.open) btn.innerHTML = '<span>✥</span>';
    else btn.textContent = p ? Junqi.names[p.rank] : terrain;
  });
  el('round').textContent = '第 '+(Math.ceil((game.steps + (game.winner ? 0 : 1))/2))+' 回合';
  el('turn').textContent = game.winner ? ({red:'你赢了！',blue:'电脑获胜',draw:'本局和棋'})[game.winner] : game.turn === 'red' ? '轮到你了' : '电脑思考中…';
  el('hint').textContent = game.winner ? '点击重新开局，再来一盘。' : game.turn === 'blue' ? '蓝方正在选择下一步。' : selected !== null ? '点亮点移动，或点亮框攻击。' : '点击暗棋翻开，或选择你的红棋。';
}
function act(move) {
  const target = game.board[move.to], actor = team(game.turn);
  const mover = game.board[move.from];
  if (!Junqi.play(game,move)) return;
  const result = game.board[move.to];
  let log;
  if (!mover) log = actor+'翻出了'+label(target);
  else if (target?.rank === 11 && result === target) log = label(mover)+'触雷退场，'+label(target)+'留在原位';
  else if (!target) log = label(mover)+'移至第'+(Math.floor(move.to/Junqi.cols)+1)+'行第'+(move.to%Junqi.cols+1)+'列';
  else if (!result) log = label(mover)+'与'+label(target)+'同时退场';
  else log = label(result)+'击败了'+label(result === mover ? target : mover);
  el('last').textContent = log+'。';
  selected = null;
  computerMove = actor === '蓝方' ? move : null;
  const notice = el('notice');
  if (computerMove) {
    const where = i => (Math.floor(i / Junqi.cols) + 1) + '行' + (i % Junqi.cols + 1) + '列';
    const route = mover ? where(move.from) + ' → ' + where(move.to) : where(move.to);
    const detail = mover && !target ? label(mover)+'移动' : log;
    notice.textContent = '电脑' + (mover ? (target ? '交锋' : '走棋') : '翻棋') + ' · ' + route + '　' + detail + '。';
  } else {
    notice.textContent = game.winner ? '对局结束' : '电脑正在走棋…';
  }
  render();
  if (game.winner) {
    const title = el('turn').textContent;
    let reason = team(game.turn) + '已无棋可走。';
    if (game.winner === 'draw') reason = '双方连续 80 步没有翻棋或交锋。';
    else if (mover && target?.rank === 0) reason = label(mover) + '夺取了' + label(target) + '！';
    el('result-title').textContent = title;
    el('result-detail').textContent = reason;
    el('result').dataset.outcome = game.winner;
    notice.textContent = title + '　' + reason;
    if (el('guide').open) el('guide').close();
    el('result').showModal();
  } else if (game.turn === 'blue') timer = setTimeout(() => act(Junqi.choose(game,level)),650);
}
function clickCell(i) {
  if (game.winner || game.turn !== 'red') return;
  const legal = Junqi.moves(game.board,'red');
  const action = legal.find(m => m.to === i && (m.from === undefined || m.from === selected));
  if (action) return act(action);
  selected = selected !== i && legal.some(m => m.from === i) ? i : null;
  render();
  if (selected === null && game.board[i]?.side === 'red' && !legal.some(m => m.from === i))
    el('hint').textContent = [0,11].includes(game.board[i].rank) ? Junqi.names[game.board[i].rank]+'固定在原位，不能移动。' : '这枚棋子当前不能移动，可以翻棋或另选红棋。';
}
function reset() {
  clearTimeout(timer);
  game = Junqi.start();
  selected = computerMove = null;
  el('notice').textContent = '红方先手 · 点一枚暗棋开始';
  el('last').textContent = '新棋局已就绪，红方先翻棋。';
  render();
}
for (const btn of levels) btn.onclick = () => {
  level = btn.dataset.level;
  levels.forEach(b => b.setAttribute('aria-pressed',String(b === btn)));
};
el('replay').onclick = () => {
  el('result').close();
  reset();
};
drawMap();
levels[0].click();
el('reset').onclick = () => { if (!game.steps || game.winner || confirm('结束当前对局并重新洗棋？')) reset(); };
el('rules').onclick = () => el('guide').showModal();
reset();
