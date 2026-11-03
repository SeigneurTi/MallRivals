// Compléments pour les navigateurs anciens (roundRect sur iOS < 16).
if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.max(0,Math.min(typeof r==='number'?r:(r&&r[0])||0,Math.abs(w)/2,Math.abs(h)/2));
    this.moveTo(x+r,y);this.arcTo(x+w,y,x+w,y+h,r);this.arcTo(x+w,y+h,x,y+h,r);this.arcTo(x,y+h,x,y,r);this.arcTo(x,y,x+w,y,r);this.closePath();return this}}
