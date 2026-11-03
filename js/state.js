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
  Game.state.lots=LOT_RECTS.map(([x,y,w,h],idx)=>({idx,x,y,w,h,b:null,owner:null,level:1,shields:0,hot:false,inside:0,busy:false,closed:0}));
  const big=Game.state.lots;
  big.slice().sort(()=>Math.random()-.5).slice(0,5).forEach(l=>l.hot=true);
  big.slice().sort(()=>Math.random()-.5).slice(0,4).forEach((l,k)=>setShop(l,pick(SHOPS.slice(0,10)),k%2));
  Game.state.bucks=[1000,1000];Game.state.selection=null;Game.state.menuLot=null;Game.state.floatingTexts=[];Game.state.animations=[];Game.state.spawnTimer=0;Game.state.banner=null;Game.state.people=[];
  for(let k=0;k<Game.state.targetPopulation;k++)Game.state.people.push(makePerson(true));
  logEl.innerHTML='<li>La ville se réveille.</li>';
  drawBoard();
}
const logEl=document.getElementById('log');
function log(txt){Game.state.banner={txt,t:0};const li=document.createElement('li');li.textContent=txt;logEl.prepend(li);while(logEl.children.length>8)logEl.lastChild.remove()}
const center=l=>[l.x+l.w/2,l.y+l.h/2];
const ART={fleuriste:'le ',kiosque:'le ',boulangerie:'la ',cafe:'le ',glacier:'le ',librairie:'la ',pharmacie:'la ',pizzeria:'la ',jouets:'le magasin de ',coiffeur:'le ',burger:'le ',vetements:'la boutique de ',arcade:"l'",restaurant:'le ',bowling:'le ',cinema:'le ',bijouterie:'la ',piscine:'la ',manege:'le ',hotel:"l'"};
const nom=l=>{const a=ART[l.b.id];return a+(a.endsWith('de ')?l.b.name.toLowerCase():l.b.name)};
const aNom=l=>nom(l).replace(/^le /,'au ').replace(/^la /,'à la ').replace(/^l'/,"à l'");
const deNom=l=>nom(l).replace(/^le /,'du ').replace(/^la /,'de la ').replace(/^l'/,"de l'");
function float(l,txt,col){Game.state.floatingTexts.push({x:l.x+l.w/2,y:l.y,txt,col,t:0})}

function destroy(l){
  for(const p of Game.state.people)if(p.lot===l&&(p.state==='inside'||p.state==='toShop'||p.state==='leaving'))exitShop(p);
  l.b=null;l.owner=null;l.level=1;l.shields=0;l.closed=0;l.occ=[];
  if(Game.state.menuLot===l)Game.state.menuLot=null;drawBoard();
}

