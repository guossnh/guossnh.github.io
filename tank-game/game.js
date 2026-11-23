'use strict';
const $ = id => document.getElementById(id);
const ctx = $('field').getContext('2d');
const dirs = {up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
const names = Object.keys(dirs);
const held = new Map();
let grid, player, foes, shots, sparks, prize, stage=1, score=0, lives=3, waiting, spawnTimer, state, clock=0;
let audio, sound=true;
function tone(freq,duration=.07) {
  if(!sound || !audio || audio.state!=='running') return;
  const osc=audio.createOscillator(), gain=audio.createGain();
  osc.type='square'; osc.frequency.setValueAtTime(freq,audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq*.55,audio.currentTime+duration);
  gain.gain.setValueAtTime(.035,audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
  osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime+duration);
}
function hud(){
  for(const [id,v,n] of [['stage',stage,2],['score',score,5],['lives',lives,2],['enemies',waiting+foes.length,2]]) $(id).textContent=String(v).padStart(n,'0');
}
function screen(mode,title='',hint='',action=''){
  state=mode; resetControls(); $('overlay').hidden=mode==='play'; $('title').textContent=title;
  $('hint').textContent=hint; $('action').textContent=action; $('pause').disabled=mode!=='play';
}
function tank(x,y,enemy=false,type=0){
  return {x,y,enemy,type,dir:enemy?'down':'up',speed:enemy?(type===1?51:31):59,
    hp:type===3?3:1,cool:enemy?.7:0,shield:enemy?.55:2,decision:0,power:0};
}
function loadStage(){
  const power=player?.power || 0;
  grid=makeField(stage); player=tank(72,200); player.power=power; foes=[]; shots=[]; sparks=[]; prize=null;
  waiting=20; spawnTimer=.3; hud();
}
function action(){
  if(!audio && window.AudioContext) audio=new AudioContext();
  if(sound && audio?.state==='suspended') audio.resume().catch(()=>{});
  if(state==='lost'||state==='won'){stage=1;score=0;lives=3;player=null;loadStage();}
  if(state==='clear'){stage++;loadStage();}
  screen('play');
}
$('action').onclick=action;
function pause(){if(state==='play') screen('paused','已暂停','战场已冻结','继续游戏');}
$('pause').onclick=pause;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent='声音 '+(sound?'开':'关');$('sound').setAttribute('aria-pressed',sound);};
const keys={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'fire'};
window.addEventListener('keydown',e=>{
  if(e.code==='KeyP'&&!e.repeat){if(state==='paused') action();else pause();}
  if(state!=='play'||!keys[e.code]) return;
  e.preventDefault();if(!e.repeat) held.set(e.code,keys[e.code]);
});
window.addEventListener('keyup',e=>held.delete(e.code));
const stick = $('stick');
const knob = stick.querySelector('.stick-knob');
const fire = $('fire');
const pointers = new Map();

function releaseControl(control) {
  if (!pointers.has(control)) return;
  const id = pointers.get(control);
  pointers.delete(control);
  held.delete(id);
  control.classList.remove('active');
  if (control === stick) knob.style.transform = '';
  if (control.hasPointerCapture(id)) control.releasePointerCapture(id);
}
function resetControls() {
  releaseControl(stick);
  releaseControl(fire);
  held.clear();
}
function steer(event) {
  const bounds = stick.getBoundingClientRect();
  const x = event.clientX - bounds.left - bounds.width / 2;
  const y = event.clientY - bounds.top - bounds.height / 2;
  const distance = Math.hypot(x, y);
  const travel = (stick.clientWidth - knob.offsetWidth) / 2;
  const scale = Math.min(1, travel / (distance || 1));
  knob.style.transform = `translate(${x * scale}px, ${y * scale}px)`;
  if (distance < 10) {
    held.delete(event.pointerId);
    return;
  }
  const horizontal = Math.abs(x) > Math.abs(y);
  const direction = horizontal ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down');
  held.set(event.pointerId, direction);
}
for (const control of [stick, fire]) {
  control.addEventListener('pointerdown', event => {
    if (state !== 'play' || event.button !== 0 || pointers.has(control)) return;
    event.preventDefault();
    control.setPointerCapture(event.pointerId);
    pointers.set(control, event.pointerId);
    control.classList.add('active');
    if (control === stick) steer(event);
    else held.set(event.pointerId, 'fire');
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    control.addEventListener(type, event => {
      if (pointers.get(control) === event.pointerId) releaseControl(control);
    });
  }
}
stick.addEventListener('pointermove', event => {
  if (pointers.get(stick) === event.pointerId) steer(event);
});
const controls = stick.parentElement;
for (const type of ['selectstart', 'contextmenu']) {
  controls.addEventListener(type, event => event.preventDefault());
}
window.addEventListener('blur',pause);
window.addEventListener('pagehide',pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
function tile(x,y){return grid[Math.floor(y/8)]?.[Math.floor(x/8)] ?? 's';}
function open(t,x,y){
  for(const dx of [-6.7,6.7]) for(const dy of [-6.7,6.7]) if(!'.f'.includes(tile(x+dx,y+dy))) return false;
  return [player,...foes].every(other=>other===t||Math.abs(x-other.x)>=13.5||Math.abs(y-other.y)>=13.5);
}
function walk(t,dir,dt){
  const [dx,dy]=dirs[dir], distance=t.speed*dt;
  t.dir=dir;
  let x=t.x+dx*distance,y=t.y+dy*distance;
  // Steer into the nearest lane when turning past the edge of a wall.
  if(dx) y+=Math.sign(Math.round(y/8)*8-y)*Math.min(distance,Math.abs(Math.round(y/8)*8-y));
  if(dy) x+=Math.sign(Math.round(x/8)*8-x)*Math.min(distance,Math.abs(Math.round(x/8)*8-x));
  if(!open(t,x,y)) return false;
  t.x=x;t.y=y;return true;
}
function shoot(t){
  if(t.cool>0 || shots.filter(b=>b.owner===t).length>=(t.power>=2?2:1))return;
  const [dx,dy]=dirs[t.dir];shots.push({x:t.x+dx*6,y:t.y+dy*6,dx,dy,owner:t,speed:t.power||t.type===2?161:125});
  t.cool=t.enemy?.7+Math.random()*.55:.22;if(!t.enemy)tone(180);
}
function burst(x,y){sparks.push({x,y,age:0});tone(85,.16);}
function enemyMove(t,dt){
  t.decision-=dt;
  if(t.decision<=0){
    const towardX=t.x<104?'right':'left', towardY=t.y<196?'down':'up';
    const choices=[...names,towardX,towardY,towardY,towardY];
    const free=choices.filter(d=>{const [dx,dy]=dirs[d];return open(t,t.x+dx*2,t.y+dy*2);});
    t.dir=free[Math.floor(Math.random()*free.length)]||towardY;t.decision=.35+Math.random()*1.2;
  }
  if(!walk(t,t.dir,dt)){shoot(t);t.decision=0;}
  else if(Math.random()<dt*1.7)shoot(t);
}
function hit(b){
  const cell=tile(b.x,b.y);
  if(cell==='E'){burst(104,200);screen('lost','基地失守','本次得分 '+score,'再来一局');return true;}
  if(cell==='s'||cell==='b'){
    if(cell==='b'||(!b.owner.enemy && b.owner.power>=3 && b.x>=0&&b.x<208&&b.y>=0&&b.y<208))grid[b.y>>3][b.x>>3]='.';
    sparks.push({x:b.x,y:b.y,age:.13});return true;
  }
  const t=(b.owner.enemy?[player]:foes).find(t=>Math.abs(t.x-b.x)<7&&Math.abs(t.y-b.y)<7);
  if(!t)return false;
  if(t.shield>0)return true;
  if(--t.hp>0)return true;
  burst(t.x,t.y);
  if(t.enemy){
    foes.splice(foes.indexOf(t),1);score+=(t.type+1)*100;
    if((waiting+foes.length)%4===0)prize={x:t.x,y:t.y,kind:['★','+','S'][Math.floor(Math.random()*3)]};
  }else if(--lives===0)screen('lost','全军覆没','本次得分 '+score,'再来一局');
  else {player=tank(72,200);for(const foe of foes)if(Math.abs(foe.x-72)<15&&Math.abs(foe.y-200)<15){foes.splice(foes.indexOf(foe),1);waiting++;break;}}
  hud();return true;
}
function update(dt){
  clock+=dt;sparks=sparks.filter(p=>(p.age+=dt)<.24);
  spawnTimer-=dt;
  if(waiting && spawnTimer<=0 && foes.length<4){
    const lanes=[8,104,200], first=(20-waiting)%3;
    const x=lanes.map((_,i)=>lanes[(first+i)%3]).find(x=>open(null,x,8));
    if(x!==undefined){foes.push(tank(x,8,true,(20-waiting+stage-1)%4));waiting--;spawnTimer=1.6;}
  }
  for(const t of [player,...foes]){t.cool-=dt;t.shield-=dt;}
  const move=[...held.values()].reverse().find(k=>dirs[k]);if(move)walk(player,move,dt);
  if([...held.values()].includes('fire'))shoot(player);
  for(const t of foes)enemyMove(t,dt);
  for(const b of shots){
    if(b.dead)continue;
    b.x+=b.dx*b.speed*dt;b.y+=b.dy*b.speed*dt;
    const clash=shots.find(c=>!c.dead && c.owner.enemy!==b.owner.enemy && Math.abs(c.x-b.x)<3 && Math.abs(c.y-b.y)<3);
    if(clash){clash.dead=true;b.dead=true;}else b.dead=hit(b);
    if(state!=='play')break;
  }
  shots=shots.filter(b=>!b.dead);
  if(state!=='play')return;
  if(prize && Math.abs(player.x-prize.x)<12 && Math.abs(player.y-prize.y)<12){
    if(prize.kind==='★')player.power=Math.min(3,player.power+1);else if(prize.kind==='+')lives++;else player.shield=10;
    prize=null;score+=500;tone(660,.16);hud();
  }
  if(!waiting&&!foes.length){if(stage===35)screen('won','作战胜利','35 关全部完成 · 得分 '+score,'重新挑战');else screen('clear','战区肃清','第 '+stage+' 关完成 · 得分 '+score,'进入下一关');}
}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function terrain(foliage){
  grid.forEach((row,iy)=>row.forEach((c,ix)=>{
    const x=ix*8,y=iy*8;if((c==='f')!==foliage)return;
    if(c==='b'){
      rect(x,y,8,8,'#6e3528');for(let i=0;i<2;i++){rect(x,y+i*4,8,1,'#dd9965');rect(x,y+i*4+1,8,2,'#af5840');rect(x+(i?6:2),y+i*4,1,3,'#61382d');}
    }else if(c==='s'){rect(x,y,8,8,'#797f78');rect(x,y,7,7,'#d4d8c9');rect(x+2,y+2,5,5,'#a1a8a1');}
    else if(c==='w'){rect(x,y,8,8,'#244a86');rect(x+(ix+Math.floor(clock*2))%4,y+3,4,1,'#7cbbdb');}
    else if(c==='f'){rect(x,y,8,8,'#285532');rect(x+2,y+1,3,3,'#628741');rect(x+4,y+4,3,2,'#3e7438');}
  }));
}
const eagle=['110000000011','111001100111','011111111110','001111111100','000011110000','000111111000','001100001100'];
function drawTank(t){
  ctx.save();ctx.translate(Math.round(t.x),Math.round(t.y));ctx.rotate(names.indexOf(t.dir)*Math.PI/2);
  const color=t.enemy?['#c6c8b8','#e79776','#a9c5d9','#b5b19e'][t.type]:'#ffd060';
  for(const x of [-7,4]){rect(x,-7,3,14,'#53564a');for(let i=0;i<4;i++)rect(x,-6+i*3,3,2,color);}
  rect(-4,-5,8,11,color);rect(-3,-2,6,6,'#5a594a');rect(-2,-4,5,5,color);rect(-1,-9,2,7,color);ctx.restore();
  if(t.shield>0 && Math.floor(t.shield*8)%2){ctx.strokeStyle='#d9f6ed';ctx.strokeRect(Math.round(t.x)-8.5,Math.round(t.y)-8.5,17,17);}
}
function render(){
  rect(0,0,208,208,'#101310');terrain(false);
  eagle.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='1')rect(98+x,194+y,1,2,'#d7b673');}));
  [player,...foes].forEach(drawTank);
  for(const b of shots)rect(Math.round(b.x)-1,Math.round(b.y)-1,3,3,'#fff3ca');terrain(true);
  if(prize){rect(prize.x-6,prize.y-6,12,12,'#e8c05b');ctx.font='bold 10px monospace';ctx.fillStyle='#29291f';ctx.fillText(prize.kind,prize.x-4,prize.y+4);}
  for(const p of sparks){const r=2+Math.floor(p.age*27);rect(p.x-r,p.y-2,r*2,4,'#e16837');rect(p.x-2,p.y-r,4,r*2,'#ffcf6a');}
}
loadStage();screen('ready','保卫鹰堡','守住基地，击退 20 辆敌军坦克','开始游戏');
let last=0,carry=0;
function frame(now){
  carry+=Math.min((now-last)/1000,.08);last=now;
  while(carry>=1/120){if(state==='play')update(1/120);carry-=1/120;}
  render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
