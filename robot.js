/* Gigabajt CMR 9.8: rendered 3D-scene companion. Weather is a demo, not a live reading. */
(function(){
'use strict';
function init(){
 const root=document.getElementById('gb-robot-box');if(!root||root.dataset.ready)return;
 root.dataset.ready='1';root.tabIndex=0;root.setAttribute('role','button');
 root.setAttribute('aria-label','Robocik Gigabajt — stuknij dwa razy, żeby się przywitał');
 root.innerHTML='<div class="gb-scene3d rain"><img src="./robot-rain.webp" alt="Robocik 3D ogląda telewizor w deszczowy dzień"></div><div class="gb-scene3d sun"><img src="./robot-sun.webp" alt="Robocik 3D w okularach ogląda telewizor w słoneczny dzień"></div><div class="gb-scene3d greet"><img src="./robot-greet.webp" alt="Robocik 3D macha na przywitanie"></div><div class="gb-robot-dialog" aria-live="polite"></div><span class="gb-demo-note">Pogoda: demonstracja</span>';
 const scenes=Array.from(root.querySelectorAll('.gb-scene3d')),dialog=root.querySelector('.gb-robot-dialog');
 let current=0,previous=0,tap=0,paused=false,restore=null;
 function show(i){scenes.forEach((s,n)=>s.classList.toggle('visible',n===i));current=i;}
 function greet(){previous=current;paused=true;clearTimeout(restore);show(2);dialog.textContent='Cześć! Co słychać? 🤖';dialog.classList.add('visible');restore=setTimeout(()=>{dialog.classList.remove('visible');paused=false;show(previous);},6500);}
 root.addEventListener('pointerup',()=>{const now=Date.now();if(now-tap<460){tap=0;greet();}else tap=now;});
 root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();greet();}});
 show(0);setInterval(()=>{if(paused||document.hidden||!root.getClientRects().length)return;show(current===0?1:0);},13000);
 window.GBRobot={greet,showRain(){paused=false;show(0);},showSun(){paused=false;show(1);},setWeather(code,temp){if(code==='sun'||+temp>=23)this.showSun();else this.showRain();}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
