// Icônes des enseignes et des cartes (fleur, croissant, bobine de film…).
// ================= Icônes =================
function icon(c,k,cx,cy,r,col){
  c.save();c.fillStyle=col;c.strokeStyle=col;c.lineCap='round';c.lineJoin='round';
  switch(k){
  case 'flower':for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.beginPath();c.arc(cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45,r*.38,0,7);c.fill()}c.fillStyle='#f2c14e';c.beginPath();c.arc(cx,cy,r*.3,0,7);c.fill();break;
  case 'news':c.fillRect(cx-r*.6,cy-r*.65,r*1.2,r*1.3);c.fillStyle='#fff';c.fillRect(cx-r*.45,cy-r*.5,r*.9,r*.25);for(let i=0;i<3;i++)c.fillRect(cx-r*.45,cy-r*.1+i*r*.25,r*.9,r*.1);break;
  case 'croissant':c.lineWidth=r*.5;c.beginPath();c.arc(cx,cy+r*.45,r*.65,Math.PI*1.12,Math.PI*1.88);c.stroke();break;
  case 'cup':c.fillRect(cx-r*.55,cy-r*.15,r*.85,r*.7);c.lineWidth=r*.18;c.beginPath();c.arc(cx+r*.35,cy+r*.18,r*.22,-1.4,1.4);c.stroke();c.lineWidth=r*.12;c.beginPath();c.moveTo(cx-r*.3,cy-r*.35);c.lineTo(cx-r*.2,cy-r*.7);c.moveTo(cx,cy-r*.35);c.lineTo(cx+r*.1,cy-r*.7);c.stroke();break;
  case 'icecream':c.fillStyle='#d9a35b';c.beginPath();c.moveTo(cx-r*.38,cy);c.lineTo(cx+r*.38,cy);c.lineTo(cx,cy+r*.8);c.closePath();c.fill();c.fillStyle=col;c.beginPath();c.arc(cx,cy-r*.12,r*.45,0,7);c.fill();break;
  case 'book':c.fillRect(cx-r*.7,cy-r*.5,r*.62,r*1);c.fillRect(cx+r*.08,cy-r*.5,r*.62,r*1);c.fillStyle='#fff';for(let i=0;i<2;i++){c.fillRect(cx-r*.58,cy-r*.25+i*r*.3,r*.4,r*.08);c.fillRect(cx+r*.2,cy-r*.25+i*r*.3,r*.4,r*.08)}break;
  case 'cross':c.fillRect(cx-r*.22,cy-r*.68,r*.44,r*1.36);c.fillRect(cx-r*.68,cy-r*.22,r*1.36,r*.44);break;
  case 'pizza':c.fillStyle='#f2c14e';c.beginPath();c.moveTo(cx-r*.6,cy-r*.45);c.lineTo(cx+r*.6,cy-r*.45);c.lineTo(cx,cy+r*.7);c.closePath();c.fill();c.fillStyle='#c98a3a';c.fillRect(cx-r*.66,cy-r*.62,r*1.32,r*.2);c.fillStyle=col;for(const [u,v] of [[-.22,-.15],[.2,-.12],[0,.22]]){c.beginPath();c.arc(cx+u*r,cy+v*r,r*.12,0,7);c.fill()}break;
  case 'bear':c.fillStyle='#a0673c';for(const u of [-1,1]){c.beginPath();c.arc(cx+u*r*.45,cy-r*.45,r*.24,0,7);c.fill()}c.beginPath();c.arc(cx,cy,r*.55,0,7);c.fill();c.fillStyle='#f0d2b0';c.beginPath();c.arc(cx,cy+r*.15,r*.22,0,7);c.fill();c.fillStyle='#222';c.beginPath();c.arc(cx-r*.2,cy-r*.12,r*.07,0,7);c.arc(cx+r*.2,cy-r*.12,r*.07,0,7);c.fill();break;
  case 'scissors':c.lineWidth=r*.16;c.beginPath();c.arc(cx-r*.32,cy+r*.45,r*.2,0,7);c.stroke();c.beginPath();c.arc(cx+r*.32,cy+r*.45,r*.2,0,7);c.stroke();c.beginPath();c.moveTo(cx-r*.2,cy+r*.3);c.lineTo(cx+r*.35,cy-r*.65);c.moveTo(cx+r*.2,cy+r*.3);c.lineTo(cx-r*.35,cy-r*.65);c.stroke();break;
  case 'burger':c.fillStyle='#e0a346';c.beginPath();c.ellipse(cx,cy-r*.2,r*.65,r*.38,0,Math.PI,0);c.fill();c.fillStyle='#5fb350';c.fillRect(cx-r*.68,cy-r*.2,r*1.36,r*.14);c.fillStyle='#6b3a1e';c.fillRect(cx-r*.62,cy-r*.06,r*1.24,r*.24);c.fillStyle='#e0a346';rrect(c,cx-r*.62,cy+r*.2,r*1.24,r*.24,r*.1);c.fill();break;
  case 'shirt':c.beginPath();c.moveTo(cx-r*.3,cy-r*.6);c.lineTo(cx-r*.75,cy-r*.3);c.lineTo(cx-r*.55,cy);c.lineTo(cx-r*.42,cy-r*.08);c.lineTo(cx-r*.42,cy+r*.62);c.lineTo(cx+r*.42,cy+r*.62);c.lineTo(cx+r*.42,cy-r*.08);c.lineTo(cx+r*.55,cy);c.lineTo(cx+r*.75,cy-r*.3);c.lineTo(cx+r*.3,cy-r*.6);c.quadraticCurveTo(cx,cy-r*.35,cx-r*.3,cy-r*.6);c.fill();break;
  case 'joystick':c.fillStyle='#333';rrect(c,cx-r*.6,cy+r*.15,r*1.2,r*.45,r*.12);c.fill();c.lineWidth=r*.16;c.strokeStyle='#333';c.beginPath();c.moveTo(cx,cy+r*.2);c.lineTo(cx,cy-r*.35);c.stroke();c.fillStyle=col;c.beginPath();c.arc(cx,cy-r*.45,r*.26,0,7);c.fill();c.fillStyle='#e74c3c';c.beginPath();c.arc(cx+r*.35,cy+r*.37,r*.09,0,7);c.fill();break;
  case 'cutlery':c.lineWidth=r*.14;c.beginPath();c.moveTo(cx-r*.3,cy-r*.65);c.lineTo(cx-r*.3,cy+r*.65);for(const u of [-.5,-.3,-.1]){c.moveTo(cx+u*r,cy-r*.65);c.lineTo(cx+u*r,cy-r*.2)}c.moveTo(cx-r*.5,cy-r*.2);c.lineTo(cx-r*.1,cy-r*.2);c.stroke();c.beginPath();c.moveTo(cx+r*.35,cy+r*.65);c.lineTo(cx+r*.35,cy-r*.65);c.quadraticCurveTo(cx+r*.65,cy-r*.3,cx+r*.35,cy);c.fill();c.stroke();break;
  case 'pin':c.beginPath();c.arc(cx,cy-r*.42,r*.25,0,7);c.fill();c.beginPath();c.ellipse(cx,cy+r*.2,r*.38,r*.5,0,0,7);c.fill();c.fillRect(cx-r*.13,cy-r*.32,r*.26,r*.3);c.fillStyle='#fff';c.fillRect(cx-r*.2,cy-r*.2,r*.4,r*.07);c.fillRect(cx-r*.24,cy-r*.08,r*.48,r*.07);break;
  case 'reel':c.beginPath();c.arc(cx,cy,r*.7,0,7);c.fill();c.fillStyle='#fff';for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;c.beginPath();c.arc(cx+Math.cos(a)*r*.38,cy+Math.sin(a)*r*.38,r*.16,0,7);c.fill()}c.beginPath();c.arc(cx,cy,r*.08,0,7);c.fill();break;
  case 'diamond':c.beginPath();c.moveTo(cx-r*.65,cy-r*.25);c.lineTo(cx-r*.35,cy-r*.6);c.lineTo(cx+r*.35,cy-r*.6);c.lineTo(cx+r*.65,cy-r*.25);c.lineTo(cx,cy+r*.7);c.closePath();c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=r*.07;c.beginPath();c.moveTo(cx-r*.65,cy-r*.25);c.lineTo(cx+r*.65,cy-r*.25);c.moveTo(cx-r*.2,cy-r*.6);c.lineTo(cx,cy+r*.7);c.lineTo(cx+r*.2,cy-r*.6);c.stroke();break;
  case 'pool':c.fillStyle=col;rrect(c,cx-r*.7,cy-r*.55,r*1.4,r*1.1,r*.25);c.fill();c.strokeStyle='#fff';c.lineWidth=r*.12;for(const v of [-.15,.2]){c.beginPath();c.moveTo(cx-r*.5,cy+v*r);c.quadraticCurveTo(cx-r*.25,cy+(v-.18)*r,cx,cy+v*r);c.quadraticCurveTo(cx+r*.25,cy+(v+.18)*r,cx+r*.5,cy+v*r);c.stroke()}break;
  case 'carousel':for(let k=0;k<8;k++){c.fillStyle=k%2?'#d64560':col;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r*.75,k*Math.PI/4,(k+1)*Math.PI/4);c.closePath();c.fill()}c.fillStyle='#fff';c.beginPath();c.arc(cx,cy,r*.18,0,7);c.fill();break;
  case 'H':c.font=`800 ${r*1.5}px "Baloo 2", system-ui, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('H',cx,cy+r*.1);break;
  }
  c.restore();
}

