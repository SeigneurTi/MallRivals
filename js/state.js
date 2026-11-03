// État de la partie : création, réinitialisation, destruction d'une boutique, journal.
// ================= État =================
// Tout ce qui change pendant une partie (rempli par reset()).
Game.state = {
  lots: [], bucks: [0, 0], selection: null, menuLot: null, people: [], floatingTexts: [], animations: [],
  spawnTimer: 0, banner: null, gameTime: 0,
  targetPopulation: Game.config.people.DEFAULT_COUNT, speedMultiplier: 1,
  isRunning: !Game.view.prefersReducedMotion, hoveredPerson: null,
};

function reset(){
  Game.state.lots=LOT_RECTS.map(([x,y,w,h],idx)=>({index:idx,x,y,w,h,shop:null,owner:null,level:1,shields:0,isHot:false,isBusy:false}));
  const big=Game.state.lots;
  big.slice().sort(()=>Math.random()-.5).slice(0,5).forEach(l=>l.isHot=true);
  big.slice().sort(()=>Math.random()-.5).slice(0,4).forEach((l,k)=>setShop(l,pick(SHOPS.slice(0,10)),k%2));
  Game.state.bucks=[1000,1000];Game.state.selection=null;Game.state.menuLot=null;Game.state.floatingTexts=[];Game.state.animations=[];Game.state.spawnTimer=0;Game.state.banner=null;Game.state.people=[];
  for(let k=0;k<Game.state.targetPopulation;k++)Game.state.people.push(makePerson(true));
  logEl.innerHTML='<li>La ville se réveille.</li>';
  drawBoard();
}
const logEl=document.getElementById('log');
function log(txt){Game.state.banner={txt,t:0};const li=document.createElement('li');li.textContent=txt;logEl.prepend(li);while(logEl.children.length>8)logEl.lastChild.remove()}
const center=l=>[l.x+l.w/2,l.y+l.h/2];
function float(l,txt,col){Game.state.floatingTexts.push({x:l.x+l.w/2,y:l.y,txt,col,t:0})}

function destroy(l){
  for(const p of Game.state.people)if(p.lot===l&&(p.state==='inside'||p.state==='toShop'||p.state==='leaving'))exitShop(p);
  l.shop=null;l.owner=null;l.level=1;l.shields=0;l.occupants=[];
  if(Game.state.menuLot===l)Game.state.menuLot=null;drawBoard();
}

