(()=>{'use strict';
const R=document.getElementById('robotMover'),H=document.getElementById('headTurn'),E1=document.getElementById('eyeL'),E2=document.getElementById('eyeR'),G=document.getElementById('greeting'),S=document.getElementById('status'),TV=document.getElementById('televisionContent');
let state='tv',tm=null,greetTimer=null,step=0,lastTap=0;const paths=[{x:120,y:105,rot:-9},{x:285,y:80,rot:12},{x:365,y:150,rot:20},{x:160,y:140,rot:-18},{x:75,y:80,rot:-28},{x:240,y:110,rot:5}];
function position(x,y,deg=0){R.setAttribute("transform",`translate(${x} ${y})`);H.setAttribute("transform",`rotate(${deg} 128 125)`);}
function tv(){state='tv';clearInterval(tm);clearTimeout(greetTimer);G.classList.remove('visible');TV.style.opacity='1';S.textContent='Ogląda telewizor — mruga i porusza głową';position(255,111,14);}
function drive(){state='drive';clearInterval(tm);clearTimeout(greetTimer);G.classList.remove('visible');S.textContent='Porusza się po pokoju';step=0;move();tm=setInterval(move,2900)}
function move(){if(state!=='drive')return;const a=paths[step++%paths.length];position(a.x,a.y,a.rot);}
function hello(){state='hello';clearInterval(tm);clearTimeout(greetTimer);position(252,118,0);G.classList.add('visible');S.textContent='Cześć, co słychać?';greetTimer=setTimeout(tv,3500)}
function blink(){E1.setAttribute('ry','3');E2.setAttribute('ry','3');setTimeout(()=>{E1.setAttribute('ry','27');E2.setAttribute('ry','27')},160)}
setInterval(()=>{if(document.hidden)return;blink();},3800);
setInterval(()=>{if(document.hidden||state!=='tv')return;H.setAttribute("transform",`rotate(${10+Math.sin(Date.now()/1250)*8} 128 125)`)},650);
document.getElementById('tvBtn').onclick=tv;document.getElementById('driveBtn').onclick=drive;document.getElementById('helloBtn').onclick=hello;
document.getElementById('scene').addEventListener('pointerup',()=>{const n=Date.now();if(n-lastTap<420)hello();lastTap=n});
tv();})();
