'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const R=a=>a[Math.random()*a.length|0],shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const AV=['🦊','🐼','🐸','🦄','🐙','🦁','🐵','🐧','🐲','🤖'];
const EM=['🍎','🚗','🐶','⭐','🎈','🍕','🚀','🌵','🎸','🐱','⚽','🍩'];
const T_PLAY=18000,T_REV=6000,T_ALL=T_PLAY+T_REV,T_CD=3000,SHOW=5000;
let db,uid,off=0,code=null,room=null,av=AV[0],mode='j',snd=true,refs=[],lastKey='',locked=false,curI=-1,ac;

function beep(f=600,d=.12){if(!snd)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2600)}
function float(t){const e=document.createElement('div');e.className='float';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),1200)}
const show=id=>$$('.screen').forEach(s=>s.hidden=s.id!==id);

/* ---------- Generación de rondas (la hace el anfitrión al iniciar) ---------- */
const TR=[['¿Capital de Francia?','París','Roma','Madrid','Berlín'],['¿Cuántos continentes hay?','7','5','6','8'],['¿Planeta más grande del sistema solar?','Júpiter','Saturno','Marte','Tierra'],['¿Quién pintó la Mona Lisa?','Leonardo da Vinci','Picasso','Van Gogh','Dalí'],['¿Cuál es el océano más grande?','Pacífico','Atlántico','Índico','Ártico'],['¿Río más caudaloso de Sudamérica?','Amazonas','Orinoco','Paraná','Magdalena'],['¿Cuántos huesos tiene un adulto?','206','150','300','180'],['¿Sede de gobierno de Bolivia?','La Paz','Lima','Quito','Santiago']];
const WD=[['elefante','Animal terrestre muy grande','Tiene trompa','Empieza con E'],['guitarra','Instrumento musical','Tiene seis cuerdas','Empieza con G'],['volcan','Montaña que puede escupir fuego','Expulsa lava','Empieza con V'],['chocolate','Dulce muy popular','Se hace con cacao','Empieza con C'],['bicicleta','Medio de transporte','Tiene dos ruedas y pedales','Empieza con B'],['luna','Se ve en el cielo de noche','Da vueltas alrededor de la Tierra','Empieza con L']];
const TF=[['El sol es una estrella','Verdadero'],['Los pulpos tienen tres corazones','Verdadero'],['Una araña es un insecto','Falso'],['La Gran Muralla China se ve a simple vista desde la Luna','Falso'],['El agua hierve a 100 °C al nivel del mar','Verdadero'],['Los murciélagos son ciegos','Falso']];
const OD=[['Manzana','Pera','Uva','Zapato'],['Rojo','Azul','Verde','Lunes'],['Guitarra','Piano','Violín','Martillo'],['París','Lima','Tokio','Brasil'],['Perro','Gato','Caballo','Mesa']];
const OR=[['Ordena los planetas desde el más cercano al Sol',['Mercurio','Venus','Tierra','Marte']],['Ordena el ciclo de la mariposa',['Huevo','Oruga','Crisálida','Mariposa']],['Ordena los días de la semana',['Lunes','Martes','Miércoles','Jueves']]];
function makeRounds(){
  const t=R(TR),w=R(WD),f=R(TF),od=R(OD),or=R(OR),A=Array.from({length:9},()=>R(EM)),k=Math.random()*9|0,B=[...A];
  B[k]=R(EM.filter(e=>e!==A[k]));
  const ms=shuf(EM),sh=ms.slice(0,4),x=R(sh),n=shuf([...Array(30).keys()].map(v=>v+1)).slice(0,4).sort((a,b)=>a-b);
  const nm=R([or,['Ordena los números de menor a mayor',n.map(String)]]);
  const a1=2+Math.random()*10|0,b1=2+Math.random()*10|0,op=R(['×','+','−']),fn=shuf([4,7,9,12,15,18]).slice(0,3);
  return [
    {t:'mem',title:'1. Memoria rápida',ins:'Memoriza los 4 símbolos (5 s). Luego elige cuál apareció.',show:sh,q:'¿Cuál de estos apareció?',o:shuf([x,...ms.slice(4,7)]),a:x},
    {t:'word',title:'2. Adivina la palabra',ins:'Escribe la palabra. Se revelan más pistas con el tiempo.',q:'¿Qué palabra es?',h:w.slice(1),a:w[0]},
    {t:'trivia',title:'3. Preguntas relámpago',ins:'Elige la respuesta correcta antes de que se acabe el tiempo.',q:t[0],o:shuf(t.slice(1)),a:t[1]},
    {t:'diff',title:'4. Encuentra las diferencias',ins:'Un símbolo de la cuadrícula de abajo es distinto al de arriba. Tócalo.',A,B,a:String(k)},
    {t:'math',title:'5. Velocidad mental',ins:'Resuelve la operación y escribe el resultado.',q:`${a1} ${op} ${b1} = ?`,a:String(op==='×'?a1*b1:op==='+'?a1+b1:a1-b1)},
    {t:'order',title:'7. Orden correcto',ins:'Toca los elementos en el orden correcto.',q:nm[0],o:shuf(nm[1]),a:nm[1].join('|')},
    {t:'tf',title:'8. Verdadero o falso',ins:'¿La afirmación es verdadera o falsa?',q:f[0],o:['Verdadero','Falso'],a:f[1]},
    {t:'odd',title:'9. Encuentra el intruso',ins:'Toca el elemento que no pertenece al grupo.',q:'¿Cuál es el intruso?',o:shuf(od),a:od[3]},
    {t:'final',title:'10. Desafío final (x2)',ins:'Memoria + cálculo: memoriza los números (5 s) y escribe cuánto suman. Vale doble.',show:fn.map(String),q:'¿Cuánto suman los números?',a:String(fn.reduce((s,v)=>s+v,0))}
  ];
}

/* ---------- Conexión, salas y jugadores ---------- */
function init(){
  const ok=typeof firebaseConfig!=='undefined'&&!/^TU_/.test(firebaseConfig.apiKey);
  $('#warn').hidden=ok;
  $('#avs').innerHTML=AV.map((a,i)=>`<button data-av="${a}" class="${i?'':'on'}">${a}</button>`).join('');
  $('#iName').value=localStorage.ttName||'';
  $('#avs').onclick=e=>{const b=e.target.closest('button');if(!b)return;av=b.dataset.av;$$('#avs button').forEach(x=>x.classList.toggle('on',x===b))};
  $$('[data-go]').forEach(b=>b.onclick=()=>{const g=b.dataset.go;if(g==='home')return show('home');mode=g;show('join');$(g==='c'?'#iName':'#iCode').focus()});
  $('#bTheme').onclick=()=>{const d=document.documentElement;d.dataset.theme=d.dataset.theme==='dark'?'light':'dark';localStorage.ttTheme=d.dataset.theme};
  $('#bSound').onclick=()=>{snd=!snd;$('#bSound').textContent=snd?'🔊':'🔇';beep()};
  if(localStorage.ttTheme)document.documentElement.dataset.theme=localStorage.ttTheme;
  $('#bCreate').onclick=create;$('#bJoin').onclick=()=>enter($('#iCode').value);
  $('#bLeave').onclick=$('#bMenu').onclick=leave;
  $('#bCopy').onclick=async()=>{try{await navigator.clipboard.writeText(code);toast('Código copiado: '+code)}catch(e){toast('Código: '+code)}};
  $('#bStart').onclick=start;
  $('#bAgain').onclick=()=>db.ref(`rooms/${code}/meta`).update({state:'lobby'});
  if(!ok)return;
  firebase.initializeApp(firebaseConfig);db=firebase.database();
  db.ref('.info/serverTimeOffset').on('value',s=>off=s.val()||0);
  firebase.auth().onAuthStateChanged(u=>{if(!u)return;uid=u.uid;if(localStorage.ttCode&&!code)enter(localStorage.ttCode,true)});
  firebase.auth().signInAnonymously().catch(e=>toast('Error de acceso: '+e.message));
  setInterval(tick,250);
}
const myName=()=>{const n=$('#iName').value.trim().slice(0,14);if(!n)toast('Escribe tu nombre');else localStorage.ttName=n;return n};

async function create(){
  if(!uid)return toast('Conectando… intenta de nuevo');
  if(!myName())return;
  for(let k=0;k<6;k++){
    const c=Array.from({length:6},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.random()*32|0]).join('');
    try{
      const r=await db.ref(`rooms/${c}/meta`).transaction(v=>v?undefined:{host:uid,state:'lobby',game:0,created:firebase.database.ServerValue.TIMESTAMP});
      if(r.committed)return enter(c);
    }catch(e){return toast('No se pudo crear la sala: '+e.message)}
  }
  toast('Intenta de nuevo');
}

async function enter(c,silent){
  if(!uid)return toast('Conectando… intenta de nuevo');
  c=c.toUpperCase().trim();
  if(c.length!==6)return toast('El código tiene 6 caracteres');
  const name=silent?null:myName();if(!silent&&!name)return;
  try{
    const m=(await db.ref(`rooms/${c}/meta`).once('value')).val();
    if(!m){if(silent)localStorage.removeItem('ttCode');return toast('Esa sala no existe')}
    const pr=db.ref(`rooms/${c}/players/${uid}`),ex=(await pr.once('value')).exists();
    if(!ex){
      if(silent)return;
      if(m.state!=='lobby')return toast('La partida ya empezó');
      if((await db.ref(`rooms/${c}/players`).once('value')).numChildren()>=10)return toast('Sala llena (10/10)');
      await pr.set({name,av,online:true,joined:firebase.database.ServerValue.TIMESTAMP});
    }else if(!silent)await pr.update({name,av});
    sub(c);
  }catch(e){toast('No se pudo entrar: '+e.message)}
}

function sub(c){
  code=c;localStorage.ttCode=c;room={meta:null,players:{},rounds:null,scores:{},answers:{}};lastKey='';curI=-1;
  const on=(p,fn)=>{const r=db.ref(`rooms/${c}/${p}`);r.on('value',s=>{fn(s.val());route()});refs.push(r)};
  on('meta',v=>{if(!v&&room.meta)return leave(true);room.meta=v});
  on('players',v=>{v=v||{};if(room.seen)notify(room.players,v);room.seen=1;room.players=v});
  on('rounds',v=>room.rounds=v);on('scores',v=>room.scores=v||{});on('answers',v=>room.answers=v||{});
  const pr=db.ref(`rooms/${c}/players/${uid}/online`),cn=db.ref('.info/connected');
  cn.on('value',s=>{if(s.val()){pr.onDisconnect().set(false);pr.set(true)}});refs.push(cn);
  $('#lCode').textContent=c;
}
function notify(a,b){
  for(const u in b){if(!a[u])toast(`${b[u].av} ${b[u].name} entró`);else if(a[u].online!==false&&b[u].online===false)toast(`${b[u].name} se desconectó`);else if(a[u].online===false&&b[u].online!==false)toast(`${b[u].name} volvió`)}
  for(const u in a)if(!b[u])toast(`${a[u].name} salió`);
}
async function leave(forced){
  if(!code)return show('home');
  const c=code,rm=room;refs.forEach(r=>r.off());refs=[];code=null;room=null;localStorage.removeItem('ttCode');
  show('home');
  if(forced===true)return toast('La sala ya no existe');
  try{
    const pr=db.ref(`rooms/${c}/players/${uid}`);pr.child('online').onDisconnect().cancel();
    if(rm&&rm.meta&&rm.meta.host===uid){const o=Object.keys(rm.players).find(u=>u!==uid);if(o)await db.ref(`rooms/${c}/meta/host`).set(o)}
    await pr.remove();
  }catch(e){}
}
async function start(){
  const n=Object.keys(room.players).length;
  if(n<2)return toast('Necesitas al menos 2 jugadores');
  try{await db.ref(`rooms/${code}`).update({rounds:makeRounds(),'meta/state':'playing','meta/game':(room.meta.game||0)+1,'meta/startAt':firebase.database.ServerValue.TIMESTAMP})}
  catch(e){toast('No se pudo iniciar: '+e.message)}
}

/* ---------- Vistas ---------- */
function route(){
  const m=room&&room.meta;if(!m)return;
  if(m.state==='lobby'){lastKey='';curI=-1;show('lobby');renderLobby()}else tick();
}
function renderLobby(){
  const L=Object.entries(room.players).sort((a,b)=>(a[1].joined||0)-(b[1].joined||0)),host=room.meta.host===uid;
  $('#lSlots').innerHTML=Array.from({length:10},(_,i)=>{const e=L[i];return e?`<div class="slot"><b>${e[1].av}</b><span>${esc(e[1].name)}${e[0]===room.meta.host?' 👑':''}${e[1].online===false?' 💤':''}</span></div>`:'<div class="slot free"><span>Libre</span></div>'}).join('');
  $('#lInfo').textContent=host?`Jugadores: ${L.length}/10 · comparte el código ${code}`:'Esperando a que el anfitrión inicie la partida…';
  $('#bStart').hidden=!host;$('#bStart').disabled=L.length<2;
}
const myAns=i=>((room.answers[room.meta.game]||{})[i]||{})[uid];
function rank(el,i){
  const g=room.meta.game,S=room.scores[g]||{},A=(room.answers[g]||{})[i]||{};
  const L=Object.entries(room.players).map(([u,p])=>({u,p,s:S[u]||0,d:(A[u]||{}).pts||0})).sort((a,b)=>b.s-a.s);
  el.innerHTML=L.map((x,k)=>`<li class="${x.u===uid?'me':''}"><span>${k+1}</span><span>${x.p.av} ${esc(x.p.name)}${x.p.online===false?' 💤':''}</span><b>${x.s}</b>${x.d?`<em>+${x.d}</em>`:'<span></span>'}</li>`).join('');
  return L;
}
function tick(){
  const m=room&&room.meta;if(!m||m.state!=='playing'||!room.rounds||!m.startAt)return;
  const rs=room.rounds,e=Date.now()+off-m.startAt-T_CD;
  if(e<0){show('game');$('#gRound').textContent='';$('#gTitle').textContent='¡Prepárate!';$('#gTime').textContent='';$('#gIns').textContent='La partida está por comenzar…';$('#gBody').innerHTML=`<div class="cd">${Math.ceil(-e/1000)}</div>`;$('#gPart').innerHTML='';return}
  const i=Math.floor(e/T_ALL),r=e%T_ALL;
  if(i>=rs.length){show('results');const L=rank($('#rList'),-1);renderResults(L);return}
  const q=rs[i];
  if(r<T_PLAY){
    show('game');
    const key=m.game+':'+i+(q.show?(r<SHOW?'s':'q'):'');
    if(key!==lastKey){lastKey=key;if(i!==curI){curI=i;locked=!!myAns(i);beep(520,.1)}draw(q,i,r)}
    if(!locked&&q.t==='word')$('#hints').innerHTML=q.h.slice(0,1+(r>=6000)+(r>=12000)).map(h=>`<div class="card">💡 ${esc(h)}</div>`).join('');
    $('#gBar').style.width=(100-r/T_PLAY*100)+'%';$('#gTime').textContent=Math.ceil((T_PLAY-r)/1000)+'s';
    if(locked&&lastKey===key&&!$('#gBody').dataset.done&&myAns(i)){draw(q,i,r)}
    const A=(room.answers[m.game]||{})[i]||{};
    $('#gPart').innerHTML=Object.entries(room.players).map(([u,p])=>`<span class="chip ${A[u]?'on':''}">${p.av} ${esc(p.name)}${A[u]?' ✔':''}</span>`).join('');
  }else{
    show('board');lastKey='b';
    $('#bTitle').textContent=`Clasificación · ronda ${i+1}/${rs.length}`;
    $('#bAns').textContent='Respuesta correcta: '+(q.t==='order'?q.a.split('|').join(' → '):q.t==='diff'?'la celda '+(+q.a+1):q.a);
    rank($('#bList'),i);
    $('#bNext').textContent=i+1<rs.length?`Siguiente ronda en ${Math.ceil((T_ALL-r)/1000)}s`:`Resultados finales en ${Math.ceil((T_ALL-r)/1000)}s`;
  }
}
function renderResults(L){
  if(!L.length)return;
  $('#rWin').textContent=`🏆 ¡Ganó ${L[0].p.name}!`;
  const slot=(x,k)=>x?`<div style="height:${[150,110,80][k]+20}px"><b>${['🥇','🥈','🥉'][k]}</b>${x.p.av}<br>${esc(x.p.name)}<br>${x.s} pts</div>`:'';
  $('#podium').innerHTML=slot(L[1],1)+slot(L[0],0)+slot(L[2],2);
  const host=room.meta.host===uid;
  $('#bAgain').disabled=!host;$('#bAgain').textContent=host?'🔁 VOLVER A JUGAR':'Esperando al anfitrión…';
  if(lastKey!=='end'){lastKey='end';beep(880,.4)}
}

/* ---------- Dibujo de cada minijuego ---------- */
function draw(q,i,r){
  $('#gRound').textContent=`${i+1}/${room.rounds.length}`;$('#gTitle').textContent=q.title;$('#gIns').textContent=q.ins;
  const b=$('#gBody');b.dataset.done='';
  if(locked){const a=myAns(i);b.innerHTML=a?`<div class="card" style="text-align:center;font-size:1.3rem">${a.ok?'✅ ¡Correcto! +'+a.pts:'❌ Respuesta incorrecta'}<br><small>Esperando al resto…</small></div>`:'<div class="card">Enviando…</div>';if(a)b.dataset.done='1';return}
  if(q.show&&r<SHOW){b.innerHTML=`<div class="show">${q.show.map(esc).join(' ')}</div><p style="text-align:center">¡Memoriza!</p>`;return}
  const t=q.t;
  if(t==='diff'){
    b.innerHTML=`<div class="grid">${q.A.map(esc).map(c=>`<div>${c}</div>`).join('')}</div><div class="grid">${q.B.map((c,k)=>`<button data-a="${k}">${esc(c)}</button>`).join('')}</div>`;
    b.querySelectorAll('button').forEach(x=>x.onclick=()=>submit(x.dataset.a));
  }else if(t==='order'){
    const pk=[];
    b.innerHTML=`<h3>${esc(q.q)}</h3><div class="opts">${q.o.map(o=>`<button class="opt" data-a="${esc(o)}">${esc(o)}</button>`).join('')}</div><p id="pk" style="text-align:center"></p><button class="ghost" id="rs">↺ Reiniciar</button>`;
    b.querySelectorAll('.opt').forEach(x=>x.onclick=()=>{x.disabled=true;pk.push(x.dataset.a);$('#pk').textContent=pk.join(' → ');if(pk.length===q.o.length)submit(pk.join('|'))});
    $('#rs').onclick=()=>{pk.length=0;$('#pk').textContent='';b.querySelectorAll('.opt').forEach(x=>x.disabled=false)};
  }else if(q.o){
    b.innerHTML=`<h3>${esc(q.q)}</h3><div class="opts">${q.o.map(o=>`<button class="opt" data-a="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    b.querySelectorAll('.opt').forEach(x=>x.onclick=()=>submit(x.dataset.a));
  }else{
    b.innerHTML=`<h3>${esc(q.q)}</h3><div id="hints"></div><input id="ans" autocomplete="off" ${t==='word'?'':'inputmode="numeric"'} placeholder="Tu respuesta"><button class="big" id="send">ENVIAR</button>`;
    const go=()=>{const v=$('#ans').value;if(v.trim())submit(v)};
    $('#send').onclick=go;$('#ans').onkeydown=e=>{if(e.key==='Enter')go()};$('#ans').focus();
  }
}
async function submit(ans){
  if(locked)return;locked=true;
  const i=curI,m=room.meta,q=room.rounds[i],g=m.game,r=Date.now()+off-m.startAt-T_CD-i*T_ALL;
  if(r>T_PLAY+500){locked=false;return}
  const ok=norm(ans)===norm(q.a),pts=ok?Math.round((100+100*Math.max(0,1-r/T_PLAY))*(q.t==='final'?2:1)):0;
  try{
    await db.ref(`rooms/${code}/answers/${g}/${i}/${uid}`).set({ok,pts});
    if(pts)await db.ref(`rooms/${code}/scores/${g}/${uid}`).transaction(v=>(v||0)+pts);
    beep(ok?880:200,.2);if(ok)float('+'+pts);
  }catch(e){toast('No se pudo enviar la respuesta')}
  lastKey='';
}
init();
