var GATE = {'3x3':{p:9000,w:3,h:3},'4x4':{p:13500,w:4,h:4},'5x5':{p:19000,w:5,h:5}};
var USES = [
  {id:'magazyn', n:'Magazyn', d:'Składowanie, logistyka', def:{cover:'ciepla', h:7, gates:2, gate:'4x4', floor:'beton'}},
  {id:'warsztat', n:'Warsztat lub serwis', d:'Pierwsza własna hala firmy', def:{cover:'ciepla', h:6, gates:1, gate:'4x4', floor:'przem', office:30}},
  {id:'produkcja', n:'Produkcja', d:'Maszyny, linie, suwnice', def:{cover:'ciepla', h:7, gates:2, gate:'5x5', floor:'przem', office:40}},
  {id:'rolnicza', n:'Hala rolnicza', d:'Maszyny, nawozy, zboże', def:{cover:'zimna', h:6, gates:2, gate:'5x5', floor:'beton'}},
  {id:'wynajem', n:'Pod wynajem', d:'Moduły dla najemców', def:{cover:'ciepla', h:7, gates:4, gate:'4x4', floor:'przem'}},
  {id:'inne', n:'Inne', d:'Opiszesz w uwagach', def:{}}
];
var PRESETS = [
  {n:'Magazyn na nawozy', d:'20 × 20 m · 400 m² · hala zimna · 2 bramy', s:{path:'std',unsure:false,use:'rolnicza',w:20,l:20,h:6,cover:'zimna',gates:2,gate:'5x5',floor:'beton',office:0,windows:0}},
  {n:'Warsztat z zapleczem', d:'20 × 25 m · 500 m² · hala ciepła · 30 m² zaplecza', s:{path:'std',unsure:false,use:'warsztat',w:20,l:25,h:6,cover:'ciepla',gates:2,gate:'4x4',floor:'przem',office:30,windows:4}},
  {n:'Magazyn pod wynajem', d:'30 × 40 m · 1200 m² · 4 moduły z bramami', s:{path:'std',unsure:false,use:'wynajem',w:30,l:40,h:7,cover:'ciepla',gates:4,gate:'4x4',floor:'przem',office:0,windows:0}}
];
var NAMES = {zakres:'Zakres', przeznaczenie:'Przeznaczenie', wymiary:'Wymiary', obudowa:'Obudowa', wyposazenie:'Wyposażenie', lokalizacja:'Lokalizacja', wynik:'Wynik'};
var STAGES = ['Szukam działki','Mam działkę','Mam warunki zabudowy lub plan miejscowy','Mam pozwolenie na budowę'];
var STARTS = ['W ciągu 6 miesięcy','Za 6-12 miesięcy','Później'];
var INIT = {unsure:false, path:'std', use:'magazyn', w:20, l:30, h:7, roof:'dwu', cover:'ciepla', gates:2, gate:'4x4', doors:1, windows:2, sky:false, floor:'beton', office:0, zip:'', stage:'', start:'', sent:false, step:0, err:'', fname:'', fco:'', fphone:'', fmail:'', fnote:'', rodo:false};

function fmt(n){ return Math.round(n).toLocaleString('pl-PL').replace(/\s/g, ' '); }
function tys(n){ return fmt(Math.round(n/10000)*10); }
function mln(n){ var v = Math.round(n/50000)*0.05; return v.toFixed(2).replace(/0$/,'').replace(/\.0$/,'').replace('.',','); }
function money(n){ return n>=995000 ? mln(n)+' mln' : tys(n)+' tys.'; }
function range(a,b){ var big = function(x){ return x>=995000; }; if(big(a)===big(b)) return (big(a) ? mln(a)+' - '+mln(b)+' mln' : tys(a)+' - '+tys(b)+' tys.')+' zł'; return money(a)+' - '+money(b)+' zł'; }
function fmtM(v){ return (Math.round(v*10)/10).toString().replace('.',','); }
function nb(t){ var p; do { p = t; t = t.replace(/(^|[\s(])([aiouwzAIOUWZ])\s+/g, '$1$2 '); } while(t !== p); return t.replace(/(\d)\s+(?=[^\s\d-])/g, '$1 ').replace(/\s+·\s+/g, ' · '); }
function stepsFor(s){ return s.path==='dib' ? ['zakres','przeznaczenie','wymiary','lokalizacja','wynik'] : ['zakres','przeznaczenie','wymiary','obudowa','wyposazenie','lokalizacja','wynik']; }
function locFactor(s){ var m = String(s.zip).match(/^(\d)\d-?\d{3}$/); if(!m) return {f:0, known:false}; var map = {0:0,1:.05,2:.02,3:.05,4:.04,5:.05,6:.04,7:.05,8:.04,9:.02}; return {f:map[m[1]], known:true}; }
function sizeFactor(a){ return a<300?1.15: a<500?1.06: a<1000?1: a<2000?.94:.9; }
function calc(s){
  var area = s.w*s.l, loc = locFactor(s);
  if(s.path==='dib'){ return {area:area, lo:area*2500*(1+loc.f), hi:area*3200*(1+loc.f), per:[2500,3200], loc:loc}; }
  var base = s.cover==='ciepla'?880:680;
  var hf = 1 + (s.h>6 ? (s.h-6)*.04 : (s.h-6)*.02);
  var t = area*base*sizeFactor(area)*hf;
  if(s.floor==='przem') t += area*90;
  t += s.gates*GATE[s.gate].p;
  t += Math.max(0,s.doors-1)*3500;
  t += s.windows*2500;
  if(s.sky) t += area*35;
  t += s.office*2800;
  t *= 1+loc.f;
  return {area:area, lo:t*.92, hi:t*1.12, per:[t*.92/area, t*1.12/area], loc:loc};
}

/* rysunek hali: szczyt i ściana boczna w jednej skali */
function draw(s){
  var W=s.w, L=s.l, H=s.h, two=s.roof==='dwu', rise = two ? W*.08 : W*.1, top = H+rise;
  var VW=560, VH=310, padX=60, padTop=24, gap=56, lab=50, man=3;
  var availW = VW-2*padX, availH = VH-padTop-lab;
  var scRow = Math.min((availW-gap)/(man+W+L), availH/top);
  var mid = 74;
  var scCol = Math.min(availW/Math.max(L, man+W), (availH-mid)/(2*top));
  var stacked = scCol > scRow*1.2;
  var sc = Math.min(stacked ? scCol : scRow, 22);
  var fx, fy, sx, sy;
  if(!stacked){ var tw = (man+W+L)*sc + gap; fx = (VW-tw)/2 + man*sc; sx = fx + W*sc + gap; fy = sy = padTop + (availH - top*sc)/2 + top*sc; }
  else { var th = 2*top*sc + mid; var y0 = padTop + (VH - padTop - lab - th)/2; fx = (VW - (man+W)*sc)/2 + man*sc; fy = y0 + top*sc; sx = (VW - L*sc)/2; sy = fy + mid + top*sc; }
  var P = function(ox,oy){ return function(x,y){ return [+(ox+x*sc).toFixed(1), +(oy-y*sc).toFixed(1)]; }; };
  var F = P(fx,fy), S = P(sx,sy);
  var C = {wall:'#2B2E32', side:'#26282C', roof:'#3A3E43', line:'rgba(255,255,255,.35)', dim:'#FFDA00', txt:'#B9BCC1'};
  var polys=[], lines=[], texts=[], circles=[];
  var poly = function(T, arr, fill, stroke, sw, fo){ polys.push({pts: arr.map(function(p){ return T(p[0],p[1]).join(','); }).join(' '), fill:fill, stroke:stroke||C.line, sw:sw||1.2, fo:fo==null?1:fo}); };
  var line = function(T,a,b,stroke,sw,op){ var p=T(a[0],a[1]), q=T(b[0],b[1]); lines.push({x1:p[0],y1:p[1],x2:q[0],y2:q[1],stroke:stroke,sw:sw||1,op:op==null?1:op}); };
  var rline = function(x1,y1,x2,y2,stroke,sw){ lines.push({x1:+x1.toFixed(1),y1:+y1.toFixed(1),x2:+x2.toFixed(1),y2:+y2.toFixed(1),stroke:stroke,sw:sw||1,op:1}); };
  var txt = function(x,y,t,anchor,size,fill,weight,ls){ texts.push({x:+x.toFixed(1), y:+y.toFixed(1), t:t, anchor:anchor||'middle', size:size||15, fill:fill||C.txt, weight:weight||'500', ls:ls||'0'}); };
  var stepM = Math.max(1, Math.ceil(7/sc));
  line(F,[-man,0],[W+1,0],'rgba(255,255,255,.25)',1.5); line(S,[-1,0],[L+1,0],'rgba(255,255,255,.25)',1.5);
  var front = two ? [[0,0],[W,0],[W,H],[W/2,top],[0,H]] : [[0,0],[W,0],[W,H],[0,top]];
  poly(F, front, C.wall);
  var roofY = function(x){ return two ? (x<=W/2 ? H+rise*(x/(W/2)) : H+rise*((W-x)/(W/2))) : H+rise*(1-x/W); };
  var y, x, i;
  if(s.cover==='ciepla'){ for(y=stepM; y<H; y+=stepM) line(F,[0,y],[W,y],C.line,.8,.5); } else { for(x=stepM; x<W; x+=stepM) line(F,[x,0],[x,roofY(x)],C.line,.8,.5); }
  poly(S, [[0,H],[L,H],[L,top],[0,top]], C.roof);
  poly(S, [[0,0],[L,0],[L,H],[0,H]], C.side);
  if(s.cover==='ciepla'){ for(y=stepM; y<H; y+=stepM) line(S,[0,y],[L,y],C.line,.8,.5); } else { for(x=stepM; x<L; x+=stepM) line(S,[x,0],[x,H],C.line,.8,.5); }
  if(s.sky){ var n = Math.max(2, Math.min(8, Math.round(L/10))); for(i=0;i<n;i++){ var z=L*(i+.5)/n-1.2; poly(S,[[z,top],[z+2.4,top],[z+2.4,top+.35],[z,top+.35]],'#8FB3C9','#B9BCC1',.8,.7); } }
  var g = GATE[s.gate], fit = Math.max(0, Math.floor((W-1)/(g.w+1.5)));
  var onFront = Math.min(s.gates, fit), onSide = s.gates-onFront;
  var gate = function(T,x0){ poly(T, [[x0,0],[x0+g.w,0],[x0+g.w,g.h],[x0,g.h]], '#17181A', C.dim, 1.4); };
  var slot;
  for(i=0;i<onFront;i++){ slot=W/onFront; gate(F, slot*i+(slot-g.w)/2); }
  var sideStart = 3, sideLen = L - sideStart - 1;
  for(i=0;i<onSide;i++){ slot=sideLen/onSide; gate(S, sideStart+slot*i+(slot-g.w)/2); }
  for(i=0;i<s.doors;i++){ var zd=.8+i*1.8; if(zd+1>sideStart && onSide) break; if(zd+1>L) break; poly(S,[[zd,0],[zd+1,0],[zd+1,2.1],[zd,2.1]],'#17181A','#B9BCC1',.9); }
  var wy = Math.min(H-1.6, Math.max(2.8, H*.6));
  for(i=0;i<s.windows;i++){ var zw=L*(i+1)/(s.windows+1)-1; poly(S,[[zw,wy],[zw+2,wy],[zw+2,wy+1.2],[zw,wy+1.2]],'#5D7384','#B9BCC1',.8); }
  var m = F(-1.6,0), hpx = 1.8*sc, msw = Math.max(1,sc*.12);
  circles.push({cx:m[0], cy:+(m[1]-hpx+hpx*.09).toFixed(1), r:+(hpx*.09).toFixed(1), sw:+msw.toFixed(1)});
  rline(m[0], m[1]-hpx*.8, m[0], m[1]-hpx*.42, '#B9BCC1', msw);
  rline(m[0], m[1]-hpx*.42, m[0]-hpx*.12, m[1], '#B9BCC1', msw);
  rline(m[0], m[1]-hpx*.42, m[0]+hpx*.12, m[1], '#B9BCC1', msw);
  rline(m[0]-hpx*.16, m[1]-hpx*.68, m[0]+hpx*.16, m[1]-hpx*.68, '#B9BCC1', msw);
  var dimH = function(T,len){ var a=T(0,0), b=T(len,0), yy=a[1]+14; rline(a[0],yy,b[0],yy,C.dim,1); rline(a[0],yy-4,a[0],yy+4,C.dim,1); rline(b[0],yy-4,b[0],yy+4,C.dim,1); txt((a[0]+b[0])/2, yy+19, fmtM(len)+' m', 'middle', 15, '#FFFFFF', '600'); };
  dimH(F,W); dimH(S,L);
  var a2=S(L,0), b2=S(L,H), xx=a2[0]+12;
  rline(xx,a2[1],xx,b2[1],C.dim,1); rline(xx-4,a2[1],xx+4,a2[1],C.dim,1); rline(xx-4,b2[1],xx+4,b2[1],C.dim,1);
  txt(xx+8, (a2[1]+b2[1])/2+5, fmtM(H)+' m', 'start', 15, '#FFFFFF', '600');
  txt(F(W/2,0)[0], F(0,0)[1]+50, 'SZCZYT','middle',11,'rgba(255,255,255,.45)','600','2');
  txt(S(L/2,0)[0], S(0,0)[1]+50, 'ŚCIANA BOCZNA','middle',11,'rgba(255,255,255,.45)','600','2');
  return {polys:polys, lines:lines, texts:texts, circles:circles};
}

class Component extends DCLogic {
  constructor(p){ super(p); this.state = Object.assign({}, INIT); }
  up(o){ this.setState(o); }
  go(i){ var n = stepsFor(this.state).length; this.setState({step: Math.max(0, Math.min(n-1, i))}); }
  applyUse(id){ var d = (USES.find(function(u){ return u.id===id; })||{}).def || {}; this.setState(Object.assign({use:id, office:0}, d)); }
  dimSet(k, min, max){ var self = this; return function(e){ var v = parseFloat(e.target.value); if(isNaN(v)) return; v = Math.max(min, Math.min(max, v)); var o = {}; o[k] = v; self.setState(o); }; }
  field(k){ var self = this; return function(e){ var o = {}; o[k] = e.target.type==='checkbox' ? e.target.checked : e.target.value; self.setState(o); }; }
  submit(){
    var s = this.state, msg = '';
    if(!s.fname.trim()) msg = 'Wpisz imię i nazwisko.';
    else if(!s.fphone.trim() && !s.fmail.trim()) msg = 'Podaj telefon albo e-mail, żebyśmy mogli wysłać zestawienie.';
    else if(!s.rodo) msg = 'Zaznacz zgodę na przetwarzanie danych.';
    this.setState(msg ? {err: msg} : {err:'', sent:true});
  }
  renderVals(){
    var self = this, s = this.state, list = stepsFor(s), step = Math.min(s.step, list.length-1), key = list[step];
    var r = calc(s), tile = function(on){ return on ? 'kt on' : 'kt'; };
    var lim = {gates:[0,12], doors:[1,6], windows:[0,20]};
    var cnt = function(k, label, sub){ return {label:label, sub:sub, val:s[k], dec:function(){ var o={}; o[k]=Math.max(lim[k][0], s[k]-1); self.setState(o); }, inc:function(){ var o={}; o[k]=Math.min(lim[k][1], s[k]+1); self.setState(o); }, decLabel:'Mniej: '+label, incLabel:'Więcej: '+label}; };
    var idxW = list.indexOf('wymiary');
    var spec = [{k:'Wymiary', v:fmtM(s.w)+' × '+fmtM(s.l)+' × '+fmtM(s.h)+' m'}];
    if(s.path==='std'){
      spec.push({k:'Obudowa', v: s.cover==='ciepla'?'płyta warstwowa':'blacha trapezowa'});
      spec.push({k:'Bramy', v: s.gates ? s.gates+' × '+s.gate.replace('x',' × ')+' m' : 'brak'});
      spec.push({k:'Posadzka', v: s.floor==='przem'?'przemysłowa':'betonowa'});
      if(s.office) spec.push({k:'Zaplecze', v: s.office+' m²'});
    }
    spec.push({k:'Lokalizacja', v: r.loc.known ? (r.loc.f ? '+'+Math.round(r.loc.f*100)+'% strefa i dojazd' : 'bez dopłaty') : 'doliczymy po kodzie'});
    var plural = function(n, a, b, c){ return n===1 ? a : (n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20)) ? b : c; };
    var inA = ['Fundamenty i posadzka '+(s.floor==='przem'?'przemysłowa':'betonowa'), 'Konstrukcja stalowa z projektem wykonawczym', 'Obudowa: '+(s.cover==='ciepla'?'płyta warstwowa':'blacha trapezowa')+', rynny i obróbki', (s.gates ? s.gates+' '+plural(s.gates,'brama','bramy','bram')+' '+s.gate.replace('x',' × ')+' m' : 'Bez bram')+', '+s.doors+' drzwi'+(s.windows ? ', '+s.windows+' '+plural(s.windows,'okno','okna','okien') : ''), s.sky?'Świetliki dachowe':null, s.office?'Zaplecze socjalne '+s.office+' m²':null, 'Transport i montaż'].filter(Boolean);
    var inB = ['Projekt budowlany i pozwolenie','Hala z obudową, bramami i stolarką','Instalacje: elektryczna, wod-kan, ogrzewanie','Stan deweloperski części socjalnej','Nadzór i odbiory'];
    var outA = ['Projekt budowlany i formalności','Przyłącza mediów i instalacje wewnętrzne','Drogi, plac manewrowy, ogrodzenie','VAT'];
    var outB = ['Przyłącza do granicy działki','Drogi, plac, ogrodzenie','Wyposażenie technologiczne','VAT'];
    var d = draw(s);
    var useN = (USES.find(function(u){ return u.id===s.use; })||{}).n;
    return {
      presets: PRESETS.map(function(p){ var t = Object.assign({}, s, p.s); return {n:p.n, d:nb(p.d), price:'od '+money(calc(t).lo)+' zł netto', pick:function(){ self.setState(Object.assign({}, p.s, {sent:false, step:2})); }}; }),
      steps: list.map(function(k, i){ return {label:(i+1)+'. '+NAMES[k], cls: i===step ? 'sn cur' : (i<step ? 'sn done' : 'sn'), cur: i===step ? 'step' : 'false', pick:function(){ self.go(i); }}; }),
      isZakres:key==='zakres', isPrzezn:key==='przeznaczenie', isWym:key==='wymiary', isObud:key==='obudowa', isWypos:key==='wyposazenie', isLok:key==='lokalizacja', isWynik:key==='wynik', notWynik:key!=='wynik',
      paths:[
        {cls:tile(s.path==='std' && !s.unsure), on:s.path==='std' && !s.unsure ? 'true':'false', b:'Hala w standardzie', d:nb('Fundamenty, posadzka, konstrukcja, obudowa, bramy i stolarka'), i:nb('6 kroków, ok. 2 min · widełki ceny od razu'), pick:function(){ self.setState({unsure:false, path:'std'}); }},
        {cls:tile(s.path==='dib'), on:s.path==='dib' ? 'true':'false', b:'Zaprojektuj i wybuduj', d:nb('Stan deweloperski z instalacjami i projektem'), i:nb('4 kroki · kwota orientacyjna i rozmowa'), pick:function(){ self.setState({unsure:false, path:'dib'}); }},
        {cls:tile(s.unsure), on:s.unsure ? 'true':'false', b:'Nie wiem', d:nb('Policzymy halę w standardzie, a doradca podpowie resztę'), i:nb('jak hala w standardzie'), pick:function(){ self.setState({unsure:true, path:'std'}); }}
      ],
      uses: USES.map(function(u){ return {cls:tile(s.use===u.id), on:s.use===u.id ? 'true':'false', b:u.n, d:nb(u.d), pick:function(){ self.applyUse(u.id); }}; }),
      sizes: [[15,20],[20,25],[20,40],[25,40]].map(function(x){ var on = s.w===x[0] && s.l===x[1]; return {cls: on ? 'ch on':'ch', on: on?'true':'false', label: (x[0]*x[1])+' m²', pick:function(){ self.setState({w:x[0], l:x[1]}); }}; }),
      w:s.w, l:s.l, h:s.h, onW:this.dimSet('w',8,40), onL:this.dimSet('l',10,120), onH:this.dimSet('h',4,12),
      area: fmt(s.w*s.l)+' m²', small: s.w*s.l < 200,
      roofs: [{cls:tile(s.roof==='dwu'), on:s.roof==='dwu'?'true':'false', b:'Dwuspadowy', d:nb('Najczęstszy, kalenica na środku'), pick:function(){ self.setState({roof:'dwu'}); }},
              {cls:tile(s.roof==='jedno'), on:s.roof==='jedno'?'true':'false', b:'Jednospadowy', d:nb('Spadek na jedną stronę, np. przy granicy działki'), pick:function(){ self.setState({roof:'jedno'}); }}],
      covers: [{cls:tile(s.cover==='ciepla'), on:s.cover==='ciepla'?'true':'false', b:'Ciepła', d:nb('Płyta warstwowa z izolacją. Magazyn, warsztat, produkcja, praca przez cały rok'), i:'ok. 880 zł/m²', pick:function(){ self.setState({cover:'ciepla'}); }},
               {cls:tile(s.cover==='zimna'), on:s.cover==='zimna'?'true':'false', b:'Zimna', d:nb('Blacha trapezowa bez izolacji. Maszyny, płody rolne, materiały'), i:'ok. 680 zł/m²', pick:function(){ self.setState({cover:'zimna'}); }}],
      cGates: cnt('gates','Bramy segmentowe','z napędem elektrycznym'), cDoors: cnt('doors','Drzwi stalowe','jedne w cenie'), cWin: cnt('windows','Okna','na ścianach bocznych'),
      gateSizes: Object.keys(GATE).map(function(k){ var on = s.gate===k; return {cls: on?'ch on':'ch', on: on?'true':'false', label:k.replace('x',' × ')+' m', pick:function(){ self.setState({gate:k}); }}; }),
      sky: s.sky, onSky: this.field('sky'),
      floors: [{cls:tile(s.floor==='beton'), on:s.floor==='beton'?'true':'false', b:'Betonowa', d:nb('Wystarczy do magazynu i maszyn rolniczych'), i:'w cenie', pick:function(){ self.setState({floor:'beton'}); }},
               {cls:tile(s.floor==='przem'), on:s.floor==='przem'?'true':'false', b:'Przemysłowa', d:nb('Zbrojona, zacierana, pod wózki i ciężki sprzęt'), i:'+90 zł/m²', pick:function(){ self.setState({floor:'przem'}); }}],
      office: s.office, officeVal: s.office ? s.office+' m²' : 'bez zaplecza', onOffice: function(e){ self.setState({office: +e.target.value}); },
      zip: s.zip, onZip: function(e){ self.setState({zip: e.target.value.trim()}); },
      stages: STAGES.map(function(t){ return {t:nb(t), on: s.stage===t, pick:function(){ self.setState({stage:t}); }}; }),
      starts: STARTS.map(function(t){ var on = s.start===t; return {cls: on?'ch on':'ch', on: on?'true':'false', label:nb(t), pick:function(){ self.setState({start:t}); }}; }),
      showEst: step >= idxW, notShowEst: step < idxW, estLabel: s.path==='dib' ? 'Orientacyjnie, zaprojektuj i wybuduj' : 'Szacunek netto',
      amount: range(r.lo, r.hi), per: fmt(r.per[0])+' - '+fmt(r.per[1])+' zł/m² · '+fmt(r.area)+' m²', spec: spec,
      bigAmount: range(r.lo, r.hi)+' netto', bigLead: fmt(r.area)+' m² · '+fmt(r.per[0])+' - '+fmt(r.per[1])+' zł/m² · '+(s.path==='dib' ? 'zaprojektuj i wybuduj, kwota orientacyjna' : 'szacunek na podstawie Twoich wyborów'),
      noZip: !r.loc.known,
      inList: (s.path==='dib' ? inB : inA).map(function(x){ return {t:nb(x)}; }), outList: (s.path==='dib' ? outB : outA).map(function(x){ return {t:nb(x)}; }),
      sendTitle: s.path==='dib' ? 'Umów rozmowę z doradcą' : 'Wyślij konfigurację do doradcy',
      sendLead: nb(s.path==='dib' ? 'Omówimy zakres i przygotujemy ofertę.' : 'Dostaniesz zestawienie na e-mail, a doradca zadzwoni, żeby doprecyzować szczegóły.'),
      sendBtn: s.path==='dib' ? 'Umów rozmowę' : 'Wyślij zestawienie',
      sent: s.sent, notSent: !s.sent, err: s.err, hasErr: !!s.err,
      fname:s.fname, fco:s.fco, fphone:s.fphone, fmail:s.fmail, fnote:s.fnote, rodo:s.rodo,
      onName:this.field('fname'), onCo:this.field('fco'), onPhone:this.field('fphone'), onMail:this.field('fmail'), onNote:this.field('fnote'), onRodo:this.field('rodo'),
      onSubmit: function(){ self.submit(); },
      canBack: step > 0, noBack: step === 0, back: function(){ self.go(step-1); }, next: function(){ self.go(step+1); },
      nextLabel: list[step+1]==='wynik' ? 'Pokaż wynik' : 'Dalej',
      stepNo: 'Krok '+(step+1)+' z '+list.length,
      polys: d.polys, lines: d.lines, texts: d.texts, circles: d.circles,
      capUse: useN + (s.path==='dib' ? ' · zaprojektuj i wybuduj' : ' · '+(s.cover==='ciepla' ? 'hala ciepła' : 'hala zimna')),
      capArea: fmt(s.w*s.l)+' m²'
    };
  }
}
