// Dimensions du plateau, canvas, couleurs des joueurs et petits utilitaires.
const LW=1200, LH=760, TW=130, BX=TW, BW=LW-2*TW, RH=20;
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const bg=document.createElement('canvas'), bctx=bg.getContext('2d');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let scale=1,dpr=1;
const PCOL=['#e8743b','#3d7dd8'], PNAME=['Joueur 1','Joueur 2'];
const rr=(a,b)=>a+(b-a)*Math.random(), pick=a=>a[Math.floor(Math.random()*a.length)];
function mix(h,a){const n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,t=a<0?0:255,k=Math.abs(a);return `rgb(${Math.round(r+(t-r)*k)},${Math.round(g+(t-g)*k)},${Math.round(b+(t-b)*k)})`}
function rrect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}

