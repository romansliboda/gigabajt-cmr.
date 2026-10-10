(()=>{'use strict';
const canvas=document.getElementById('scene'),stage=document.getElementById('stage'),label=document.getElementById('status'),bubble=document.getElementById('bubble');
const gl=canvas.getContext('webgl',{antialias:true,alpha:true,preserveDrawingBuffer:false});
if(!gl){label.textContent='Ta przeglądarka nie obsługuje WebGL';return}
const vert=`attribute vec3 p;attribute vec3 n;uniform mat4 mvp;uniform mat4 world;varying vec3 normal;varying vec3 pos;void main(){vec4 w=world*vec4(p,1.);pos=w.xyz;normal=mat3(world)*n;gl_Position=mvp*vec4(p,1.);}`;
const frag=`precision mediump float;varying vec3 normal;varying vec3 pos;uniform vec3 color;uniform float glow;void main(){vec3 N=normalize(normal), L=normalize(vec3(-.5,1.2,1.7));float lit=.33+.67*max(dot(N,L),0.);float spec=pow(max(dot(reflect(-L,N),normalize(vec3(0.,.5,5.)-pos)),0.),22.);vec3 c=color*(glow>0.5?1.:lit)+vec3(spec*.28);if(glow>0.5)c+=color*.25;gl_FragColor=vec4(min(c,vec3(1.)),1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);const atP=gl.getAttribLocation(prog,'p'),atN=gl.getAttribLocation(prog,'n'),uMvp=gl.getUniformLocation(prog,'mvp'),uWorld=gl.getUniformLocation(prog,'world'),uCol=gl.getUniformLocation(prog,'color'),uGlow=gl.getUniformLocation(prog,'glow');
function makeMesh(verts,norms,inds){let p=gl.createBuffer(),n=gl.createBuffer(),i=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(norms),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inds),gl.STATIC_DRAW);return{p,n,i,c:inds.length}}
function sphere(){const v=[],n=[],ix=[],R=18,C=28;for(let y=0;y<=R;y++){let phi=y*Math.PI/R;for(let x=0;x<=C;x++){let theta=x*2*Math.PI/C;let a=Math.sin(phi)*Math.cos(theta),b=Math.cos(phi),c=Math.sin(phi)*Math.sin(theta);v.push(a,b,c);n.push(a,b,c)}}for(let y=0;y<R;y++)for(let x=0;x<C;x++){const j=y*(C+1)+x;ix.push(j,j+C+1,j+1,j+1,j+C+1,j+C+2)}return makeMesh(v,n,ix)}
function cube(){const v=[],n=[],ix=[],faces=[[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],[[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]],[[1,0,0],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],[[-1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],[[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],[[0,-1,0],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]]];faces.forEach(([nn,vs],k)=>{vs.forEach(pt=>{v.push(...pt);n.push(...nn)});let j=k*4;ix.push(j,j+1,j+2,j,j+2,j+3)});return makeMesh(v,n,ix)}
const sph=sphere(),box=cube();
const mat=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function mul(a,b){let o=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o}
function trans(x,y,z){let m=mat();m[12]=x;m[13]=y;m[14]=z;return m}
function scale(x,y,z){let m=mat();m[0]=x;m[5]=y;m[10]=z;return m}
function ry(a){let m=mat(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[8]=s;m[2]=-s;m[10]=c;return m}
function rz(a){let m=mat(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[4]=-s;m[1]=s;m[5]=c;return m}
function perspective(fov,aspect,near,far){const m=new Array(16).fill(0),f=1/Math.tan(fov/2);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=2*far*near/(near-far);return m}
function lookAt(eye,target){let z=normalize(sub(eye,target)),x=normalize(cross([0,1,0],z)),y=cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]}
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],normalize=v=>{let l=Math.hypot(...v)||1;return v.map(a=>a/l)};
const palette={white:[.91,.95,1],blue:[.035,.62,1],dark:[.04,.07,.12],black:[.018,.025,.04],side:[.12,.19,.28],orange:[1,.43,.055],screen:[.1,.53,.66],floor:[.92,.96,1],paper:[.97,.99,1],pink:[.92,.2,.33],sun:[1,.75,.16],green:[.2,.75,.54],gray:[.63,.72,.83]};
let projection,view,mode='tv',weather='rain',temperature=10,elapsed=0,last=0,modeStart=0,returnAt=0,greetText='',tvBroken=false,watchMs=0,lastTouch=0;
function draw(mesh,world,color,glow=0){const mv=mul(view,world),mvp=mul(projection,mv);gl.uniformMatrix4fv(uMvp,false,new Float32Array(mvp));gl.uniformMatrix4fv(uWorld,false,new Float32Array(world));gl.uniform3fv(uCol,palette[color]||color);gl.uniform1f(uGlow,glow);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.vertexAttribPointer(atP,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(atP);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.vertexAttribPointer(atN,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(atN);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.drawElements(gl.TRIANGLES,mesh.c,gl.UNSIGNED_SHORT,0)}
function obj(mesh,parent,x,y,z,sx,sy,sz,color,glow=0,rot=0){let w=mul(parent,mul(trans(x,y,z),mul(ry(rot),scale(sx,sy,sz))));draw(mesh,w,color,glow)}
function robot(t){
 const phase=t-modeStart,driving=mode==='drive',greeting=mode==='hello',working=mode==='work',watching=mode==='tv';
 // One real 3D character with articulated head, eyes, arms and wheels.
 const trip=(phase%9)/9, movingRight=Math.floor(phase/9)%2===0;
 const x=watching?-.35:working?-1.03:greeting?-.80: -1.65+(movingRight?trip:1-trip)*2.55;
 const yaw=watching?1.05:working?.48:greeting?-.04:(movingRight?1.45:-1.45);
 const bob=driving?.035*Math.sin(t*13):watching?-.12:.024*Math.sin(t*2.5);
 const base=mul(trans(x,bob,.22),ry(yaw));
 const neck=mul(base,trans(0,1.05,0));
 const head=mul(neck,mul(ry((watching?.17:0)+.14*Math.sin(t*.85)),rz((working?-.10:0)+.055*Math.sin(t*1.3))));
 // body, shoulder joints, forearms, spherical drive pods
 obj(sph,base,0,.57,0,.49,.56,.39,'white');
 obj(sph,base,0,.64,.37,.125,.135,.065,'blue',1);
 for(const side of [-1,1]){
   obj(sph,base,side*.45,.75,0,.18,.19,.18,'side');
   obj(sph,base,side*.52,.62,.03,.16,.22,.16,'white');
   obj(sph,base,side*.52,.38,.14,.14,.16,.15,'side',0,side*.18+Math.sin(t*2+side)*.08);
   obj(sph,base,side*.27,.22,.03,.29,.27,.30,'white');
   obj(sph,base,side*.27,.17,.29,.22,.20,.12,'side');
   obj(sph,base,side*.27,.17,.40,.16,.15,.042,'blue',1);
 }
 // large rounded head and glossy black curved display
 obj(sph,head,0,.09,0,.81,.62,.59,'white');
 obj(sph,head,0,.04,.49,.65,.48,.23,'black');
 // eyes are on display, blink periodically, glance gently toward TV
 const blinkPhase=t%5.9;
 const blink=blinkPhase>5.64?Math.max(.08,Math.abs(blinkPhase-5.77)*8):1;
 const glance=watching?.03*Math.sin(t*1.1):0;
 for(const side of [-1,1]){
   obj(sph,head,side*.28+glance,.075,.704,.115,.105*blink,.025,'blue',1);
   obj(sph,head,side*.28+glance,.084,.730,.040,.052*blink,.018,'black');
 }
 obj(sph,head,0,-.17,.69,.155,.029,.018,'blue',1);
 for(const side of [-1,1]){
   obj(sph,head,side*.80,.07,-.02,.15,.235,.23,'side');
   obj(sph,head,side*.835,.07,.09,.075,.16,.095,'blue',1);
 }
 obj(sph,head,0,.71,0,.055,.17,.055,'side');
 obj(sph,head,0,.87,0,.105,.11,.105,'blue',1);
 if(working){
   obj(box,base,.26,.55,.72,.48,.37,.025,'paper');
   for(let k=0;k<4;k++)obj(box,base,.26,.68-k*.105,.756,.31,.009,.008,'pink');
   obj(box,base,.64,.47,.76,.016,.22,.018,'blue',0,.32+Math.sin(t*4)*.3);
 }
 if(greeting){
   obj(sph,base,.62,1.18,.15,.17,.20,.16,'white');
   obj(sph,base,.70,1.38,.15,.15,.14,.12,'side');
 }
}
function scenery(t){
 const I=mat();
 // plain white room with a discrete contact floor
 obj(box,I,0,-.29,0,5.7,.06,2.55,'floor');
 obj(sph,I,-.36,-.245,.16,.62,.036,.38,'gray');
 // separate retro TV with convex screen, knobs, legs and illuminated program
 obj(box,I,1.44,.46,-.12,.69,.59,.43,'orange');
 obj(box,I,1.37,.49,.34,.52,.43,.047,'side');
 obj(sph,I,1.35,.49,.392,.44,.36,.039,'dark');
 if(mode==='tv'&&!tvBroken){
   obj(sph,I,1.35,.49,.423,.38,.30,.015,'screen',1);
   obj(box,I,1.35,.35,.445,.35,.065,.01,'green',1);
   obj(sph,I,1.60,.63,.449,.065,.06,.012,'sun',1);
 }else if(tvBroken){obj(sph,I,1.35,.49,.426,.38,.30,.014,'gray');}
 else{obj(sph,I,1.35,.49,.426,.38,.30,.014,'black');}
 for(const ky of [.68,.45,.23])obj(sph,I,1.98,ky,.31,.063,.061,.069,'side');
 for(const side of [-1,1])obj(box,I,1.44+side*.40,-.06,-.16,.085,.19,.10,'orange');
 // thin antenna rods
 obj(box,I,1.36,1.16,-.15,.026,.25,.028,'side');obj(box,I,1.62,1.17,-.15,.026,.25,.028,'side');
 if(weather==='rain'&&mode==='hello'){
   obj(sph,I,-.78,2.56,-.08,.56,.19,.36,'gray');
   for(const side of [-1,0,1])obj(sph,I,-.78+side*.3,2.14,-.08,.045,.14,.05,'blue',1);
 }
 if(weather==='sun'&&mode==='hello')obj(sph,I,-1.90,2.48,-.28,.22,.22,.12,'sun',1);
}

function resize(){const dpi=Math.min(devicePixelRatio||1,2),w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);canvas.width=Math.round(w*dpi);canvas.height=Math.round(h*dpi);gl.viewport(0,0,canvas.width,canvas.height);projection=perspective(Math.PI/3.35,w/h,.1,100);view=lookAt([0,1.30,5.45],[0,.87,0])}
function setMode(m){mode=m;modeStart=elapsed;label.textContent={tv:'Ogląda telewizor — ekran jest włączony',drive:'Jeździ bokiem i obraca się',work:'Czyta i wypełnia CMR',hello:'Cześć! Co słychać?'}[m];bubble.classList.toggle('on',m==='hello');bubble.textContent=weather==='rain'?'Cześć! Dziś pada, około 10°C 🌧️':'Cześć! Dziś słonecznie, około 27°C ☀️';returnAt=m==='hello'?elapsed+6.5:0}
for(let [id,m] of Object.entries({tv:'tv',drive:'drive',cmr:'work',hello:'hello'}))document.getElementById(id).onclick=()=>setMode(m);
document.getElementById('rain').onclick=()=>{weather='rain';temperature=10;setMode('hello')};document.getElementById('sun').onclick=()=>{weather='sun';temperature=27;setMode('hello')};
const greet=()=>setMode('hello');canvas.addEventListener('pointerup',()=>{let now=performance.now();if(now-lastTouch<480)greet();lastTouch=now});canvas.addEventListener('dblclick',greet);
function frame(now){let dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden)elapsed+=dt;if(returnAt&&elapsed>returnAt){returnAt=0;setMode('tv')}if(mode==='tv'&&!document.hidden){watchMs+=dt;if(watchMs>30*60)tvBroken=true}const d=canvas.clientWidth/window.innerWidth;if(canvas.width===0||Math.abs(canvas.width-canvas.clientWidth*devicePixelRatio)>10)resize();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);scenery(elapsed);robot(elapsed);requestAnimationFrame(frame)}
window.addEventListener('resize',resize);resize();setMode('tv');requestAnimationFrame(frame);
})();
