/* Gigabajt Robot v9.6 — podgląd only, offline-friendly. */
(function(){
'use strict';
function init(){
  const root=document.getElementById('gb-robot-box');
  if(!root||root.dataset.ready)return;
  root.dataset.ready='1';
  root.setAttribute('role','button');
  root.setAttribute('tabindex','0');
  root.setAttribute('aria-label','Robocik Gigabajt. Stuknij dwa razy, aby się przywitał.');
  root.innerHTML=`
    <div class="gb-scene">
      <div class="gb-bubble" id="gb-bubble"></div>
      <div class="gb-weather-hint" id="gb-weather-hint"></div>
      <div class="gb-ground"></div>
      <div class="gb-desk" aria-hidden="true"></div>
      <div class="gb-tv-zone" aria-hidden="true">
        <div class="gb-sofa"></div>
        <div class="gb-tv" id="gb-tv"><div class="gb-tv-screen"></div><div class="gb-tv-knobs"></div></div>
      </div>
      <div class="gb-robot side right idle" id="gb-robot">
        <div class="gb-shadow"></div>
        <div class="gb-ant"></div>
        <div class="gb-head">
          <div class="gb-face">
            <div class="gb-front-eyes"><i></i><i></i></div>
            <div class="gb-side-eye"></div>
            <div class="gb-shades"></div>
          </div>
        </div>
        <div class="gb-body">
          <div class="gb-core"></div>
          <div class="gb-arm left"></div>
          <div class="gb-arm right"></div>
          <div class="gb-leg left"></div>
          <div class="gb-leg right"></div>
          <div class="gb-wheel left"></div>
          <div class="gb-wheel right"></div>
          <div class="gb-paper"><span>CMR</span></div>
          <div class="gb-pen"></div>
          <div class="gb-umbrella"></div>
          <div class="gb-scarf"></div>
        </div>
      </div>
    </div>`;

  const robot=root.querySelector('#gb-robot');
  const bubble=root.querySelector('#gb-bubble');
  const weatherHint=root.querySelector('#gb-weather-hint');
  const tv=root.querySelector('#gb-tv');

  let timer=null, returnTimer=null, lastTap=0, paused=false, currentStep=0;
  let currentWeather={type:'rain',temp:10,text:'Co słychać? Dziś deszcz i zimno — 10°C.'};

  const steps=[
    {x:74, dir:'left', pose:'tv', duration:4600},
    {x:61, dir:'left', pose:'move', duration:1800},
    {x:42, dir:'left', pose:'read', duration:2900},
    {x:26, dir:'left', pose:'write', duration:3300},
    {x:40, dir:'right', pose:'move', duration:1800},
    {x:54, dir:'right', pose:'read', duration:2700},
    {x:66, dir:'right', pose:'move', duration:1700},
    {x:74, dir:'left', pose:'tv', duration:5600}
  ];

  function showBubble(text,secs=3.8){
    bubble.textContent=text;
    bubble.classList.add('visible');
    clearTimeout(returnTimer);
    returnTimer=setTimeout(()=>bubble.classList.remove('visible'), secs*1000);
  }

  function applyWeatherVisual(){
    robot.classList.remove('weather-rain','weather-cold','weather-sun','weather-cloud');
    weatherHint.className='gb-weather-hint';
    weatherHint.textContent='';
    const t=Number(currentWeather.temp)||0;
    const kind=currentWeather.type;
    if(kind==='sun' || t>=22){
      robot.classList.add('weather-sun');
      weatherHint.textContent='☀️  Ciepło';
    }else if(kind==='rain' || kind==='snow'){
      robot.classList.add('weather-rain');
      if(t<=10) robot.classList.add('weather-cold');
      weatherHint.textContent=(kind==='snow'?'❄️':'🌧️')+'  '+t+'°C';
    }else if(t<=12){
      robot.classList.add('weather-cold');
      weatherHint.textContent='🌥️  '+t+'°C';
    }else{
      robot.classList.add('weather-cloud');
      weatherHint.textContent='⛅  '+t+'°C';
    }
  }

  function setPose(pose, x, dir){
    robot.classList.remove('move','read','write','tv','front','idle','right','left','side');
    robot.classList.add(dir==='left'?'left':'right');
    if(pose==='greet'){
      robot.classList.add('front');
      robot.style.left='45%';
      tv.classList.add('on');
      return;
    }
    robot.classList.add('side',pose,'idle');
    robot.style.left=x+'%';
    tv.classList.add('on');
  }

  function playStep(index){
    if(paused)return;
    currentStep=(index+steps.length)%steps.length;
    const step=steps[currentStep];
    setPose(step.pose,step.x,step.dir);
    timer=setTimeout(()=>playStep((currentStep+1)%steps.length), step.duration);
  }

  function resolveWeather(){
    return currentWeather;
  }

  function greet(){
    paused=true;
    clearTimeout(timer);
    const w=resolveWeather();
    applyWeatherVisual();
    setPose('greet',45,'right');
    showBubble(w.text,5.2);
    setTimeout(()=>{
      paused=false;
      bubble.classList.remove('visible');
      playStep(currentStep);
    },5200);
  }

  function handleTap(){
    const now=Date.now();
    if(now-lastTap<450){
      lastTap=0;
      greet();
    }else lastTap=now;
  }

  root.addEventListener('pointerup',handleTap);
  root.addEventListener('keydown',e=>{
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      greet();
    }
  });

  window.GBRobot={
    greet,
    setWeather(type,temp,text){
      currentWeather={type:type||'cloud', temp: Number.isFinite(+temp)?+temp:15, text:text || defaultMessage(type, Number.isFinite(+temp)?+temp:15)};
      applyWeatherVisual();
    },
    setColdRain(){ currentWeather={type:'rain',temp:10,text:'Co słychać? Dziś deszcz i zimno — 10°C.'}; applyWeatherVisual(); },
    setSun(){ currentWeather={type:'sun',temp:24,text:'Co słychać? Dziś słonecznie i ciepło — 24°C.'}; applyWeatherVisual(); },
    setCool(){ currentWeather={type:'cloud',temp:14,text:'Co słychać? Dziś chłodno, ale bez deszczu — 14°C.'}; applyWeatherVisual(); },
    pause(){ paused=true; clearTimeout(timer); },
    resume(){ if(paused){ paused=false; playStep(currentStep); } }
  };

  function defaultMessage(type,temp){
    if(type==='sun' || temp>=22) return 'Co słychać? Dziś słonecznie i ciepło — '+temp+'°C.';
    if(type==='rain' || type==='snow') return 'Co słychać? Dziś deszcz i zimno — '+temp+'°C.';
    if(temp<=12) return 'Co słychać? Dziś chłodno — '+temp+'°C.';
    return 'Co słychać? Dziś spokojna pogoda — '+temp+'°C.';
  }

  applyWeatherVisual();
  playStep(0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
