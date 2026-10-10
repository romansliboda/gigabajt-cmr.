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
let projection,view,mode='tv',weather='sun',temperature=27,elapsed=0,last=0,modeStart=0,returnAt=0,greetText='',tvBroken=false,watchMs=0,lastTouch=0;
function draw(mesh,world,color,glow=0){const mv=mul(view,world),mvp=mul(projection,mv);gl.uniformMatrix4fv(uMvp,false,new Float32Array(mvp));gl.uniformMatrix4fv(uWorld,false,new Float32Array(world));gl.uniform3fv(uCol,palette[color]||color);gl.uniform1f(uGlow,glow);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.vertexAttribPointer(atP,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(atP);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.vertexAttribPointer(atN,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(atN);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.drawElements(gl.TRIANGLES,mesh.c,gl.UNSIGNED_SHORT,0)}
function obj(mesh,parent,x,y,z,sx,sy,sz,color,glow=0,rot=0){let w=mul(parent,mul(trans(x,y,z),mul(ry(rot),scale(sx,sy,sz))));draw(mesh,w,color,glow)}
function robot(t){
 const phase=t-modeStart, driving=mode==='drive', greeting=mode==='hello', watching=mode==='tv';
 const trip=(phase%7)/7, rightward=Math.floor(phase/7)%2===0;
 const x=watching?-.68:greeting?-.72:-1.65+(rightward?trip:1-trip)*2.65;
 const z=watching?.26:greeting?.5: .16+.70*Math.sin(phase*.31);
 const yaw=watching?.88:greeting?0:(rightward?1.22:-1.22);
 const bob=.07*Math.sin(t*2.7);
 const base=mul(trans(x,1.31+bob,z),mul(ry(yaw),rz(.027*Math.sin(t*.95))));
 // One floating head: no body, hands, legs or wheels. Rounded 3D shell.
 obj(sph,base,0,0,-.08,.99,.83,.70,'white');
 obj(sph,base,0,.01,.42,.89,.70,.285,'side');
 obj(sph,base,0,.00,.577,.83,.625,.205,'black');
 // Tiny rounded brow highlight on the top edge of the curved dark display.
 obj(sph,base,-.22,.48,.709,.32,.045,.024,[.20,.25,.31]);
 // Solid blue square eyes inspired by the approved face reference.
 const blink=t%5.4>5.16,eyeH=blink?.035:.225;
 const glance=watching?.05*Math.sin(t*.72):0;
 for(const side of [-1,1]){
   obj(sph,base,side*.32+glance,.025,.769,.235,eyeH,.037,'blue',1);
   obj(sph,base,side*.32+glance-.055,.10,.802,.035,blink?.006:.035,.009,[.57,.95,1],1);
 }
 // Curved metallic golden side caps, rounded and visibly projecting.
 for(const side of [-1,1]){
   obj(sph,base,side*.935,.005,.01,.17,.27,.27,[.75,.59,.34]);
   obj(sph,base,side*1.02,.005,.01,.055,.21,.21,[.80,.69,.45]);
 }
 obj(sph,base,0,.815,-.06,.34,.055,.31,'side');
 // An actual projected contact shadow on the floor, below the floating head.
 const shadow=mul(trans(x,-.18,z),scale(.83,.013,.40));
 draw(sph,shadow,[.67,.72,.78]);
}
function scenery(t){
 const I=mat();
 // Minimal pale floor, no elaborate background or extra props.
 obj(box,I,0,-.28,0,5.5,.045,2.75,'floor');
 // Orange retro TV turned about 25 degrees in perspective, towards the robot.
 const tv=mul(trans(1.54,.53,-.25),ry(-.48));
 obj(box,tv,0,0,0,.75,.60,.46,'orange');
 obj(sph,tv,0,0,.02,.75,.60,.45,'orange');
 obj(box,tv,-.15,.02,.438,.50,.44,.028,'side');
 obj(sph,tv,-.15,.02,.472,.43,.37,.04,'black');
 const on=mode==='tv';
 obj(sph,tv,-.15,.02,.514,.38,.33,.012,on?'screen':'side',on?1:0);
 if(on){
   obj(box,tv,-.15,-.18,.532,.35,.065,.01,'green',1);
   obj(sph,tv,.035,.16,.536,.055,.053,.008,'sun',1);
 }
 for(const ky of [.27,.05,-.18])obj(sph,tv,.53,ky,.40,.061,.056,.054,'side');
 for(const side of [-1,1])obj(box,tv,side*.41,-.63,-.10,.095,.16,.10,'orange');
 obj(box,tv,.06,.70,-.08,.024,.25,.025,'side',0,-.31);
 obj(box,tv,.32,.70,-.08,.024,.25,.025,'side',0,.31);
}
function resize(){const dpi=Math.min(devicePixelRatio||1,2),w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);canvas.width=Math.round(w*dpi);canvas.height=Math.round(h*dpi);gl.viewport(0,0,canvas.width,canvas.height);projection=perspective(Math.PI/3.35,w/h,.1,100);view=lookAt([0,1.43,5.0],[0,.95,0])}
function setMode(m){mode=m;modeStart=elapsed;label.textContent={tv:'Unosi się i ogląda telewizor',drive:'Porusza się po pokoju',work:'Rozgląda się po pokoju',hello:'Cześć, co słychać?'}[m];bubble.classList.toggle('on',m==='hello');bubble.textContent=weather==='rain'?'Cześć! Dziś pada, około 10°C 🌧️':'Cześć! Dziś słonecznie, około 27°C ☀️';returnAt=m==='hello'?elapsed+3.5:0}
for(let [id,m] of Object.entries({tv:'tv',drive:'drive',hello:'hello'}))document.getElementById(id).onclick=()=>setMode(m);

const greet=()=>setMode('hello');canvas.addEventListener('pointerup',()=>{let now=performance.now();if(now-lastTouch<480)greet();lastTouch=now});canvas.addEventListener('dblclick',greet);
function frame(now){let dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden)elapsed+=dt;if(returnAt&&elapsed>returnAt){returnAt=0;setMode('tv')}const d=canvas.clientWidth/window.innerWidth;if(canvas.width===0||Math.abs(canvas.width-canvas.clientWidth*devicePixelRatio)>10)resize();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);scenery(elapsed);robot(elapsed);requestAnimationFrame(frame)}
window.addEventListener('resize',resize);resize();setMode('tv');requestAnimationFrame(frame);
})();
