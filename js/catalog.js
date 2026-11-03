// Les 20 boutiques, les 2 malus, et les formules de prix, gains et attractivité.
// ================= Catalogue =================
const SHOPS=[
 {id:'fleuriste',name:'Fleuriste',price:60,col:'#e8578f',wall:'#f8dbe6',icon:'flower'},
 {id:'kiosque',name:'Kiosque',price:70,col:'#3d6fb6',wall:'#dfe7f3',icon:'news'},
 {id:'boulangerie',name:'Boulangerie',price:100,col:'#d48a2c',wall:'#f6e3c4',icon:'croissant'},
 {id:'cafe',name:'Café',price:110,col:'#8a5a36',wall:'#ead9c7',icon:'cup'},
 {id:'glacier',name:'Glacier',price:120,col:'#f07fa8',wall:'#fff0d9',icon:'icecream'},
 {id:'librairie',name:'Librairie',price:140,col:'#2f7d6d',wall:'#dceae4',icon:'book'},
 {id:'pharmacie',name:'Pharmacie',price:160,col:'#27a35a',wall:'#f2f6f2',icon:'cross'},
 {id:'pizzeria',name:'Pizzeria',price:180,col:'#c8402f',wall:'#f4e2cf',icon:'pizza'},
 {id:'jouets',name:'Jouets',price:200,col:'#f2a31f',wall:'#e3eefb',icon:'bear'},
 {id:'coiffeur',name:'Coiffeur',price:210,col:'#6b4fb3',wall:'#ece6f7',icon:'scissors'},
 {id:'burger',name:'Burger',price:240,col:'#e2552a',wall:'#fde8b8',icon:'burger'},
 {id:'vetements',name:'Vêtements',price:270,col:'#2b8fbd',wall:'#ece7f1',icon:'shirt'},
 {id:'arcade',name:'Arcade',price:300,col:'#8c3fd1',wall:'#3a3456',icon:'joystick'},
 {id:'restaurant',name:'Restaurant',price:330,col:'#7d2a3a',wall:'#efe2d6',icon:'cutlery'},
 {id:'bowling',name:'Bowling',price:360,col:'#d6336c',wall:'#dfe4ee',icon:'pin'},
 {id:'cinema',name:'Cinéma',price:400,col:'#d22f3b',wall:'#3a2b36',icon:'reel',special:'cinema'},
 {id:'bijouterie',name:'Bijouterie',price:450,col:'#2aa7b8',wall:'#f4efe4',icon:'diamond'},
 {id:'piscine',name:'Piscine',price:480,col:'#4fa8de',icon:'pool',special:'pool'},
 {id:'manege',name:'Manège',price:520,col:'#e9b92e',icon:'carousel',special:'carousel'},
 {id:'hotel',name:'Hôtel',price:600,col:'#b08a2e',wall:'#e8e2d4',icon:'H',special:'hotel'}];
const ACTIONS=[{id:'meteorite',name:'Météorite',price:250,action:true,col:'#c0392b'},{id:'voleur',name:'Voiture-voleur',price:300,action:true,col:'#34495e'}];
const CATALOG=[...SHOPS,...ACTIONS];
const capOf=t=>SPEC[t.id].slots.length;
const income=l=>Math.round(l.b.price*.5/Math.sqrt(capOf(l.b))*(1+.5*(l.level-1))*(l.hot?2:1));
const attraction=l=>Math.min(.97,.45+.4*l.b.price/600+.08*(l.level-1));
const upCost=l=>Math.round(l.b.price*.5*l.level);
const shieldCost=l=>Math.round(60+l.b.price*.25);

