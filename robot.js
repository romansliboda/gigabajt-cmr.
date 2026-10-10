/* Gigabajt Robot — bez bibliotek, offline; pogoda online tylko za zgodą użytkownika. */
(function(){
'use strict';
function init(){
const root=document.getElementById('gb-robot-box');if(!root||root.dataset.ready)return;root.dataset.ready='1';
root.setAttribute('role','button');root.setAttribute('tabindex','0');root.setAttribute('aria-label','Robocik Gigabajt. Stuknij dwa razy, by się przywitał');
root.innerHTML='<div class="gb-stage"><div class="gb-weather" id="gb-weather">🤖</div><div class="gb-temp" id="gb-temp" hidden></div><div class="gb-msg" id="gb-msg">Cześć, co słychać?</div><div class="gb-floor"></div><div class="gb-robot" id="gb-robot"><div class="gb-head"><div class="gb-ant"></div><div class="gb-face"><i class="gb-eye a"></i><i class="gb-eye b"></i><div class="gb-shades"></div></div></div><div class="gb-body"></div><i class="gb-wheel l"></i><i class="gb-wheel r"></i></div><div class="gb-tv" id="gb-tv"><div class="gb-tv-screen"></div><div class="gb-tv-knob"></div><i class="gb-feet"></i></div><div class="gb-smoke" id="gb-smoke">☁️</div></div>';
const robot=root.querySelector('#gb-robot'),tv=root.querySelector('#gb-tv'),smoke=root.querySelector('#gb-smoke'),msg=root.querySelector('#gb-msg'),w=root.querySelector('#gb-weather'),t=root.querySelector('#gb-temp');
let weather=null,phase=0,mode='roam',activeMs=0,lastTick=Date.now(),greetUntil=0,messageTimeout,broken=false,lastTap=0;
function say(s,d=2500){msg.textContent=s;msg.classList.add('visible');clearTimeout(messageTimeout);messageTimeout=setTimeout(()=>msg.classList.remove('visible'),d)}
function place(p){robot.style.left=p+'%'}
function modeSet(m){mode=m;robot.classList.toggle('watching',m==='tv');robot.classList.toggle('sad',m==='cold');robot.classList.toggle('hot',m==='hot');tv.classList.toggle('on',m==='tv'||m==='cold'||m==='broken');tv.classList.toggle('broken',m==='broken');smoke.classList.toggle('on',m==='broken');if(m==='tv'||m==='cold'||m==='broken'){place(43)}else if(m==='hot'){place(20)} }
function auto(){if(broken){modeSet('broken');return}if(Date.now()<greetUntil)return;if(weather){if(weather.temp<=10||weather.code==='rain'||weather.code==='snow'){modeSet('cold');return}if(weather.temp>=23&&weather.code==='sun'){modeSet('hot');return}}modeSet('roam')}
function greet(){greetUntil=Date.now()+3000;modeSet('greet');place(40);say('Cześć, co słychać?',2500);setTimeout(auto,3100)}
function taps(){let now=Date.now();if(now-lastTap<450){greet();lastTap=0}else lastTap=now}
root.addEventListener('pointerup',taps);root.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();greet()}});
function tick(){const now=Date.now(),delta=Math.min(2000,now-lastTick);lastTick=now;if(document.hidden||root.getClientRects().length===0)return;activeMs+=delta;if(activeMs>=30*60*1000&&!broken){broken=true;modeSet('broken');say('Ojej! Telewizor się zepsuł!',4000)}if(mode==='roam'&&now>=greetUntil){phase=(phase+1)%4;place([9,36,62,29][phase])}}
setInterval(tick,3500); // nalicza tylko czas widocznej karty, bez pracy w tle
function setWeather(code,temp){weather={code,temp};w.textContent={sun:'☀️',rain:'🌧️',cloud:'☁️',snow:'❄️'}[code]||'🌤️';t.hidden=false;t.textContent='🌡️ '+Math.round(temp)+'°C';auto()}
// Pogoda jest opcjonalna: podłącz zewnętrzny serwis wywołując GBRobot.setWeather(...).
window.GBRobot={setWeather,greet,reset(){broken=false;activeMs=0;tv.classList.remove('broken');auto()},demoBurn(){activeMs=30*60*1000;broken=true;modeSet('broken');say('Ojej! Telewizor się zepsuł!',4000)},demoRain(){setWeather('rain',5)},demoSun(){setWeather('sun',27)}};
modeSet('roam');tick();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
