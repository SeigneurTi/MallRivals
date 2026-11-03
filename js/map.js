// Rues, sorties de la ville et cases de boutiques (toutes de même taille).
// ================= Rues =================
// 3 rues verticales (X) × 4 rues horizontales (Y). Toutes les cases ont la même taille et touchent une rue.
const PW=124, PH=90, XS=[40,612,920], YS=[30,266,502,738];
const N={};
XS.forEach((x,i)=>YS.forEach((y,j)=>N[i+','+j]=[x,y]));
Object.assign(N,{xN:[XS[1],-50],xO:[-50,YS[1]],xS:[XS[0],810],xE:[BW+50,YS[2]]});
const EDGES=[];
for(let j=0;j<4;j++)for(let i=0;i<2;i++)EDGES.push([i+','+j,(i+1)+','+j]);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)EDGES.push([i+','+j,i+','+(j+1)]);
EDGES.push(['xN','1,0'],['xO','0,1'],['xS','0,3'],['xE','2,2']);
const EXIT_LABEL={xN:'Nord',xO:'Ouest',xS:'Sud',xE:'Est'};
const adj={};for(const k in N)adj[k]=[];for(const [a,b] of EDGES){adj[a].push(b);adj[b].push(a)}
const inner=Object.keys(N).filter(k=>!k.startsWith('x')), exits=Object.keys(EXIT_LABEL);
function bfs(a,b){const prev={[a]:null},q=[a];
  while(q.length){const n=q.shift();if(n===b)break;for(const m of adj[n].slice().sort(()=>Math.random()-.5))if(!(m in prev)&&(!m.startsWith('x')||m===b)){prev[m]=n;q.push(m)}}
  const p=[];for(let n=b;n!=null;n=prev[n])p.unshift(n);return p}

// ================= Terrains (cases identiques) =================
const COLS=[66,198,330,462,638,770];
const ROWS=[[YS[0]+RH,'top',0],[YS[1]-RH-PH,'bottom',1],[YS[1]+RH,'top',1],[YS[2]-RH-PH,'bottom',2],[YS[2]+RH,'top',2],[YS[3]-RH-PH,'bottom',3]];
const LOT_RECTS=[],LOT_DOOR={},EDGE_SHOPS={};
for(const [a,b] of EDGES)EDGE_SHOPS[a+'|'+b]=EDGE_SHOPS[b+'|'+a]=[];
for(const [y,side,j] of ROWS)for(const x of COLS){
  const idx=LOT_RECTS.length;LOT_RECTS.push([x,y,PW,PH]);LOT_DOOR[idx]=side;
  const cx=x+PW/2,i=cx<XS[1]?0:1,key=i+','+j+'|'+(i+1)+','+j;
  EDGE_SHOPS[key].push({idx,along:cx,door:[cx,side==='top'?y:y+PH],street:[cx,YS[j]]});
}
const tileOfRect=([x,y,w,h])=>[x,y,w,h];

