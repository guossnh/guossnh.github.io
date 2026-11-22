// Each symbol describes a 16-pixel field tile. The base and spawn lanes are added below.
const formations = [
  ['.............','.b.b.b.b.b.b.','.b.b.b.b.b.b.','.b.b.bsb.b.b.','.b.b.b.b.b.b.','.....b.b.....','bb.bb...bb.bb','s.....b.....s','bb.bb.b.bb.bb','.....bbb.....','.b.b.....b.b.','.b.b.....b.b.','.b.b.....b.b.'],
  ['.............','.bb..ss..bb..','....bb.bb....','bb.b.....b.bb','...b.www.b...','.f.b.....b.f.','.f...bbb...f.','...ww...ww...','bb...b.b...bb','...b.....b...','.s.b..b..b.s.','...b.....b...','.............'],
  ['.............','.ff.b...b.ff.','.ff.b.s.b.ff.','....b.s.b....','bb....b....bb','...ss...ss...','.b...fff...b.','.bbb.fff.bbb.','.....bbb.....','.s.b.....b.s.','...b.b.b.b...','.f.........f.','.............'],
  ['.............','.b..ww.ww..b.','.bb.ww.ww.bb.','....bb.bb....','.ss.......ss.','....ww.ww....','bb..ww.ww..bb','...b.....b...','.f...bbb...f.','.ff.b...b.ff.','....b...b....','.bb.......bb.','.............'],
  ['.............','.s.b..b..b.s.','...b.ff..b...','bb...ff....bb','...s....s....','.b...bb...bb.','.bbb....b....','.....ss...ss.','.wwb....b....','.ww..b...bbb.','....b...b....','.ss.......ss.','.............']
];
function makeField(stage) {
  const pattern = formations[(stage-1)%formations.length];
  const variant = Math.floor((stage-1)/formations.length);
  const rows = pattern.map((_,y) => [...pattern[y===0 || y>=11 ? y : 1+(y-1+variant)%10]]);
  for (const [x,y] of [[0,0],[6,0],[12,0],[4,12],[4,11],[6,12]]) rows[y][x]='.';
  const grid = Array.from({length:26},(_,y)=>Array.from({length:26},(_,x)=>rows[y>>1][x>>1]));
  for(let y=23;y<26;y++) for(let x=11;x<=14;x++) grid[y][x]= y===23 || x===11 || x===14 ? 'b':'E';
  return grid;
}
