const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let DB={users:{},cur:null,shorts:[],servers:[],leagues:[],clans:[]};
try{DB=Object.assign(DB,JSON.parse(localStorage.getItem('major')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('major',JSON.stringify(DB))}catch(e){}},hs=s=>{let x=5381;for(const c of s)x=(x*33^c.charCodeAt(0))>>>0;return x.toString(36)},me=()=>DB.users[DB.cur];
let V=DB.cur?'home':'login',T={},G=null,R=0;const go=v=>{V=v;T.m=0;render()};
/* validation */
const BAD=['fuck','shit','bitch','dick','cunt','slut','whore','porn','nigg','bastard','asshole'],bad=s=>{const t=s.toLowerCase().replace(/[^a-z]/g,'');return BAD.some(w=>t.includes(w))};
const vName=n=>n.length<3||n.length>19?'Name must be 3–19 characters':bad(n)?'No bad words in name':'';
const vUser=u=>!/^[a-z0-9_]{6,19}$/i.test(u)?'Username: 6–19 letters, numbers or _':bad(u)?'No bad words in username':DB.users[u.toLowerCase()]?'Username taken':'';
const vPw=p=>p.length<9||p.length>29?'Password must be 9–29 characters':'';
/* engine */
const ok=(c,r)=>r>=0&&r<9&&c>=0&&c<11&&Math.abs(c-5)<=Math.min(5,2+Math.min(r,8-r)),VAL={S:1,C:3,M:5,G:6,K:0};
const D8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],OR=D8.slice(0,4),DG=D8.slice(4);
function newB(){const b=Array.from({length:9},()=>Array(11).fill(null)),bk='MGKGM';[['w',0,1],['b',8,7]].forEach(([c,r,s])=>{for(let i=0;i<5;i++){b[r][3+i]={t:bk[i],c};b[s][3+i]={t:'S',c}}b[s][2]={t:'C',c};b[s][8]={t:'C',c}});return b}
function mv(b,c,r){const p=b[r][c],o=[];const add=(x,y,only)=>{if(!ok(x,y))return 0;const q=b[y][x];if(q&&q.c==p.c)return 0;if(only&&!q)return 0;o.push({x,y,only});return q?0:1};
const sl=ds=>ds.forEach(([dx,dy])=>{let x=c+dx,y=r+dy;while(add(x,y)){x+=dx;y+=dy}}),st=(ds,k)=>ds.forEach(([dx,dy])=>add(c+dx,r+dy,k));
({K:()=>st(D8),M:()=>{sl(DG);st(OR)},G:()=>{sl(OR);st(DG)},C:()=>[[0,2],[0,-2],[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([dx,dy])=>add(c+dx,r+dy)),S:()=>{st(OR);st(DG,1)}})[p.t]();return o}
function atk(b,x,y,by){for(let r=0;r<9;r++)for(let c=0;c<11;c++){const p=b[r][c];if(p&&p.c==by&&mv(b,c,r).some(m=>m.x==x&&m.y==y))return 1}return 0}
function chk(b,col){for(let r=0;r<9;r++)for(let c=0;c<11;c++){const p=b[r][c];if(p&&p.t=='K'&&p.c==col)return atk(b,c,r,col=='w'?'b':'w')}return 0}
function legalP(b,c,r){const p=b[r][c];return mv(b,c,r).filter(m=>{const q=b[m.y][m.x];b[m.y][m.x]=p;b[r][c]=null;const k=chk(b,p.c);b[r][c]=p;b[m.y][m.x]=q;return!k})}
const all=(b,col)=>{const o=[];for(let r=0;r<9;r++)for(let c=0;c<11;c++){const p=b[r][c];if(p&&p.c==col)legalP(b,c,r).forEach(m=>o.push({...m,c,r}))}return o};
/* game */
function play(bot){T.pm=0;G={b:newB(),turn:'w',lost:{w:[],b:[]},pr:{w:{a:0,b:0},b:{a:0,b:0}},st:{w:0,b:0},t:20,bot,sel:null,mvs:[],over:0,pause:0};go('game')}
function cl(x,y){if(!G)return;if(G.rm){const q=G.b[y][x];if(q&&q.c=='b'&&q.t!='K'){G.b[y][x]=null;G.lost.b.push(q.t);G.pr.w.b=1;const d=G.rm;G.rm=0;d()}return}
if(G.over||G.pause||G.turn!='w')return;const q=G.b[y][x],m=G.mvs.find(m=>m.x==x&&m.y==y);
if(m)return doMove({...m,c:G.sel[0],r:G.sel[1]});if(q&&q.c=='w'){G.sel=[x,y];G.mvs=legalP(G.b,x,y)}else{G.sel=null;G.mvs=[]}render()}
function doMove(m){const b=G.b,p=b[m.r][m.c],q=b[m.y][m.x];if(q)G.lost[q.c].push(q.t);b[m.y][m.x]=p;b[m.r][m.c]=null;G.sel=null;G.mvs=[];
(p.t=='S'&&(p.c=='w'?m.y==8:m.y==0))?promo(p.c,m.x,m.y,fin):fin()}
function promo(c,x,y,done){const P=G.pr[c],ls=[...new Set(G.lost[c].filter(t=>t!='K'))],o=c=='w'?'b':'w',en=G.b.flat().some(p=>p&&p.c==o&&p.t!='K'),A=!P.a&&ls.length,B=!P.b&&en;if(!A&&!B)return done();
if(c=='b'){if(A){const t=ls.sort((a,b)=>VAL[b]-VAL[a])[0];G.b[y][x]={t,c};G.lost.b.splice(G.lost.b.indexOf(t),1);P.a=1}else{let bx,bs=-1;for(let r=0;r<9;r++)for(let k=0;k<11;k++){const p=G.b[r][k];if(p&&p.c=='w'&&p.t!='K'&&VAL[p.t]>bs){bs=VAL[p.t];bx=[k,r]}}G.lost.w.push(G.b[bx[1]][bx[0]].t);G.b[bx[1]][bx[0]]=null;P.b=1}return done()}
G.pause=1;G.pm={A:A?ls:0,B,x,y,done};render()}
function pmA(t){const{x,y,done}=G.pm;G.b[y][x]={t,c:'w'};G.lost.w.splice(G.lost.w.indexOf(t),1);G.pr.w.a=1;G.pm=0;done()}
function pmB(){G.rm=G.pm.done;G.pm=0;render()}function pmS(){const d=G.pm.done;G.pm=0;d()}
function fin(){G.pause=0;const o=G.turn=='w'?'b':'w',win=o=='w'?'Black':'White';G.turn=o;G.t=20;
if(G.b.flat().every(p=>!p||p.t=='K'))G.over='Draw: only Kings left';else if(!all(G.b,o).length)G.over=chk(G.b,o)?`Checkmate! ${win} wins`:`Stalemate: ${win} wins (stalemate is a loss)`;
render();nextBot()}
const nextBot=()=>{if(G&&!G.over&&G.turn=='b'&&G.bot)setTimeout(botMove,700)};
function botMove(){if(!G||G.over||G.turn!='b'||G.pause)return;const b=G.b;let best,bs=-1e9;all(b,'b').forEach(m=>{const p=b[m.r][m.c],q=b[m.y][m.x];b[m.y][m.x]=p;b[m.r][m.c]=null;let s=(q?VAL[q.t]*10:0)+Math.random()*3;if(atk(b,m.x,m.y,'w'))s-=VAL[p.t]*8;if(chk(b,'w'))s+=3+(all(b,'w').length?0:1000);if(p.t=='S')s+=(8-m.y)*.3+(m.y==0?6:0);b[m.r][m.c]=p;b[m.y][m.x]=q;if(s>bs){bs=s;best=m}});if(best)doMove(best)}
setInterval(()=>{if(V=='queue')return render();if(V!='game'||!G||G.over||G.pause||G.rm)return;G.t--;if(G.t<=0){const c=G.turn;G.st[c]++;if(G.st[c]>=3)G.over=`${c=='w'?'Black':'White'} wins: opponent timed out 3 times`;else{G.turn=c=='w'?'b':'w';G.t=20;G.sel=null;G.mvs=[];nextBot()}render()}else{const e=$('#tm');if(e)e.textContent=G.t}},1000);
/* media */
function drawB(cv){const x=cv.getContext('2d'),s=60,b=G?G.b:newB();cv.width=660;cv.height=540;x.fillStyle='#222';x.fillRect(0,0,660,540);x.textAlign='center';x.textBaseline='middle';x.font='bold 24px sans-serif';
for(let r=0;r<9;r++)for(let c=0;c<11;c++)if(ok(c,r)){const X=c*s,Y=(8-r)*s,p=b[r][c];x.fillStyle=(c+r)%2?'#a68b5b':'#eadfc8';x.fillRect(X,Y,s,s);if(p){x.fillStyle=p.c=='w'?'#f4a6c0':'#7b4fb0';x.beginPath();x.arc(X+30,Y+30,24,0,7);x.fill();x.fillStyle=p.c=='w'?'#400':'#fff';x.fillText(p.t,X+30,Y+31)}}}
function addM(type,src){me().media.unshift({id:Date.now(),type,src});save();alert('Saved to Photo App')}
function shot(){const cv=document.createElement('canvas');drawB(cv);addM('img',cv.toDataURL('image/jpeg',.8));T.m=0;render()}
function rec(){if(R){R.stop();return}try{const cv=document.createElement('canvas'),iv=setInterval(()=>drawB(cv),100);drawB(cv);const mr=new MediaRecorder(cv.captureStream(10)),ch=[];mr.ondataavailable=e=>ch.push(e.data);mr.onstop=()=>{clearInterval(iv);R=0;const f=new FileReader;f.onload=()=>{addM('vid',f.result);render()};f.readAsDataURL(new Blob(ch,{type:'video/webm'}))};mr.start();R=mr;T.m=0;render()}catch(e){alert('Recording is not supported in this browser')}}
function pick(cb,max=256){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader;r.onload=()=>{const im=new Image;im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.8))};im.src=r.result};r.readAsDataURL(f)};i.click()}
const med=m=>!m?'<span class=s>(removed)</span>':m.type=='img'?`<img src="${m.src}">`:`<video src="${m.src}" controls></video>`;
const pickM=cb=>{T.pk=cb;render()},pm=i=>{const cb=T.pk,m=me().media[i];T.pk=0;cb(m);render()};
const pickV=()=>`<div class=ov><div><b>Choose from Photo App</b><div class=gl>${me().media.map((m,i)=>`<div onclick=pm(${i})>${med(m)}</div>`).join('')||'<p>Nothing saved yet. Use ⋮ to screenshot or record.</p>'}</div><button class=g onclick="T.pk=0;render()">Cancel</button></div></div>`;
/* auth */
function authV(){if(V=='login')return`<h1>Major</h1><div class=c><input id=u placeholder=Username><input id=p type=password placeholder=Password><button onclick=login()>Log in</button><button class=g onclick="V='signup';render()">Sign up</button><p id=er class=er></p></div>`;
if(!T.g)return`<h1>Sign up</h1><div class=c><button onclick=goog()>Sign up with Google</button><button class=g onclick="V='login';render()">Back</button><p class=s>Demo: real Google sign-in needs a server, so this only simulates the agree step.</p></div>`;
return`<h1>Create account</h1><div class=c><input id=n placeholder="Name (3–19)"><input id=u placeholder="Username (6–19)"><input id=p type=password placeholder="Password (9–29)"><button onclick=signup()>Create</button><p id=er class=er></p></div>`}
function goog(){if(confirm('Continue with Google and agree to the terms? (demo)')){T.g=1;render()}}
function signup(){const n=$('#n').value.trim(),u=$('#u').value.trim(),p=$('#p').value,e=vName(n)||vUser(u)||vPw(p);if(e)return $('#er').textContent=e;DB.users[u.toLowerCase()]={name:n,pw:hs(p),photo:'',media:[]};DB.cur=u.toLowerCase();save();T={};go('home')}
function login(){const u=DB.users[$('#u').value.trim().toLowerCase()];if(!u||u.pw!=hs($('#p').value))return $('#er').textContent='Wrong username or password';DB.cur=$('#u').value.trim().toLowerCase();save();go('home')}
function logout(){DB.cur=null;G=null;save();V='login';T={};render()}
/* views */
const topBar=()=>`<div class=row><button class=g onclick="T.m=!T.m;render()">⋮</button><b>${esc(me().name)}</b>${R?'<span class=er>● REC</span>':'<span></span>'}</div>${T.m?`<div class=c><button onclick=shot()>📷 Screenshot</button><button onclick=rec()>${R?'■ Stop recording':'⏺ Record'}</button><button class=g onclick=logout()>Log out</button><p class=s>Captures only this app's board.</p></div>`:''}`;
const home=()=>`<h2>Home</h2><div class=c><button class=big onclick="T.pm=!T.pm;render()">▶ Play</button>${T.pm?'<p><button onclick=queue()>Real player</button><button class=g onclick=play(1)>Bot</button></p>':''}</div><div class=c><b>Quick rules</b><p class=s>20 s per move · 3 timeouts = loss · stalemate = loss · A Soldier reaching the last rank can return a lost piece or remove an enemy piece (once each). K King · M Major · G General · C Captain · S Soldier.</p></div>`;
function queue(){T.pm=0;T.q=Date.now();go('queue')}
const queueV=()=>{const s=Math.floor((Date.now()-T.q)/1000);return`<h2>Finding a player…</h2><div class=c><p>Searching ${s}s</p>${s>=12?'<p class=er>No real players found. This build has no server, so online matching is not available.</p><button onclick=play(1)>Play Bot</button>':''}<button class=g onclick="go(\'home\')">Cancel</button></div>`};
function gameV(){const g=G,ck=chk(g.b,g.turn);let h=`<div class=row><span>Turn: <b>${g.turn=='w'?'White (you)':'Black (bot)'}</b> ${ck&&!g.over?'<b class=er>CHECK</b>':''}</span><span>⏱ <b id=tm>${g.t}</b>s</span><span class=s>Timeouts W${g.st.w}/3 B${g.st.b}/3</span></div><div id=bd>`;
for(let r=8;r>=0;r--)for(let c=0;c<11;c++){if(!ok(c,r)){h+='<div class="sq x"></div>';continue}const p=g.b[r][c],m=g.mvs.find(m=>m.x==c&&m.y==r);h+=`<div class="sq ${(c+r)%2?'D':'L'} ${g.sel&&g.sel[0]==c&&g.sel[1]==r?'sel':''} ${m?(m.only?'cp':'mv'):''} ${m&&p?'oc':''}" onclick=cl(${c},${r})>${p?`<div class="pc ${p.c}">${p.t}</div>`:''}</div>`}
h+=`</div><p class=s>Lost — you: ${g.lost.w.join(' ')||'–'} · bot: ${g.lost.b.join(' ')||'–'}<br>Your promotion left: return ${g.pr.w.a?'✗':'✓'} · remove ${g.pr.w.b?'✗':'✓'}${g.rm?'<br><b>Tap an enemy piece to remove it</b>':''}</p>`;
if(g.over)h+=`<div class=c><b>${esc(g.over)}</b></div>`;h+=g.over?'<button onclick=play(1)>Play again</button>':'<button class=g onclick="G.over=\'You resigned\';render()">Resign</button>';h+='<button class=g onclick="go(\'home\')">Home</button>';
if(g.pm)h+=`<div class=ov><div><b>Soldier promoted!</b><p>Choose one:</p>${g.pm.A?g.pm.A.map(t=>`<button onclick="pmA('${t}')">Return ${t}</button>`).join(''):''}${g.pm.B?'<button onclick=pmB()>Remove an enemy piece</button>':''}<button class=g onclick=pmS()>Skip</button></div></div>`;return h}
const about=()=>`<h2>About</h2><div class=c>${[['profile','👤 Profile'],['photos','🖼 Photo App'],['league','🏆 League'],['clan','🛡 Clan']].map(([v,t])=>`<button class=g onclick="go('${v}')">${t}</button>`).join('')}</div>`;
const back=`<button class=g onclick="go('about')">← About</button>`;
const profile=()=>{const u=me();return`${back}<h2>Profile</h2><div class=c>${u.photo?`<img class=lg src="${u.photo}">`:''}<button class=g onclick=pPhoto()>Set photo</button><p class=s>@${DB.cur} (username can't change)</p><input id=n value="${esc(u.name)}"><button onclick=pName()>Save name</button></div><div class=c><b>Change password</b><input id=o type=password placeholder="Old password"><input id=a type=password placeholder="New password"><input id=b type=password placeholder="Confirm new password"><button onclick=pPw()>Change</button></div>`};
const pPhoto=()=>pick(d=>{me().photo=d;save();render()}),pName=()=>{const n=$('#n').value.trim(),e=vName(n);if(e)return alert(e);me().name=n;save();alert('Saved')};
function pPw(){const u=me(),a=$('#a').value,e=vPw(a);if(u.pw!=hs($('#o').value))return alert('Old password is wrong');if(e)return alert(e);if(a!=$('#b').value)return alert('Passwords do not match');u.pw=hs(a);save();alert('Password changed');render()}
const photos=()=>`${back}<h2>Photo App</h2><div class=gl>${me().media.map((m,i)=>`<div>${med(m)}<button class=g onclick=delM(${i})>Delete</button></div>`).join('')||'<p>Use ⋮ at top-left to screenshot or record.</p>'}</div>`;
const delM=i=>{me().media.splice(i,1);save();render()};
/* shorts */
function shorts(){let h='<h2>Shorts</h2><button onclick=post()>+ Post from Photo App</button>';DB.shorts.forEach(s=>{h+=`<div class=c><b>@${s.u}</b><div class=med>${med((DB.users[s.u]||{media:[]}).media.find(m=>m.id==s.mid))}</div><p>${esc(s.cap)}</p><button class=g onclick=lk(${s.id})>${s.l.includes(DB.cur)?'♥':'♡'} ${s.l.length}</button><button class=g onclick=cm(${s.id})>💬 ${s.c.length}</button><button class=g onclick=sh(${s.id})>↗ Share</button>${s.c.map(c=>`<div class=s><b>${esc(c.u)}</b> ${esc(c.t)}</div>`).join('')}</div>`});return h}
const post=()=>pickM(m=>{const cap=prompt('Caption?');if(cap===null)return;DB.shorts.unshift({id:Date.now(),u:DB.cur,mid:m.id,cap,l:[],c:[]});save();render()}),S_=id=>DB.shorts.find(s=>s.id==id);
const lk=id=>{const s=S_(id),i=s.l.indexOf(DB.cur);i<0?s.l.push(DB.cur):s.l.splice(i,1);save();render()},cm=id=>{const t=prompt('Comment');if(t){S_(id).c.push({u:DB.cur,t});save();render()}};
const sh=id=>{const t=`Major short by @${S_(id).u}: ${S_(id).cap}`;navigator.share?navigator.share({text:t}).catch(()=>{}):navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>alert('Copied'))};
/* chat (Discord-style, local) */
const cs=()=>DB.servers.find(x=>x.id==T.sv&&x.mem[DB.cur])||DB.servers.find(x=>x.mem[DB.cur]);
const has=(s,p)=>{if(s.owner==DB.cur)return 1;const r=s.roles.find(r=>r.n==s.mem[DB.cur]);return r&&r.p.includes(p)};
function chat(){const S=DB.servers.filter(s=>s.mem[DB.cur]),s=cs();let h=`<h2>Chat</h2><div class=row><span>${S.map(x=>`<button class="${x==s?'':'g'}" onclick="T.sv=${x.id};T.ch=0;render()">${x.logo?`<img class=lg src="${x.logo}">`:esc(x.name)}</button>`).join('')}<button class=g onclick=mkS()>＋ Server</button></span></div>`;if(!s)return h+'<p class=s>Create a server to start.</p>';
const ci=Math.min(T.ch||0,s.ch.length-1),ch=s.ch[ci];
h+=`<div class=c><b>${esc(s.name)}</b><div>${s.ch.map((c,i)=>`<button class="${i==ci?'':'g'}" onclick="T.ch=${i};render()"># ${esc(c.n)}</button>`).join('')}</div><div class=ms>${ch.m.map(m=>`<div><b>${esc(m.u)}</b> ${m.t?esc(m.t):''}${m.md?`<div class=med style="max-width:240px">${m.md.type=='img'?`<img src="${m.md.src}">`:`<video src="${m.md.src}" controls></video>`}</div>`:''}</div>`).join('')||'<span class=s>No messages</span>'}</div><div class=row style="flex-wrap:nowrap"><input id=mi placeholder="Message"><button onclick=send()>Send</button><button class=g onclick=attach()>📎</button></div>
<div><button class=g onclick="svA('channels')">+ Channel</button><button class=g onclick="svA('roles')">+ Role</button><button class=g onclick="svA('setrole')">Set role</button><button class=g onclick="svA('invite')">Invite</button><button class=g onclick="svA('logo')">Logo</button><button class=g onclick="svA('call')">📞 Call</button></div>
<p class=s>Roles: ${s.roles.map(r=>esc(r.n)+' ['+r.p.join(',')+']').join(' · ')}<br>Members: ${Object.entries(s.mem).map(([u,r])=>u+' ('+esc(r)+')').join(', ')}</p></div>`;return h}
function mkS(){const n=prompt('Server name?');if(!n)return;const id=Date.now();DB.servers.push({id,name:n,logo:'',owner:DB.cur,roles:[{n:'Admin',p:['send','channels','roles','call','logo','invite']},{n:'Member',p:['send','call']}],mem:{[DB.cur]:'Admin'},ch:[{n:'general',m:[]}]});T.sv=id;T.ch=0;save();render()}
function svA(a){const s=cs();const need={setrole:'roles',call:'call'}[a]||a;if(!has(s,need))return alert('You need the "'+need+'" permission');
if(a=='channels'){const n=prompt('Channel name?');if(n){s.ch.push({n,m:[]});T.ch=s.ch.length-1}}
else if(a=='roles'){const n=prompt('Role name?'),p=prompt('Permissions (send,channels,roles,call,logo,invite)?','send');if(n)s.roles.push({n,p:(p||'').split(',').map(x=>x.trim())})}
else if(a=='setrole'){const u=(prompt('Username?')||'').toLowerCase(),r=prompt('Role name?');if(!s.mem[u])return alert('Not in this server');if(!s.roles.find(x=>x.n==r))return alert('No such role');s.mem[u]=r}
else if(a=='invite'){const u=(prompt('Username to invite?')||'').toLowerCase();if(!DB.users[u])return alert('No such user on this device');s.mem[u]=s.mem[u]||'Member'}
else if(a=='logo')return pick(d=>{s.logo=d;save();render()});
else if(a=='call')return alert('Voice calls need a server. Not available in this build.');save();render()}
function send(md){const s=cs();if(!has(s,'send'))return alert('No permission to send');const t=$('#mi')?$('#mi').value.trim():'';if(!t&&!md)return;s.ch[Math.min(T.ch||0,s.ch.length-1)].m.push({u:DB.cur,t,md});save();render()}
const attach=()=>pickM(m=>send(m));
/* league */
function league(){let h=`${back}<h2>League</h2><button onclick=newL()>+ New league</button>`;DB.leagues.filter(l=>l.u==DB.cur).forEach(l=>{const t={};l.teams.forEach(n=>t[n]={p:0,w:0,d:0,l:0,f:0,a:0});l.ms.forEach(m=>{const A=t[m.a],B=t[m.b];if(!A||!B)return;A.p++;B.p++;A.f+=m.x;A.a+=m.y;B.f+=m.y;B.a+=m.x;if(m.x>m.y){A.w++;B.l++}else if(m.x<m.y){B.w++;A.l++}else{A.d++;B.d++}});
const rows=Object.entries(t).map(([n,s])=>({n,...s,gd:s.f-s.a,pts:s.w*3+s.d})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.f-a.f);
h+=`<div class=c><div class=row><b>${esc(l.name)}</b><span><button onclick=addMt(${l.id})>+ Match</button><button class=g onclick=delL(${l.id})>Delete</button></span></div><div class=sc><table><tr><th>#<th>Team<th>P<th>W<th>D<th>L<th>GD<th>Pts</tr>${rows.map((r,i)=>`<tr><td>${i+1}<td>${esc(r.n)}<td>${r.p}<td>${r.w}<td>${r.d}<td>${r.l}<td>${r.gd}<td><b>${r.pts}</b></tr>`).join('')}</table></div>${l.ms.map((m,i)=>`<div class=row><span>${esc(m.a)} <b>${m.x}-${m.y}</b> ${esc(m.b)}</span><span><button class=g onclick=edM(${l.id},${i})>Edit</button><button class=g onclick=rmM(${l.id},${i})>✕</button></span></div>`).join('')}</div>`});return h}
const L_=id=>DB.leagues.find(l=>l.id==id);
function newL(){const n=prompt('League name?');if(!n)return;const t=(prompt('Teams, comma separated (2+)?')||'').split(',').map(x=>x.trim()).filter(Boolean);if(new Set(t).size<2)return alert('Need 2+ different teams');DB.leagues.push({id:Date.now(),u:DB.cur,name:n,teams:[...new Set(t)],ms:[]});save();render()}
const delL=id=>{if(confirm('Delete league?')){DB.leagues=DB.leagues.filter(l=>l.id!=id);save();render()}},rmM=(id,i)=>{L_(id).ms.splice(i,1);save();render()};
function sc(def){const s=prompt('Score (e.g. 2-1)',def);const m=/^(\d+)\s*-\s*(\d+)$/.exec(s||'');return m?[+m[1],+m[2]]:null}
function addMt(id){const l=L_(id),a=prompt('Team A?\n'+l.teams.join(', ')),b=prompt('Team B?');if(!l.teams.includes(a)||!l.teams.includes(b)||a==b)return alert('Pick two different teams from the list');const s=sc();if(!s)return;l.ms.push({a,b,x:s[0],y:s[1]});save();render()}
function edM(id,i){const m=L_(id).ms[i],s=sc(m.x+'-'+m.y);if(!s)return;m.x=s[0];m.y=s[1];save();render()}
/* clan */
function clan(){const u=DB.cur,c=DB.clans.find(c=>c.mem.includes(u));let h=back+'<h2>Clan</h2>';if(!c)return h+'<div class=c><p>You are not in a clan (only 1 allowed).</p><button onclick=mkC()>Create clan</button></div>';
const own=c.owner==u,off=c.off.includes(u),adm=own||off;h+=`<div class=c><div class=row><span>${c.logo?`<img class=lg src="${c.logo}"> `:''}<b>${esc(c.name)}</b></span><span class=s>${c.mem.length}/25 members · officers ${c.off.length}/4</span></div>`;
c.mem.forEach(m=>h+=`<div class=row><span>${esc((DB.users[m]||{}).name||m)} <span class=s>@${m} ${m==c.owner?'👑 owner':c.off.includes(m)?'⭐ officer':''}</span></span><span>${own&&m!=c.owner?`<button class=g onclick="tog('${m}')">${c.off.includes(m)?'Demote':'Make officer'}</button>`:''}${adm&&m!=c.owner&&m!=u&&!(off&&c.off.includes(m))?`<button class=g onclick="kick('${m}')">Kick</button>`:''}</span></div>`);
return h+`${adm?'<button onclick=inv()>Invite</button>':''}${own?'<button class=g onclick=cLogo()>Change logo</button>':''}<button class=g onclick=leave()>Leave</button><p class=s>Invites add the player directly (no server for notifications).</p></div>`}
const myC=()=>DB.clans.find(c=>c.mem.includes(DB.cur));
function mkC(){const n=prompt('Clan name?');if(!n)return;if(bad(n))return alert('No bad words');if(DB.clans.some(c=>c.name.toLowerCase()==n.toLowerCase()))return alert('Name taken');DB.clans.push({id:Date.now(),name:n,logo:'',owner:DB.cur,off:[],mem:[DB.cur]});save();render()}
function inv(){const c=myC(),u=(prompt('Username to invite?')||'').toLowerCase();if(!DB.users[u])return alert('No such user on this device');if(c.mem.length>=25)return alert('Clan is full (25)');if(DB.clans.some(x=>x.mem.includes(u)))return alert('That player is already in a clan');c.mem.push(u);save();render()}
function tog(m){const c=myC(),i=c.off.indexOf(m);if(i>=0)c.off.splice(i,1);else if(c.off.length>=4)return alert('Max 4 officers');else c.off.push(m);save();render()}
const kick=m=>{const c=myC();c.mem=c.mem.filter(x=>x!=m);c.off=c.off.filter(x=>x!=m);save();render()},cLogo=()=>pick(d=>{myC().logo=d;save();render()});
function leave(){const c=myC();if(!confirm('Leave clan?'))return;c.mem=c.mem.filter(x=>x!=DB.cur);c.off=c.off.filter(x=>x!=DB.cur);if(c.owner==DB.cur){if(c.mem.length){c.owner=c.off[0]||c.mem[0];c.off=c.off.filter(x=>x!=c.owner)}else DB.clans=DB.clans.filter(x=>x!=c)}save();render()}
function render(){const m=$('main');$('nav').style.display=DB.cur?'flex':'none';if(!DB.cur){m.innerHTML=authV();return}
m.innerHTML=topBar()+({home,game:gameV,queue:queueV,shorts,chat,about,profile,photos,league,clan}[V]||home)()+(T.pk?pickV():'')}
render();